// external dependencies
import express from "express";

// internal dependencies
import { validateGitHubPAT } from "../controllers/authController.js";

const router = express.Router();

router.post("/auth", validateGitHubPAT);

export default router;
