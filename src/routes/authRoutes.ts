// external dependencies
import express, { Router } from "express";

// internal dependencies
import { API_ENDPOINTS } from "../common/constants.js";
import { validateGitHubPAT } from "../controllers/authController.js";
import { ValidateAuthDto } from "../common/dtos/auth.dto.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router: Router = express.Router();

// POST /auth - validate GitHub Personal Access Token (PAT)
// this route checks if the provided PAT is valid and returns user info if successful
router.post(
  API_ENDPOINTS.AUTH,
  validateRequest(ValidateAuthDto),
  validateGitHubPAT
);

export default router;
