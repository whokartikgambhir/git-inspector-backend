// external dependencies
import express, { Router } from "express";

// internal dependencies
import { API_ENDPOINTS } from "../common/constants.js";
import { checkUserExists } from "../middlewares/validateUser.js";
import { authenticateWithPAT } from "../middlewares/authMiddleware.js";
import { getDeveloperAnalyticsController } from "../controllers/devController.js";
import { GetMetricsDto } from "../common/dtos/pr.dto.js";
import { validateRequest } from "../middlewares/validateRequest.js";

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
