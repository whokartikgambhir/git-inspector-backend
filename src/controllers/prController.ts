// external dependencies
import type { Request, Response } from "express";

// internal dependencies
import { fetchOpenPullRequests } from "../services/githubService";

export const getOpenPRsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { owner, repo } = req.query;

  if (!owner || !repo) {
    res.status(400).json({ message: "Missing owner or repo" });
    return;
  }

  try {
    const prs = await fetchOpenPullRequests(owner as string, repo as string);
    res.json({ prs });
  } catch (error: any) {
    console.error("Controller error:", error);
    res.status(500).json({ error: error?.message || "Something went wrong" });
  }
};
