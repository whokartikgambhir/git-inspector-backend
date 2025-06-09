// external dependencies
import { Octokit } from "@octokit/rest";
import request from "supertest";
import { expect } from "chai";
import sinon, { SinonSandbox } from "sinon";

import app from "../index";
import { API_ENDPOINTS, MESSAGES, STATUS_CODES } from "../common/constants";
import * as userModule from "../models/user";
import * as cryptoUtils from "../utils/crypto";
import * as githubClient from "../utils/githubClient";

describe(`POST ${API_ENDPOINTS.AUTH}`, () => {
  let sandbox: SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("returns 200 and user info on valid PAT", async () => {
    const mockUserName = "whokartikgambhir";
    const mockEmail = "kartik@example.com";
    const mockPAT = "valid-token";

    const mockedOctokit = {
      users: {
        getAuthenticated: sandbox.stub().resolves({
          data: {
            login: mockUserName,
            email: mockEmail,
          },
        }),
      },
    };

    sandbox
      .stub(githubClient, "createOctokitClient")
      .resolves(mockedOctokit as unknown as Octokit);
    // sandbox.stub(githubClient, "createOctokitClient").returns(mockedOctokit);
    sandbox
      .stub(cryptoUtils, "encrypt")
      .returns({ iv: "iv", content: "encrypted-token", tag: "tag" });
    sandbox.stub(userModule.default, "findOneAndUpdate").resolves({
      userName: mockUserName,
      email: mockEmail,
    });

    const res = await request(app)
      .post(API_ENDPOINTS.AUTH)
      .send({ pat: mockPAT });

    expect(res.status).to.equal(STATUS_CODES.OK);
    expect(res.body.message).to.equal(MESSAGES.AUTH_SUCCESS);
    expect(res.body.user).to.deep.equal({
      userName: mockUserName,
      email: mockEmail,
    });
  });

  it("returns 400 if PAT is missing", async () => {
    const res = await request(app).post(API_ENDPOINTS.AUTH).send({});
    expect(res.status).to.equal(STATUS_CODES.BAD_REQUEST);
    expect(res.body.error).to.equal(MESSAGES.MISSING_TOKEN);
  });

  it("returns 401 on GitHub auth failure", async () => {
    const mockPAT = "invalid-token";

    const mockedOctokit = {
      users: {
        getAuthenticated: sandbox.stub().rejects({
          status: 401,
          message: "Bad credentials",
        }),
      },
    };

    sandbox
      .stub(githubClient, "createOctokitClient")
      .resolves(mockedOctokit as unknown as Octokit);
    //sandbox.stub(githubClient, "createOctokitClient").returns(mockedOctokit);

    const res = await request(app)
      .post(API_ENDPOINTS.AUTH)
      .send({ pat: mockPAT });

    expect(res.status).to.equal(STATUS_CODES.UNAUTHORIZED);
    expect(res.body.error).to.equal(MESSAGES.INVALID_TOKEN);
  });

  it("returns 429 if GitHub rate limit is exceeded", async () => {
    const mockPAT = "rate-limited-token";

    const mockedOctokit = {
      users: {
        getAuthenticated: sandbox.stub().rejects({
          status: 403,
          headers: {
            "x-ratelimit-remaining": "0",
            "x-ratelimit-reset": `${Math.floor(Date.now() / 1000) + 60}`,
          },
        }),
      },
    };

    sandbox
      .stub(githubClient, "createOctokitClient")
      .resolves(mockedOctokit as unknown as Octokit);

    const res = await request(app)
      .post(API_ENDPOINTS.AUTH)
      .send({ pat: mockPAT });

    expect(res.status).to.equal(STATUS_CODES.TOO_MANY_REQUESTS);
    expect(res.body.error).to.include("GitHub rate limit exceeded");
  });

  it("ensures User.findOneAndUpdate is called correctly", async () => {
    const mockUserName = "kartik";
    const mockPAT = "valid-pat";
    const mockEmail = "mail@example.com";

    const mockedOctokit = {
      users: {
        getAuthenticated: sandbox.stub().resolves({
          data: {
            login: mockUserName,
            email: mockEmail,
          },
        }),
      },
    };

    sandbox
      .stub(githubClient, "createOctokitClient")
      .resolves(mockedOctokit as unknown as Octokit);
    sandbox
      .stub(cryptoUtils, "encrypt")
      .returns({ iv: "iv", content: "encrypted-pat", tag: "tag" });

    const updateSpy = sandbox
      .stub(userModule.default, "findOneAndUpdate")
      .resolves({
        userName: mockUserName,
        email: mockEmail,
      });

    await request(app).post(API_ENDPOINTS.AUTH).send({ pat: mockPAT });

    sinon.assert.calledWith(
      updateSpy,
      { userName: mockUserName },
      { email: mockEmail, encryptedPat: "encrypted-pat" },
      { new: true, upsert: true }
    );
  });

  it("returns valid user when GitHub response has null email", async () => {
    const mockUserName = "kartik";
    const mockPAT = "null-email-pat";

    const mockedOctokit = {
      users: {
        getAuthenticated: sandbox.stub().resolves({
          data: {
            login: mockUserName,
            email: null,
          },
        }),
      },
    };

    sandbox
      .stub(githubClient, "createOctokitClient")
      .resolves(mockedOctokit as unknown as Octokit);
    sandbox
      .stub(cryptoUtils, "encrypt")
      .returns({ iv: "iv", content: "secret", tag: "tag" });
    sandbox.stub(userModule.default, "findOneAndUpdate").resolves({
      userName: mockUserName,
      email: undefined,
    });

    const res = await request(app)
      .post(API_ENDPOINTS.AUTH)
      .send({ pat: mockPAT });

    expect(res.status).to.equal(STATUS_CODES.OK);
    expect(res.body.user).to.deep.equal({
      userName: mockUserName,
      email: undefined,
    });
  });

  it("handles database failure", async () => {
    const mockPAT = "db-error-pat";

    const mockedOctokit = {
      users: {
        getAuthenticated: sandbox.stub().resolves({
          data: {
            login: "kartik",
            email: "test@example.com",
          },
        }),
      },
    };

    sandbox
      .stub(githubClient, "createOctokitClient")
      .resolves(mockedOctokit as unknown as Octokit);
    sandbox
      .stub(cryptoUtils, "encrypt")
      .returns({ iv: "iv", content: "encrypted", tag: "tag" });
    sandbox
      .stub(userModule.default, "findOneAndUpdate")
      .rejects(new Error("DB Error"));

    const res = await request(app)
      .post(API_ENDPOINTS.AUTH)
      .send({ pat: mockPAT });

    expect(res.status).to.equal(STATUS_CODES.UNAUTHORIZED);
    expect(res.body.error).to.equal(MESSAGES.INVALID_TOKEN);
  });
});
