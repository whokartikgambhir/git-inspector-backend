// external dependencies
import type { Response } from "express";

// internal dependencies
import { APIError, AuthenticatedRequest, GitHubPR } from "../common/types.js";
import { fetchDeveloperPRStats } from "../services/devService.js";
import {
  STATUS_CODES,
  MESSAGES,
  GITHUB_STATES,
  DEFAULT_PAGINATION,
} from "../common/constants.js";

/**
 * Controller to provide analytics for a developer's pull requests
 *
 * @param req - AuthenticatedRequest request object
 * @param res - express response object
 * @returns promise that resolves void
 */
export const getDeveloperAnalyticsController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { developer, page, limit } = req.query;
  const user = req.user;

  if (!user?.token) {
    res
      .status(STATUS_CODES.UNAUTHORIZED)
      .json({ error: MESSAGES.UNAUTHORIZED_USER });
    return;
  }

  if (!developer || typeof developer !== "string") {
    res
      .status(STATUS_CODES.BAD_REQUEST)
      .json({ error: MESSAGES.MISSING_DEVELOPER });
    return;
  }

  const pageNum = Math.max(
    1,
    parseInt(page as string) || DEFAULT_PAGINATION.PAGE
  );
  const limitNum = Math.max(
    1,
    parseInt(limit as string) || DEFAULT_PAGINATION.LIMIT
  );
  const offset = (pageNum - 1) * limitNum;

  try {
    // fetch PR stats from GitHub API
    const data = await fetchDeveloperPRStats(developer, user.token);

    let open = 0,
      closed = 0,
      merged = 0;
    const mergeTimes: number[] = [];

    // map and analyze all PRs
    const allPrs = (data.items as GitHubPR[]).map((pr) => {
      const isOpen = pr.state === GITHUB_STATES.OPEN;
      const isMerged = pr.pull_request?.merged_at !== null;
      const isClosed = pr.state === GITHUB_STATES.CLOSED && !isMerged;

      if (isOpen) open++;
      if (isMerged && pr.pull_request && pr.pull_request.merged_at) {
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

    // paginate PRs for response
    const paginatedPRs = allPrs.slice(offset, offset + limitNum);

    // calculate average merge time in a human-readable format
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

    // calculate merge success rate as a percentage
    const successRate =
      closed + merged > 0 ? (merged / (closed + merged)) * 100 : 0;

    res.status(STATUS_CODES.OK).json({
      developer,
      page: pageNum,
      limit: limitNum,
      totalPRs: data.total_count,
      openPRs: open,
      closedPRs: closed,
      mergedPRs: merged,
      averageMergeTime,
      successRate: `${successRate.toFixed(2)}%`,
      prs: paginatedPRs,
    });
  } catch (error) {
    const err = error as APIError;
    console.error("Developer analytics error:", err.message);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};
