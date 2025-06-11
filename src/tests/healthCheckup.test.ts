// external dependencies
import sinon from "sinon";
import { expect } from "chai";
import request from "supertest";
import mongoose from "mongoose";
import { createServer } from "http";

// internal dependencies
import {
  API_ENDPOINTS,
  DB_STATES,
  MESSAGES,
  STATUS_CODES,
} from "../common/constants";
import app from "../index";
import * as dbUtils from "../utils/db";

describe(`GET ${API_ENDPOINTS.HEALTH_CHECK}`, () => {
  beforeEach(() => {
    sinon.stub(dbUtils, "connect").resolves();
    sinon.stub(app, "listen").callsFake(() => {
      return createServer();
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it("returns 200 + CONNECTED when Mongo is ready", async () => {
    sinon.stub(mongoose, "connection").value({ readyState: 1 });

    const res = await request(app).get(API_ENDPOINTS.HEALTH_CHECK);
    expect(res.status).to.equal(STATUS_CODES.OK);
    expect(res.body.status).to.equal(MESSAGES.STATUS_OK);
    expect(res.body.dbStatus).to.equal(DB_STATES.CONNECTED);
    expect(res.body.uptime).to.be.a("number");
    expect(res.body.timestamp).to.be.a("string");
  });

  it("reports DISCONNECTED when readyState = 0", async () => {
    sinon.stub(mongoose, "connection").value({ readyState: 0 });

    const res = await request(app).get(API_ENDPOINTS.HEALTH_CHECK);
    expect(res.status).to.equal(STATUS_CODES.OK);
    expect(res.body.dbStatus).to.equal(DB_STATES.DISCONNECTED);
  });

  it("returns 500 on exception", async () => {
    sinon.stub(mongoose, "connection").get(() => {
      throw new Error("error");
    });

    const res = await request(app).get(API_ENDPOINTS.HEALTH_CHECK);
    expect(res.status).to.equal(STATUS_CODES.INTERNAL_SERVER_ERROR);
    expect(res.body.status).to.equal(MESSAGES.INTERNAL_SERVER_ERROR);
    expect(res.body.error).to.contain("error");
  });
});
