// external dependencies
import sinon from "sinon";
import { expect } from "chai";
import request from "supertest";
import { createServer } from "http";
import { Octokit } from "@octokit/rest";

// internal dependencies
import app from "../index";
import * as dbUtils from "../utils/db";
import * as userModule from "../models/user";
import * as cryptoUtils from "../utils/crypto";
import * as githubClient from "../utils/githubClient";
import { API_ENDPOINTS, MESSAGES, STATUS_CODES } from "../common/constants";

describe(`POST ${API_ENDPOINTS.AUTH}`, () => {
  beforeEach(() => {
    sinon.stub(dbUtils, "connect").resolves();
    sinon.stub(app, "listen").callsFake(() => {
      return createServer();
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  const fullAuthPath = `${API_ENDPOINTS.API}${API_ENDPOINTS.AUTH}`;

  it("returns 200 and user info on valid PAT", async () => {
    const mockUserName = "whokartikgambhir";
    const mockEmail = "kartik@example.com";
    const mockPAT = "valid-token";

    const mockedOctokit = {
      users: {
        getAuthenticated: sinon.stub().resolves({
          data: { login: mockUserName, email: mockEmail },
        }),
      },
    };

    sinon
      .stub(githubClient, "createOctokitClient")
      .resolves(mockedOctokit as unknown as Octokit);
    sinon
      .stub(cryptoUtils, "encrypt")
      .returns({ iv: "iv", content: "encrypted-token", tag: "tag" });
    sinon.stub(userModule.default, "findOneAndUpdate").resolves({
      userName: mockUserName,
      email: mockEmail,
    });

    const res = await request(app).post(fullAuthPath).send({ pat: mockPAT });

    expect(res.status).to.equal(STATUS_CODES.OK);
    expect(res.body.message).to.equal(MESSAGES.AUTH_SUCCESS);
    expect(res.body.user).to.deep.equal({
      userName: mockUserName,
      email: mockEmail,
    });
  });

  it("returns 400 if PAT is missing", async () => {
    const res = await request(app).post(fullAuthPath).send({});
    expect(res.status).to.equal(STATUS_CODES.BAD_REQUEST);
    expect(res.body.error).to.equal(
      "PAT must be a non-empty string; pat must be a string"
    );
  });

  it("returns 401 on GitHub auth failure", async () => {
    const mockPAT = "invalid-token";

    const mockedOctokit = {
      users: {
        getAuthenticated: sinon
          .stub()
          .rejects({ status: 401, message: "Bad credentials" }),
      },
    };

    sinon
      .stub(githubClient, "createOctokitClient")
      .resolves(mockedOctokit as unknown as Octokit);

    const res = await request(app).post(fullAuthPath).send({ pat: mockPAT });

    expect(res.status).to.equal(STATUS_CODES.UNAUTHORIZED);
    expect(res.body.error).to.equal(MESSAGES.INVALID_TOKEN);
  });

  it("returns 429 if GitHub rate limit is exceeded", async () => {
    const mockPAT = "rate-limited-token";

    const mockedOctokit = {
      users: {
        getAuthenticated: sinon.stub().rejects({
          status: 403,
          headers: {
            "x-ratelimit-remaining": "0",
            "x-ratelimit-reset": `${Math.floor(Date.now() / 1000) + 60}`,
          },
        }),
      },
    };

    sinon
      .stub(githubClient, "createOctokitClient")
      .resolves(mockedOctokit as unknown as Octokit);

    const res = await request(app).post(fullAuthPath).send({ pat: mockPAT });

    expect(res.status).to.equal(STATUS_CODES.TOO_MANY_REQUESTS);
    expect(res.body.error).to.include("GitHub rate limit exceeded");
  });

  it("ensures User.findOneAndUpdate is called correctly", async () => {
    const mockUserName = "kartik";
    const mockPAT = "valid-pat";
    const mockEmail = "mail@example.com";

    const mockedOctokit = {
      users: {
        getAuthenticated: sinon.stub().resolves({
          data: { login: mockUserName, email: mockEmail },
        }),
      },
    };

    sinon
      .stub(githubClient, "createOctokitClient")
      .resolves(mockedOctokit as unknown as Octokit);
    sinon
      .stub(cryptoUtils, "encrypt")
      .returns({ iv: "iv", content: "encrypted-pat", tag: "tag" });

    const updateSpy = sinon
      .stub(userModule.default, "findOneAndUpdate")
      .resolves({
        userName: mockUserName,
        email: mockEmail,
      });

    await request(app).post(fullAuthPath).send({ pat: mockPAT });

    sinon.assert.calledWith(
      updateSpy,
      { userName: mockUserName },
      {
        email: mockEmail,
        encryptedPat: { iv: "iv", content: "encrypted-pat", tag: "tag" },
      },
      { new: true, upsert: true }
    );
  });

  it("returns valid user when GitHub response has null email", async () => {
    const mockUserName = "kartik";
    const mockPAT = "null-email-pat";

    const mockedOctokit = {
      users: {
        getAuthenticated: sinon.stub().resolves({
          data: { login: mockUserName, email: null },
        }),
      },
    };

    sinon
      .stub(githubClient, "createOctokitClient")
      .resolves(mockedOctokit as unknown as Octokit);
    sinon
      .stub(cryptoUtils, "encrypt")
      .returns({ iv: "iv", content: "secret", tag: "tag" });
    sinon.stub(userModule.default, "findOneAndUpdate").resolves({
      userName: mockUserName,
      email: undefined,
    });

    const res = await request(app).post(fullAuthPath).send({ pat: mockPAT });

    expect(res.status).to.equal(STATUS_CODES.OK);
    expect(res.body.user).to.deep.equal({
      userName: mockUserName,
    });
  });

  it("handles database failure", async () => {
    const mockPAT = "db-error-pat";

    const mockedOctokit = {
      users: {
        getAuthenticated: sinon.stub().resolves({
          data: { login: "kartik", email: "test@example.com" },
        }),
      },
    };

    sinon
      .stub(githubClient, "createOctokitClient")
      .resolves(mockedOctokit as unknown as Octokit);
    sinon
      .stub(cryptoUtils, "encrypt")
      .returns({ iv: "iv", content: "encrypted", tag: "tag" });
    sinon
      .stub(userModule.default, "findOneAndUpdate")
      .rejects(new Error("DB Error"));

    const res = await request(app).post(fullAuthPath).send({ pat: mockPAT });

    expect(res.status).to.equal(STATUS_CODES.UNAUTHORIZED);
    expect(res.body.error).to.equal(MESSAGES.INVALID_TOKEN);
  });

  it("returns 500 if encrypt throws an error", async () => {
    const mockUserName = "kartik";
    const mockPAT = "pat-error";

    const mockedOctokit = {
      users: {
        getAuthenticated: sinon.stub().resolves({
          data: { login: mockUserName, email: "mail@example.com" },
        }),
      },
    };

    sinon
      .stub(githubClient, "createOctokitClient")
      .resolves(mockedOctokit as unknown as Octokit);
    sinon.stub(cryptoUtils, "encrypt").throws(new Error("Encryption failure"));

    const res = await request(app).post(fullAuthPath).send({ pat: mockPAT });

    expect(res.status).to.equal(STATUS_CODES.UNAUTHORIZED);
    expect(res.body.error).to.equal(MESSAGES.INVALID_TOKEN);
  });

  it("returns 500 if createOctokitClient throws", async () => {
    const mockPAT = "fail-create-client";

    sinon
      .stub(githubClient, "createOctokitClient")
      .throws(new Error("Failed to load Octokit"));

    const res = await request(app).post(fullAuthPath).send({ pat: mockPAT });

    expect(res.status).to.equal(STATUS_CODES.INTERNAL_SERVER_ERROR);
    expect(res.body.error).to.equal("Failed to load Octokit");
  });
});
