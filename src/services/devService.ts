// internal dependencies
import logger from "../utils/logger";
import { APIError } from "../common/types";
import { API_ENDPOINTS } from "../common/constants";
import { githubClient } from "../utils/githubClient";

/**
 * Fetches pull request statistics for a given developer from the GitHub API
 * 
 * @param developer - gitHub username of the developer
 * @param token - gitHub Personal Access Token (PAT) for authentication
 * @returns raw data returned by the GitHub Search API
 * @throws error if the API call fails
 */
export const fetchDeveloperPRStats = async (developer: string, token: string) => {
  try {
    const client = githubClient(token);
    const { data } = await client.get(API_ENDPOINTS.SEARCH.ISSUES, {
      params: {
        // search for PRs authored by the developer
        q: `type:pr author:${developer}`
      },
    });

    return data;
  } catch (error) {
    const err = error as APIError;
    logger.error("GitHub Developer PR fetch error:", err.message);
    throw new Error(err.message || "Failed to fetch developer PRs");
  }
};
