// external dependencies
import axios, { AxiosInstance, AxiosResponse } from "axios";
import "dotenv/config";

// internal dependencies
import redis from "../utils/redis.js";
import { GITHUB_API_BASE_URL, GITHUB_API_HEADERS } from "../common/constants.js";
import { APIError } from "../common/types.js";

const useRedisCache = process.env.USE_REDIS_CACHE;

/**
 * Dynamically imports and creates an authenticated GitHub Octokit client
 *
 * @param pat - GitHub Personal Access Token
 * @returns Promise resolving to Octokit instance
 */
export const createOctokitClient = async (pat: string) => {
  const { Octokit } = await import("@octokit/rest");
  return new Octokit({ auth: pat });
};

/**
 * Creates an Axios instance configured for GitHub API requests
 * 
 * @param token - GitHub Personal Access Token (PAT) for authentication
 * @returns axiosInstance with base URL and headers set for GitHub API
 * @throws error if token is missing
 */
export const githubClient = (token: string): AxiosInstance => {
  if (!token) {
    throw new Error("GitHub token is required for API requests.");
  }
  return axios.create({
    baseURL: GITHUB_API_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`, // set PAT for authentication
      ...GITHUB_API_HEADERS,            // add default GitHub API headers
    },
  });
};

/**
 * Makes a cached GET request to the GitHub API with ETag-based validation
 *
 * @template T
 * @param {string} url - GitHub API endpoint
 * @param {string} token - GitHub Personal Access Token for authentication
 * @returns {Promise<T>} - Parsed JSON response, either fresh or from Redis fallback
 */
export const cachedGitHubRequest = async <T>(
  url: string,
  token: string
): Promise<T> => {
  const cacheKey = `github:${url}`;
  const etagKey = `${cacheKey}:etag`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
  };

  if (useRedisCache == "true") {
    const cachedETag = await redis.get(etagKey);
    if (cachedETag) headers["If-None-Match"] = cachedETag;
  }

  try {
    const response: AxiosResponse<T> = await axios.get<T>(url, { headers });
    const newETag = response.headers.etag;

    if (useRedisCache == "true") {
      await redis.set(cacheKey, JSON.stringify(response.data), "EX", 300); // 5 min TTL
      if (newETag) await redis.set(etagKey, newETag);
    }

    return response.data;
  } catch (error) {
    const err = error as APIError;
    if (err.response?.status === 304 && useRedisCache) {
      const fallback = await redis.get(cacheKey);
      if (fallback) return JSON.parse(fallback) as T;
    }
    throw err;
  }
};
