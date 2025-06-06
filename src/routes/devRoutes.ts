// external dependencies
import express from "express";

// internal dependencies
import { getDeveloperAnalyticsController } from "../controllers/devController";

const router = express.Router();

router.get("/prs/analytics", getDeveloperAnalyticsController);

export default router;

