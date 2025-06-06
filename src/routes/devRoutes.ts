// external dependencies
import express from "express";

// internal dependencies
import { getDeveloperAnalyticsController } from "../controllers/devController";
import { checkUserExists } from "../middlewares/validateUser";

const router = express.Router();

router.get("/prs/analytics", checkUserExists, getDeveloperAnalyticsController);

export default router;
