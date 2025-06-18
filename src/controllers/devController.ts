// external dependencies
import type { Response } from "express";

// internal dependencies
import { generateCacheKey, getCache, setCache } from "../utils/cache";
import { APIError, AuthenticatedRequest, GitHubPR, GitHubSearchResponse } from "../common/types";
import { fetchDeveloperPRStats } from "../services/devService";
import {
  STATUS_CODES,
  MESSAGES,
  GITHUB_STATES,
  DEFAULT_PAGINATION,
} from "../common/constants";
import logger from "../utils/logger";

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

  try {
    // Cache key based on params
    const cacheKey = generateCacheKey("devAnalytics", {
      developer,
      page: pageNum,
      limit: limitNum,
    });
    const cached = await getCache(cacheKey);
    if (cached) {
      res.status(STATUS_CODES.OK).json(cached);
      logger.info("Cache HIT: devAnalytics");
      return;
    }

    // Fetch PR stats
    const data = await fetchDeveloperPRStats(developer, user.token) as GitHubSearchResponse;

    let open = 0;
    let closed = 0;
    let merged = 0;
    const mergeTimes: number[] = [];

    const allPrs = (data.items as GitHubPR[]).map((pr) => {
      const isOpen = pr.state === GITHUB_STATES.OPEN;
      const isMerged = pr.pull_request?.merged_at != null;
      const isClosed = pr.state === GITHUB_STATES.CLOSED && !isMerged;

      if (isOpen) open++;
      if (isMerged) {
        merged++;
        mergeTimes.push(
          new Date(pr.pull_request!.merged_at!).getTime() -
            new Date(pr.created_at).getTime()
        );
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

    const offset = (pageNum - 1) * limitNum;
    const paginatedPRs = allPrs.slice(offset, offset + limitNum);

    const averageMergeTime = mergeTimes.length
      ? (() => {
          const avgMs =
            mergeTimes.reduce((sum, t) => sum + t, 0) / mergeTimes.length;
          const hrs = Math.floor(avgMs / 3600000);
          const mins = Math.floor((avgMs % 3600000) / 60000);
          const secs = Math.floor((avgMs % 60000) / 1000);
          return `${hrs} hr: ${mins} min: ${secs} sec`;
        })()
      : null;

    const successRate =
      merged + closed > 0 ? (merged / (merged + closed)) * 100 : 0;

    const result = {
      developer,
      totalPRs: data.total_count,
      openPRs: open,
      closedPRs: closed,
      mergedPRs: merged,
      averageMergeTime,
      successRate: `${successRate.toFixed(2)}%`,
      prs: paginatedPRs,
    };

    // Store in cache
    await setCache(cacheKey, result, 300); // 5 min TTL

    res.status(STATUS_CODES.OK).json(result);
  } catch (error) {
    const err = error as APIError;
    if (err.status === 403 && err.headers) {
      const remaining = err.headers["x-ratelimit-remaining"];
      const reset = err.headers["x-ratelimit-reset"];
      if (remaining === "0") {
        const resetDate = new Date(Number(reset) * 1000);
        const msg = `GitHub rate limit exceeded. Try again at ${resetDate.toISOString()}`;
        logger.warn(`developer: ${user}, ${msg}`);
        res.status(STATUS_CODES.TOO_MANY_REQUESTS).json({ error: msg });
        return;
      }
    }
    logger.error(`err: ${err}, 'Failed to fetch developer analytics`);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: err.message });
    return;
  }
};
