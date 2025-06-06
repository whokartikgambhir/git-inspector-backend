// external dependencies
import type { Request, Response } from "express";

// internal dependencies
import {
  fetchOpenPullRequests,
  fetchOpenPullRequestsForAllRepos,
} from "../services/githubService";

export const getOpenPRsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username } = req.params;
  const { repo } = req.query;

  try {
    const prs = repo
      ? await fetchOpenPullRequests(username as string, repo as string)
      : await fetchOpenPullRequestsForAllRepos(username as string);
    res.json({ prs });
  } catch (error: any) {
    console.error("Controller error:", error);
    res.status(500).json({ error: error?.message || "Something went wrong" });
  }
};
