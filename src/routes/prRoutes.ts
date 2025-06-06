// external dependencies
import express from "express";

// internal dependencies
import { checkUserExists } from "../middlewares/validateUser";
import { getOpenPRsController, getPRTimingMetricsController } from "../controllers/prController";

const router = express.Router();

router.get("/prs/:developer/open", checkUserExists, getOpenPRsController);
router.get("/prs/metrics/:developer", checkUserExists, getPRTimingMetricsController);

export default router;
