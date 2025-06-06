// external dependencies
import type { Request, Response } from "express";

// internal dependencies
import { fetchDeveloperPRStats } from "../services/devService";

export const getDeveloperAnalyticsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { developer } = req.query;

  if (!developer) {
    res.status(400).json({ message: "Missing developer username" });
    return;
  }

  try {
    const data = await fetchDeveloperPRStats(developer as string);

    let open = 0;
    let closed = 0;
    let merged = 0;
    const mergeTimes: number[] = [];

    const prsData = data.items.map((pr: any) => {
      const isOpen = pr.state === "open";
      const isMerged =
        pr.pull_request?.merged_at !== null &&
        pr.pull_request?.merged_at !== undefined;
      const isClosed = pr.state === "closed" && !isMerged;

      if (isOpen) open++;
      if (isMerged) {
        merged++;
        const created = new Date(pr.created_at);
        const mergedAt = new Date(pr.pull_request.merged_at);
        mergeTimes.push(mergedAt.getTime() - created.getTime());
      }
      if (isClosed) closed++;

      return {
        title: pr.title,
        author: pr.user?.login,
        createdAt: pr.created_at,
        status: pr.state,
        repo: pr.html_url.split("/pull")[0],
        pr: pr.html_url,
      };
    });

    const averageMergeTime = mergeTimes.length
      ? (() => {
          const avgMs =
            mergeTimes.reduce((a, b) => a + b, 0) / mergeTimes.length;

          const hours = Math.floor(avgMs / (1000 * 60 * 60));
          const minutes = Math.floor((avgMs % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((avgMs % (1000 * 60)) / 1000);

          return `${hours} hr: ${minutes} min: ${seconds} sec`;
        })()
      : null;

    const successRate =
      closed + merged > 0 ? (merged / (closed + merged)) * 100 : 0;

    res.json({
      developer,
      openPRs: open,
      closedPRs: closed,
      mergedPRs: merged,
      totalPRs: data.total_count,
      averageMergeTime,
      successRate: `${successRate.toFixed(2)}%`,
      prs: prsData,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
