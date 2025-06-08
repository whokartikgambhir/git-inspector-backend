// external dependencies
import type { Response } from "express";

// internal dependencies
import {
  fetchOpenPullRequests,
  fetchOpenPullRequestsForAllRepos,
  fetchAllPullRequestsForUser
} from "../services/githubService.js";
import { APIError, AuthenticatedRequest } from "../common/types.js";
import { STATUS_CODES, MESSAGES, GITHUB_STATES, DEFAULT_PAGINATION } from "../common/constants.js";
import logger from "../utils/logger.js";

/**
 * Helper function to paginate an array of items
 * 
 * @param items - array of items to paginate
 * @param page - current page number
 * @param limit - number of items per page
 * @returns paginated array of items
 */
const paginate = <T>(items: T[], page: number, limit: number): T[] => {
  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
};

/**
 * GET /prs/:developer/open - Get open PRs for a developer
 * Controller to get open pull requests for a developer
 * 
 * @param req - AuthenticatedRequest request object
 * @param res - express response object
 * @returns promise that resolves to void
 */
export const getOpenPRsController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { developer } = req.params;
  const { repo, page = DEFAULT_PAGINATION.PAGE, limit = DEFAULT_PAGINATION.LIMIT } = req.query;
  const user = req.user;

  if (!user || !user.token) {
    res.status(STATUS_CODES.UNAUTHORIZED).json({ error: MESSAGES.UNAUTHORIZED_USER });
    return;
  }

  const token = user.token;
  const pageNum = Math.max(1, parseInt(page as string) || DEFAULT_PAGINATION.PAGE);
  const limitNum = Math.max(1, parseInt(limit as string) || DEFAULT_PAGINATION.LIMIT);

  try {
    const allPRs = repo
      ? await fetchOpenPullRequests(developer as string, repo as string, token)
      : await fetchOpenPullRequestsForAllRepos(developer as string, token);

    const paginatedPRs = paginate(allPRs, pageNum, limitNum);

    res.status(STATUS_CODES.OK).json({ prs: paginatedPRs, total: allPRs.length });
  } catch (error) {
    const err = error as APIError;
    logger.error("Controller error:", err.message);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: err.message || MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

/**
 * GET /prs/metrics/:developer - Get PR timing metrics for a developer
 * Controller to get PR timing metrics for a developer
 *
 * @param req - AuthenticatedRequest request object
 * @param res - express response object
 * @returns promise that resolves to void
 */
export const getPRTimingMetricsController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { developer } = req.params;
  const user = req.user;

  if (!user || !user.token) {
    res.status(STATUS_CODES.UNAUTHORIZED).json({ error: MESSAGES.UNAUTHORIZED_USER });
    return;
  }

  const token = user.token;

  try {
    const allPRs = await fetchAllPullRequestsForUser(developer, token);
    const now = new Date().getTime();
    const closedDurations: number[] = [];

    const longestRunningOpenPRs = allPRs
      .filter((pr) => pr.state === GITHUB_STATES.OPEN)
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
      if (pr.state !== GITHUB_STATES.OPEN && pr.closedAt) {
        const closed = new Date(pr.closedAt).getTime();
        closedDurations.push(closed - created);
      }
    }

    const avgCloseOrMergeTime = closedDurations.length
      ? formatExtendedDuration(
          closedDurations.reduce((a, b) => a + b, 0) / closedDurations.length
        )
      : null;

    res.status(STATUS_CODES.OK).json({
      developer,
      avgCloseOrMergeTime,
      longestRunningOpenPRs,
    });
  } catch (error) {
    const err = error as APIError;
    logger.error("PR Timing Metrics error:", err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: err.message || MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

/**
 * Helper Function to format a duration of milliseconds into a human-readable string
 *
 * @param ms - duration in milliseconds
 * @returns human-readable string representation of the duration
 */
const formatExtendedDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds} secs`;

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
