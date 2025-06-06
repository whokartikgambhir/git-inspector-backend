// external dependencies
import express from "express";

// internal dependencies
import { checkUserExists } from "../middlewares/validateUser.js";
import { getOpenPRsController, getPRTimingMetricsController } from "../controllers/prController.js";
import { authenticateWithPAT } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/prs/:developer/open", authenticateWithPAT, checkUserExists, getOpenPRsController);
router.get("/prs/metrics/:developer", authenticateWithPAT, checkUserExists, getPRTimingMetricsController);

export default router;
