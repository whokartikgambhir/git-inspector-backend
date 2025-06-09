// external dependencies
import express, { Router } from "express";

// internal dependencies
import { API_ENDPOINTS } from "../common/constants";
import { checkUserExists } from "../middlewares/validateUser";
import { authenticateWithPAT } from "../middlewares/authMiddleware";
import {
  getOpenPRsController,
  getPRTimingMetricsController,
} from "../controllers/prController";
import { GetPrsDto, GetMetricsDto } from "../common/dtos/pr.dto";
import { validateRequest } from "../middlewares/validateRequest";

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

export default router;
