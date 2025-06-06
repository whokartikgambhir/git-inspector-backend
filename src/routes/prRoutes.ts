// external dependencies
import express from "express";

// internal dependencies
import { getOpenPRsController, getPRTimingMetricsController } from "../controllers/prController";

const router = express.Router();

router.get("/prs/:username/open", getOpenPRsController);
router.get("/prs/metrics/:username", getPRTimingMetricsController);

export default router;
