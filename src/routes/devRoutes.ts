// external dependencies
import express, { Router } from "express";

// internal dependencies
import { API_ENDPOINTS } from "../common/constants";
import { checkUserExists } from "../middlewares/validateUser";
import { authenticateWithPAT } from "../middlewares/authMiddleware";
import { getDeveloperAnalyticsController } from "../controllers/devController";
import { GetMetricsDto } from "../common/dtos/pr.dto";
import { validateRequest } from "../middlewares/validateRequest";

const router: Router = express.Router();

// GET /prs/analytics - Developer analytics
// this route provides analytics for a developer's pull requests
router.get(
  API_ENDPOINTS.PRS.ANALYTICS,
  authenticateWithPAT,
  validateRequest(GetMetricsDto),
  checkUserExists,
  getDeveloperAnalyticsController
);

export default router;
