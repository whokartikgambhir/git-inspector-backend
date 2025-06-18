// internal dependencies
import { cachedGitHubRequest } from "../utils/githubClient.js";

/**
 * Fetches pull request statistics for a given developer from the GitHub API
 * 
 * @param developer - gitHub username of the developer
 * @param token - gitHub Personal Access Token (PAT) for authentication
 * @returns raw data returned by the GitHub Search API
 * @throws error if the API call fails
 */
export const fetchDeveloperPRStats = async (developer: string, token: string) => {
  const url = `https://api.github.com/search/issues?q=type:pr+author:${developer}`;
  const data = await cachedGitHubRequest(url, token);
  return data;
};
