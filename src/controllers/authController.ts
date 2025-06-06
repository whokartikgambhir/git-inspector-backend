// external dependencies
import type { Request, Response } from "express";
import { Octokit } from "@octokit/rest";

// internal dependencies
import User from "../models/user.js";

export const validateGitHubPAT = async (req: Request, res: Response): Promise<void> => {
  const { pat } = req.body;

  if (!pat) {
    return res.status(400).json({ error: "GitHub Personal Access Token (PAT) is required." });
  }

  const octokit = new Octokit({ auth: pat });

  try {
    const { data: userData } = await octokit.users.getAuthenticated();
    const userName = userData.login;

    let user = await User.findOne({ userName });

    if (!user) {
      user = await User.create({ userName });
    }

    res.status(200).json({
      message: "Authenticated successfully",
      user: {
        userName: user.userName
      },
      token: pat
    });
  } catch (error: any) {
    console.error("GitHub PAT validation failed:", error.message);
    res.status(401).json({ error: "Invalid GitHub PAT" });
  }
};
