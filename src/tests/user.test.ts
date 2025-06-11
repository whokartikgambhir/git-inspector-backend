// external dependencies
import sinon from "sinon";
import { expect } from "chai";
import request from "supertest";
import { createServer } from "http";

// internal dependencies
import app from "../index";
import User from "../models/user";
import * as dbUtils from "../utils/db";
import { API_ENDPOINTS, STATUS_CODES, MESSAGES } from "../common/constants";

describe(`User Routes ${API_ENDPOINTS.USER}`, () => {
  beforeEach(() => {
    sinon.stub(dbUtils, "connect").resolves();
    sinon.stub(app, "listen").callsFake(() => createServer());
  });

  afterEach(() => {
    sinon.restore();
  });

  const userEndpoint = `${API_ENDPOINTS.API}${API_ENDPOINTS.USER}`;

  it("creates a new user", async () => {
    const userPayload = { userName: "testuser", email: "test@example.com" };

    sinon.stub(User, "findOne").resolves(null);
    sinon.stub(User, "create").resolves();

    const res = await request(app).post(userEndpoint).send(userPayload);

    expect(res.status).to.equal(STATUS_CODES.CREATED);
    expect(res.body.message).to.equal(MESSAGES.USER_CREATED);
  });

  it("returns 409 if user already exists", async () => {
    const userPayload = {
      userName: "existinguser",
      email: "exist@example.com",
    };

    sinon.stub(User, "findOne").resolves(userPayload);

    const res = await request(app).post(userEndpoint).send(userPayload);

    expect(res.status).to.equal(STATUS_CODES.CONFLICT);
    expect(res.body.error).to.equal(MESSAGES.USER_EXISTS);
  });

  it("fetches all users", async () => {
    const mockUsers = [
      { userName: "user1", email: "u1@example.com" },
      { userName: "user2", email: "u2@example.com" },
    ];

    sinon.stub(User, "find").resolves(mockUsers);

    const res = await request(app).get(userEndpoint);

    expect(res.status).to.equal(STATUS_CODES.OK);
    expect(res.body).to.deep.equal(mockUsers);
  });

  it("returns 404 if no users found", async () => {
    sinon.stub(User, "find").resolves([]);

    const res = await request(app).get(userEndpoint);

    expect(res.status).to.equal(STATUS_CODES.NOT_FOUND);
    expect(res.body.error).to.equal(MESSAGES.USER_NOT_FOUND);
  });

  it("deletes a user successfully", async () => {
    const userName = "deleteMe";

    sinon.stub(User, "deleteOne").resolves({
      deletedCount: 1,
      acknowledged: false,
    });

    const res = await request(app).delete(userEndpoint).query({ userName });

    expect(res.status).to.equal(STATUS_CODES.OK);
    expect(res.body.message).to.equal(`${MESSAGES.USER_DELETED}: ${userName}`);
  });

  it("returns 404 if user to delete is not found", async () => {
    const userName = "missingUser";

    sinon.stub(User, "deleteOne").resolves({
      deletedCount: 0,
      acknowledged: false,
    });

    const res = await request(app).delete(userEndpoint).query({ userName });

    expect(res.status).to.equal(STATUS_CODES.NOT_FOUND);
    expect(res.body.error).to.equal(`${MESSAGES.USER_NOT_FOUND}: ${userName}`);
  });

  it("returns 400 if userName query param is missing on delete", async () => {
    const res = await request(app).delete(userEndpoint);

    expect(res.status).to.equal(STATUS_CODES.BAD_REQUEST);
    expect(res.body.error).to.equal("userName query parameter is required");
  });
});
