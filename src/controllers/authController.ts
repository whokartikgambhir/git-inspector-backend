// external dependencies
import type { Request, Response, NextFunction } from "express";

// internal dependencies
import { createOctokitClient } from "../utils/githubClient.js";
import User, { IUser } from "../models/user.js";
import logger from "../utils/logger.js";
import { encrypt } from "../utils/crypto.js";
import { APIError } from "../common/types.js";
import { STATUS_CODES, MESSAGES } from "../common/constants.js";

/**
 * Validates the GitHub Personal Access Token (PAT), encrypts it and stores on user record
 *
 * @param req - express request object
 * @param res - express response object
 * @returns promise that resolves void
 */
export const validateGitHubPAT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { pat } = req.body;

  if (!pat) {
    res
      .status(STATUS_CODES.BAD_REQUEST)
      .json({ error: MESSAGES.MISSING_TOKEN });
    return;
  }

  const octokit = await createOctokitClient(pat);

  try {
    // fetch authenticated user's data from GitHub
    const { data: userData } = await octokit.users.getAuthenticated();
    const userName = userData.login;
    const email = userData.email || undefined;

    // encrypt the PAT
    const encrypted = encrypt(pat);

    // upsert the user, storing the encrypted PAT
    const user = await User.findOneAndUpdate(
      { userName },
      { email, encryptedPat: encrypted },
      { new: true, upsert: true }
    ) as IUser;

    logger.info(`user: ${userData.login}, PAT validated successfully`);
    res.status(STATUS_CODES.OK).json({
      message: MESSAGES.AUTH_SUCCESS,
      user: {
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (error) {
    const err = error as APIError;
    // Handle GitHub rate-limit errors
    if (err.status === 403 && err.headers) {
      const remaining = err.headers["x-ratelimit-remaining"];
      const reset = err.headers["x-ratelimit-reset"];
      if (remaining === "0") {
        const resetDate = new Date(Number(reset) * 1000);
        const msg = `GitHub rate limit exceeded. Try again at ${resetDate.toISOString()}`;
        logger.warn(`route: ${req.originalUrl}, ${msg}`);
        res.status(STATUS_CODES.TOO_MANY_REQUESTS).json({ error: msg });
      }
    }
    logger.error(`error: ${err}, PAT validation failed`);
    res
      .status(STATUS_CODES.UNAUTHORIZED)
      .json({ error: MESSAGES.INVALID_TOKEN });
    next(error);
  }
};
