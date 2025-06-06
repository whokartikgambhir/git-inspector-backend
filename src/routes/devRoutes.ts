// external dependencies
import express from "express";

// internal dependencies
import { getDeveloperAnalyticsController } from "../controllers/devController.js";
import { checkUserExists } from "../middlewares/validateUser.js";
import { authenticateWithPAT } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/prs/analytics", authenticateWithPAT, checkUserExists, getDeveloperAnalyticsController);

export default router;
