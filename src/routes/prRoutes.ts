// external dependencies
import express, { Router } from "express";

// internal dependencies
import { API_ENDPOINTS } from "../common/constants.js";
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
  validateRequest(GetPrsDto),
  getOpenPRsController
);

// GET /prs/metrics/:developer - Get PR timing metrics for a developer
// this route provides PR timing metrics for a developer
router.get(
  API_ENDPOINTS.PRS.METRICS,
  validateRequest(GetMetricsDto),
  getPRTimingMetricsController
);

// GET route for comparing developer PR metrics
router.get(
  API_ENDPOINTS.PRS.COMPARE,
  compareDevelopersHandler
);

export default router;
