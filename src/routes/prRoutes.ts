// external dependencies
import express, { Router } from "express";

// internal dependencies
import { API_ENDPOINTS } from "../common/constants.js";
import { checkUserExists } from "../middlewares/validateUser.js";
import { authenticateWithPAT } from "../middlewares/authMiddleware.js";
import {
  getOpenPRsController,
  getPRTimingMetricsController,
  compareDevelopersHandler,
} from "../controllers/prController.js";
import { GetPrsDto, GetMetricsDto } from "../common/dtos/pr.dto.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router: Router = express.Router();

// GET /prs/:developer/open - Get open PRs for a developer
// this route provides open pull requests for a developer, optionally filtered by repository
router.get(
  API_ENDPOINTS.PRS.OPEN,
  authenticateWithPAT,
  validateRequest(GetPrsDto),
  checkUserExists,
  getOpenPRsController
);

// GET /prs/metrics/:developer - Get PR timing metrics for a developer
// this route provides PR timing metrics for a developer
router.get(
  API_ENDPOINTS.PRS.METRICS,
  authenticateWithPAT,
  validateRequest(GetMetricsDto),
  checkUserExists,
  getPRTimingMetricsController
);

// GET route for comparing developer PR metrics
router.get(
  API_ENDPOINTS.PRS.COMPARE,
  authenticateWithPAT,
  compareDevelopersHandler
);

export default router;
