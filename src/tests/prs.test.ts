// external dependencies
import sinon from "sinon";
import proxyquire from "proxyquire";
import { expect } from "chai";
import request from "supertest";
import express, { Application, Response, NextFunction } from "express";

// internal dependencies
import * as prService from "../services/githubService";
import { cache } from "../utils/cache";
import { API_ENDPOINTS, STATUS_CODES, MESSAGES } from "../common/constants";
import { AuthenticatedRequest, MappedPR } from "../common/types";

describe("PR API Endpoints", () => {
  const openPrsEndpoint = `${API_ENDPOINTS.API}/prs/mockuser/open`;
  const metricsEndpoint = `${API_ENDPOINTS.API}/prs/metrics/mockuser`;
  const mockToken = "mock-token";
  const mockDeveloper = "mockuser";

  let app: Application;

  beforeEach(() => {
    const authenticateWithPATStub = (
      req: AuthenticatedRequest,
      _res: Response,
      next: NextFunction
    ) => {
      req.user = { username: mockDeveloper, token: mockToken };
      next();
    };

    const validateRequestStub =
      () => (_req: Request, _res: Response, next: NextFunction) =>
        next();

    const checkUserExistsStub = async (
      _req: Request,
      _res: Response,
      next: NextFunction
    ) => next();

    const prRoutes = proxyquire("../routes/prRoutes", {
      "../middlewares/authMiddleware": {
        authenticateWithPAT: authenticateWithPATStub,
      },
      "../middlewares/validateRequest": {
        validateRequest: validateRequestStub,
      },
      "../middlewares/validateUser": {
        checkUserExists: checkUserExistsStub,
      },
    });

    app = express();
    app.use(express.json());
    app.use(API_ENDPOINTS.API, prRoutes.default);
  });

  afterEach(() => {
    sinon.restore();
    cache.flushAll();
  });

  it("should return open PRs for a valid developer", async () => {
    const mockPRs = [
      {
        title: "Fix login",
        createdAt: new Date().toISOString(),
        state: "open",
        author: "mockuser",
        pr: "url",
        repo: "repo1",
        status: "open",
      },
    ] as MappedPR[];

    sinon.stub(prService, "fetchOpenPullRequestsForAllRepos").resolves(mockPRs);

    const res = await request(app)
      .get(openPrsEndpoint)
      .query({ page: 1, limit: 10 })
      .set("Authorization", `Bearer ${mockToken}`);

    expect(res.status).to.equal(STATUS_CODES.OK);
    expect(res.body.prs).to.be.an("array");
    expect(res.body.total).to.equal(mockPRs.length);
  });

  it("should return PR metrics for a valid developer", async () => {
    const now = new Date().toISOString();
    const mockPRs = [
      {
        title: "Improve tests",
        createdAt: now,
        closedAt: now,
        state: "closed",
        author: "mockuser",
        pr: "url",
        repo: "repo1",
      },
    ] as MappedPR[];
    sinon.stub(prService, "fetchAllPullRequestsForUser").resolves(mockPRs);

    const res = await request(app)
      .get(metricsEndpoint)
      .set("Authorization", `Bearer ${mockToken}`);

    expect(res.status).to.equal(STATUS_CODES.OK);
    expect(res.body.developer).to.equal(mockDeveloper);
    expect(res.body).to.have.property("avgCloseOrMergeTime");
    expect(res.body).to.have.property("longestRunningOpenPRs");
  });

  it("should return 401 if Authorization header is missing", async () => {
    sinon.restore();
    const prRoutes = (await import("../routes/prRoutes")).default;
    const freshApp = express();
    freshApp.use(express.json());
    freshApp.use(API_ENDPOINTS.API, prRoutes);

    const res = await request(freshApp)
      .get(
        `${API_ENDPOINTS.API}${API_ENDPOINTS.PRS.OPEN.replace(
          ":developer",
          "mockuser"
        )}`
      )
      .query({ page: 1, limit: 10 });

    expect(res.status).to.equal(STATUS_CODES.UNAUTHORIZED);
    expect(res.body.error).to.equal(MESSAGES.MISSING_TOKEN);
  });

  it("should return 500 on service error", async () => {
    sinon
      .stub(prService, "fetchOpenPullRequestsForAllRepos")
      .throws(new Error("Service error"));

    const res = await request(app)
      .get(openPrsEndpoint)
      .query({ page: 1, limit: 10 })
      .set("Authorization", `Bearer ${mockToken}`);

    expect(res.status).to.equal(STATUS_CODES.INTERNAL_SERVER_ERROR);
    expect(res.body.error).to.include("Service error");
  });

  it("should return cached open PRs if available", async () => {
    const cacheKey = `openPRs:${JSON.stringify({
      developer: "mockuser",
      limit: 10,
      page: 1,
      repo: undefined,
    })}`;

    const cached = [
      {
        title: "Cached PR",
        createdAt: new Date().toISOString(),
        state: "open",
      },
    ];
    cache.set(cacheKey, cached);

    const res = await request(app)
      .get(openPrsEndpoint)
      .query({ page: 1, limit: 10 })
      .set("Authorization", `Bearer ${mockToken}`);

    expect(res.status).to.equal(STATUS_CODES.OK);
    expect(res.body.prs).to.deep.equal(cached);
  });
});
