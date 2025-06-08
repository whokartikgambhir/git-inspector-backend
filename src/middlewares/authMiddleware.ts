// external dependencies
import { Octokit } from "@octokit/rest";
import { Response, NextFunction } from "express";

// internal dependencies
import { STATUS_CODES, MESSAGES } from "../common/constants.js";
import { APIError, AuthenticatedRequest } from "../common/types.js";

/**
 * Middleware to authenticate requests using GitHub Personal Access Token (PAT)
 * 
 * @param req - AuthenticatedRequest request object
 * @param res - express response object
 * @param next - next middleware function
 * @returns promise that resolves to void
 */
export const authenticateWithPAT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(STATUS_CODES.UNAUTHORIZED).json({ error: MESSAGES.MISSING_TOKEN });
    return;
  }

  const pat = authHeader.split("Bearer ")[1]?.trim();
  if (!pat) {
    res.status(STATUS_CODES.UNAUTHORIZED).json({ error: MESSAGES.INVALID_TOKEN });
    return;
  }

  try {
    // validates PAT by fetching the authenticated user's data from GitHub
    const octokit = new Octokit({ auth: pat });
    const { data } = await octokit.users.getAuthenticated();

    req.user = {
      username: data.login,
      token: pat,
    };

    next();
  } catch (error) {
    const err = error as APIError;
    console.error("GitHub PAT authentication failed:", err.message);
    res.status(STATUS_CODES.UNAUTHORIZED).json({ error: MESSAGES.INVALID_TOKEN });
  }
};
