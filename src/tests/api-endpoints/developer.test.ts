// external dependencies
import sinon from "sinon";
import proxyquire from "proxyquire";
import { expect } from "chai";
import request from "supertest";
import express, { Application, Response, NextFunction } from "express";

// internal dependencies
import * as devService from "../../services/devService";
import { cache } from "../../utils/cache";
import { API_ENDPOINTS, STATUS_CODES, MESSAGES } from "../../common/constants";
import { AuthenticatedRequest } from "../../common/types";

describe(`GET ${API_ENDPOINTS.PRS.ANALYTICS}`, () => {
  const devAnalyticsEndpoint = `${API_ENDPOINTS.API}${API_ENDPOINTS.PRS.ANALYTICS}`;
  const mockToken = "mock-pat";
  const mockDeveloper = "mockuser";

  let app: Application;

  beforeEach(() => {
    // Stub all middleware used in the route
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

    // all middleware stubbed
    const devRoutes = proxyquire("../../routes/devRoutes", {
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
    app.use(API_ENDPOINTS.API, devRoutes.default);
  });

  afterEach(() => {
    sinon.restore();
    cache.flushAll();
  });

  it("returns developer analytics with valid token", async () => {
    const mockPRs = {
      total_count: 2,
      items: [
        {
          title: "Fix bug",
          user: { login: mockDeveloper },
          created_at: new Date(Date.now() - 3600000).toISOString(),
          state: "closed",
          html_url: "https://github.com/repo1/pull/1",
          pull_request: { merged_at: new Date().toISOString() },
        },
        {
          title: "Add feature",
          user: { login: mockDeveloper },
          created_at: new Date(Date.now() - 7200000).toISOString(),
          state: "open",
          html_url: "https://github.com/repo2/pull/2",
        },
      ],
    };

    sinon.stub(devService, "fetchDeveloperPRStats").resolves(mockPRs);

    const res = await request(app)
      .get(devAnalyticsEndpoint)
      .query({ developer: mockDeveloper, page: 1, limit: 10 })
      .set("Authorization", `Bearer ${mockToken}`);

    expect(res.status).to.equal(STATUS_CODES.OK);
    expect(res.body).to.have.property("developer", mockDeveloper);
    expect(res.body).to.have.property("totalPRs", 2);
    expect(res.body).to.have.property("mergedPRs", 1);
    expect(res.body).to.have.property("openPRs", 1);
    expect(res.body).to.have.property("closedPRs", 0);
  });

  it("returns 400 if developer is missing", async () => {
    const res = await request(app)
      .get(devAnalyticsEndpoint)
      .set("Authorization", `Bearer ${mockToken}`);

    expect(res.status).to.equal(STATUS_CODES.BAD_REQUEST);
    expect(res.body.error).to.equal(MESSAGES.MISSING_DEVELOPER);
  });

  it("returns 401 if Authorization header is missing", async () => {
    sinon.restore();

    const devRoutes = (await import("../../routes/devRoutes")).default;
    const freshApp = express();
    freshApp.use(express.json());
    freshApp.use(API_ENDPOINTS.API, devRoutes);

    const res = await request(freshApp)
      .get(devAnalyticsEndpoint)
      .query({ developer: mockDeveloper, page: 1, limit: 10 });

    expect(res.status).to.equal(STATUS_CODES.UNAUTHORIZED);
    expect(res.body.error).to.equal(MESSAGES.MISSING_TOKEN);
  });

  it("returns cached result if available", async () => {
    const mockResponse = { developer: mockDeveloper, totalPRs: 5 };
    const cacheKey = `devAnalytics:${JSON.stringify({
      developer: mockDeveloper,
      limit: 10,
      page: 1,
    })}`;
    cache.set(cacheKey, mockResponse);

    const res = await request(app)
      .get(devAnalyticsEndpoint)
      .query({ developer: mockDeveloper, page: 1, limit: 10 })
      .set("Authorization", `Bearer ${mockToken}`);

    expect(res.status).to.equal(STATUS_CODES.OK);
    expect(res.body).to.deep.equal(mockResponse);
  });
});
