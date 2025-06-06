// external dependencies
import type { Request, Response } from "express";

// internal dependencies
import {
  fetchOpenPullRequests,
  fetchOpenPullRequestsForAllRepos,
  fetchAllPullRequestsForUser
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

export const getPRTimingMetricsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username } = req.params;

  try {
    const allPRs = await fetchAllPullRequestsForUser(username);
    const now = new Date().getTime();
    const closedDurations: number[] = [];

    const longestRunningOpenPRs = allPRs
      .filter((pr) => pr.state === "open")
      .map((pr) => {
        const openDuration = now - new Date(pr.createdAt).getTime();
        const hours = Math.floor(openDuration / (1000 * 60 * 60));
        const minutes = Math.floor((openDuration % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((openDuration % (1000 * 60)) / 1000);

        return {
        title: pr.title,
        author: pr.author,
        createdAt: pr.createdAt,
        status: pr.state,
        repo: pr.pr.split("/pull")[0],
        pr: pr.pr,
        openSince: `${hours} hr: ${minutes} min: ${seconds} sec`
        };
      })
      .sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return aTime - bTime;
      })
      .slice(0, 5);

    for (const pr of allPRs) {
      const created = new Date(pr.createdAt).getTime();
      if (pr.state !== "open" && pr.closedAt) {
        const closed = new Date(pr.closedAt).getTime();
        closedDurations.push(closed - created);
      }
    }

    const formatDuration = (ms: number) => {
      const h = Math.floor(ms / (1000 * 60 * 60));
      const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((ms % (1000 * 60)) / 1000);
      return `${h} hr: ${m} min: ${s} sec`;
    };

    const avgCloseOrMergeTime = closedDurations.length
      ? formatDuration(
          closedDurations.reduce((a, b) => a + b, 0) / closedDurations.length
        )
      : null;

    res.json({
      developer: username,
      avgCloseOrMergeTime,
      longestRunningOpenPRs
    });
  } catch (error: any) {
    console.error("PR Timing Metrics error:", error);
    res.status(500).json({ error: error.message });
  }
};
