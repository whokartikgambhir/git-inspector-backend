// external dependencies
import type { Request, Response } from "express";

// internal dependencies
import {
  fetchOpenPullRequests,
  fetchOpenPullRequestsForAllRepos,
  fetchAllPullRequestsForUser
} from "../services/githubService.js";

export const getOpenPRsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { developer } = req.params;
  const { repo } = req.query;
  const user = (req as any).user;

   if (!user || !user.token) {
    res.status(401).json({ error: "Unauthorized. No token found." });
    return;
  }

  const token = user.token;

  try {
    const prs = repo
      ? await fetchOpenPullRequests(developer as string, repo as string, token)
      : await fetchOpenPullRequestsForAllRepos(developer as string, token);
    res.json({ prs });
  } catch (error: any) {
    console.error("Controller error:", error);
    res.status(500).json({ error: error?.message || "Something went wrong" });
  }
};

export const getPRTimingMetricsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { developer } = req.params;
   const user = (req as any).user;

   if (!user || !user.token) {
    res.status(401).json({ error: "Unauthorized. No token found." });
    return;
  }

  const token = user.token;

  try {
    const allPRs = await fetchAllPullRequestsForUser(developer, token);
    const now = new Date().getTime();
    const closedDurations: number[] = [];

    const longestRunningOpenPRs = allPRs
      .filter((pr) => pr.state === "open")
      .map((pr) => {
        const openDuration = now - new Date(pr.createdAt).getTime();
        return {
          title: pr.title,
          author: pr.author,
          createdAt: pr.createdAt,
          status: pr.state,
          repo: pr.pr.split("/pull")[0],
          pr: pr.pr,
          openSince: formatExtendedDuration(openDuration)
        };
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(0, 5);

    for (const pr of allPRs) {
      const created = new Date(pr.createdAt).getTime();
      if (pr.state !== "open" && pr.closedAt) {
        const closed = new Date(pr.closedAt).getTime();
        closedDurations.push(closed - created);
      }
    }

    const avgCloseOrMergeTime = closedDurations.length
      ? formatExtendedDuration(
          closedDurations.reduce((a, b) => a + b, 0) / closedDurations.length
        )
      : null;

    res.json({
      developer: developer,
      avgCloseOrMergeTime,
      longestRunningOpenPRs
    });
  } catch (error: any) {
    console.error("PR Timing Metrics error:", error);
    res.status(500).json({ error: error.message });
  }
};

const formatExtendedDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);

  const years = Math.floor(totalSeconds / (60 * 60 * 24 * 365));
  const months = Math.floor((totalSeconds % (60 * 60 * 24 * 365)) / (60 * 60 * 24 * 30));
  const weeks = Math.floor((totalSeconds % (60 * 60 * 24 * 30)) / (60 * 60 * 24 * 7));
  const days = Math.floor((totalSeconds % (60 * 60 * 24 * 7)) / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (years) parts.push(`${years} years`);
  if (months) parts.push(`${months} months`);
  if (weeks) parts.push(`${weeks} weeks`);
  if (days) parts.push(`${days} days`);
  if (hours) parts.push(`${hours} hrs`);
  if (minutes) parts.push(`${minutes} mins`);
  if (seconds) parts.push(`${seconds} secs`);

  return parts.join(", ");
};
