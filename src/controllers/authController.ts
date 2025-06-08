// external dependencies
import { Octokit } from "@octokit/rest";
import type { Request, Response } from "express";

// internal dependencies
import User from "../models/user.js";
import { APIError } from "../common/types.js";
import { STATUS_CODES, MESSAGES } from "../common/constants.js";

/**
 * Validates the GitHub Personal Access Token (PAT) provided in the request
 * 
 * @param req - express request object
 * @param res - express response object
 * @returns promise that resolves void
 */
export const validateGitHubPAT = async (req: Request, res: Response): Promise<void> => {
  const { pat } = req.body;

  if (!pat) {
    res.status(STATUS_CODES.BAD_REQUEST).json({ error: MESSAGES.MISSING_TOKEN });
    return;
  }

  const octokit = new Octokit({ auth: pat });

  try {
    // fetch authenticated user's data from GitHub
    const { data: userData } = await octokit.users.getAuthenticated();
    const userName = userData.login;
    const email = userData.email || undefined;

    // check if user already exists in the database
    let user = await User.findOne({ userName });

    // if not, create a new user
    if (!user) {
      user = await User.create({ userName, email });
    }

    res.status(STATUS_CODES.OK).json({
      message: MESSAGES.AUTH_SUCCESS,
      user: {
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (error) {
    const err = error as APIError;
    console.error("GitHub PAT validation failed:", err.message);
    res.status(STATUS_CODES.UNAUTHORIZED).json({ error: MESSAGES.INVALID_TOKEN });
  }
};
