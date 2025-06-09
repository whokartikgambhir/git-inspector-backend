import { Response, NextFunction } from "express";

// internal dependencies
import { STATUS_CODES, MESSAGES } from "../common/constants";
import { APIError, AuthenticatedRequest } from "../common/types";
import logger from "../utils/logger";

/**
 * Middleware to authenticate requests using GitHub Personal Access Token (PAT)
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
    // 💡 Dynamically import Octokit to support ESM in CommonJS
    const { Octokit } = await import("@octokit/rest");
    const octokit = new Octokit({ auth: pat });

    const { data } = await octokit.users.getAuthenticated();

    req.user = {
      username: data.login,
      token: pat,
    };

    next();
  } catch (error) {
    const err = error as APIError;
    logger.error("GitHub PAT authentication failed:", err.message);
    res.status(STATUS_CODES.UNAUTHORIZED).json({ error: MESSAGES.INVALID_TOKEN });
  }
};
