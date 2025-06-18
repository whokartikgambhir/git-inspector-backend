// internal dependencies
import logger from "../utils/logger.js";
import { GITHUB_STATES } from "../common/constants.js";
import { githubClient } from "../utils/githubClient.js";
import { APIError, GitHubPR, GitHubRepo, MappedPR } from "../common/types.js";

/**
 * Helper function to map a GitHub PR object to a simplified format
 * 
 * @param pr - pull request object from the GitHub API
 * @param repoName - name of the repository the pull request belongs to
 * @returns mapped pull request object
 */
function mapPR(pr: GitHubPR, repoName: string): MappedPR {
  return {
    title: pr.title,
    author: pr.user?.login,
    createdAt: pr.created_at,
    closedAt: pr.closed_at,
    status: pr.state,
    state: pr.state,
    repo: repoName,
    pr: pr.html_url,
  };
}

/**
 * Fetches open pull requests for a specific repository from the GitHub API
 * 
 * @param owner - owner of the repository
 * @param repo - name of the repository
 * @param token - gitHub Personal Access Token (PAT) for authentication
 * @returns list of open pull requests for the specified repository
 */
export const fetchOpenPullRequests = async (
  owner: string,
  repo: string,
  token: string
): Promise<MappedPR[]> => {
  try {
    const client = githubClient(token);
    const { data } = await client.get<GitHubPR[]>(`/repos/${owner}/${repo}/pulls`, {
      params: {
        state: GITHUB_STATES.OPEN,
      },
    });

    return data.map((pr) => mapPR(pr, repo));
  } catch (error) {
    const err = error as APIError;
    logger.error(`GitHub API error (repo-specific):`, err);
    throw new Error(err?.message || "GitHub API call failed");
  }
};

/**
 * Fetches open pull requests for all repositories owned by a specific user from the GitHub API
 *
 * @param owner - owner of the repositories
 * @param token - gitHub Personal Access Token (PAT) for authentication
 * @returns list of open pull requests for all repositories owned by the user
 */
export const fetchOpenPullRequestsForAllRepos = async (
  owner: string,
  token: string
): Promise<MappedPR[]> => {
  try {
    const client = githubClient(token);
    const { data: repos } = await client.get<GitHubRepo[]>(`/users/${owner}/repos`);

    const allPRsResults = await Promise.allSettled(
      repos.map(async (repo) => {
        const { data: prs } = await client.get<GitHubPR[]>(
          `/repos/${owner}/${repo.name}/pulls`,
          {
            params: { state: GITHUB_STATES.OPEN },
          }
        );
        return prs.map((pr) => mapPR(pr, repo.name));
      })
    );

    // flatten and filter out failed results
    return allPRsResults
      .filter((result): result is PromiseFulfilledResult<MappedPR[]> => result.status === "fulfilled")
      .flatMap((result) => result.value);
  } catch (error) {
    const err = error as APIError;
    logger.error(`GitHub API error (owner-level):`, err.message);
    throw new Error(err.message || "Failed to fetch repos or PRs");
  }
};

/**
 * Fetches all pull requests for a specific user from the GitHub API
 *
 * @param userName - gitHub username of the user
 * @param token - gitHub Personal Access Token (PAT) for authentication
 * @returns list of all pull requests for the specified user
 */
export const fetchAllPullRequestsForUser = async (
  userName: string,
  token: string
): Promise<MappedPR[]> => {
  const client = githubClient(token);
  const { data: repos } = await client.get<GitHubRepo[]>(`/users/${userName}/repos`);

  const allPRsResults = await Promise.allSettled(
    repos.map(async (repo) => {
      const { data: prs } = await client.get<GitHubPR[]>(
        `/repos/${repo.owner.login}/${repo.name}/pulls`,
        {
          params: { state: "all" },
        }
      );
      return prs.map((pr) => mapPR(pr, repo.name));
    })
  );

  return allPRsResults
    .filter((result): result is PromiseFulfilledResult<MappedPR[]> => result.status === "fulfilled")
    .flatMap((result) => result.value);
};
