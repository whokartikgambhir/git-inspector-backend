// external dependencies
import axios, { AxiosInstance, AxiosResponse } from "axios";
import "dotenv/config";
import axiosRetry from "axios-retry";
import CircuitBreaker from "opossum";

// internal dependencies
import redis from "./redis.js";
import { GITHUB_API_BASE_URL, GITHUB_API_HEADERS } from "../common/constants.js";
import { APIError } from "../common/types.js";
import logger from "./logger.js";

const useRedisCache = process.env.USE_REDIS_CACHE;

// Configure axios instance with retry logic
const createRetriableAxiosInstance = (token: string): AxiosInstance => {
  if (!token) throw new Error("GitHub token is required for API requests.");

  const instance = axios.create({
    baseURL: GITHUB_API_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      ...GITHUB_API_HEADERS,
    },
  });

  axiosRetry(instance, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
      return (
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        [403, 429, 503].includes(error?.response?.status as number)
      );
    },
  });

  return instance;
};

// Circuit breaker wrapper for GitHub API requests
const breakerOptions = {
  timeout: 10000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
};

const githubRequestBreaker = new CircuitBreaker(
  async (url: string, token: string) => {
    const client = createRetriableAxiosInstance(token);
    const response: AxiosResponse = await client.get(url);
    return response.data;
  },
  breakerOptions
);

githubRequestBreaker.fallback(async (url: string) => {
  if (useRedisCache === "true") {
    const cached = await redis.get(`github:${url}`);
    if (cached) {
      logger.warn("Serving GitHub fallback from Redis for:", url);
      return JSON.parse(cached);
    }
  }
  logger.error("No fallback available for:", url);
  return null;
});

githubRequestBreaker.on("open", () => logger.warn("GitHub circuit breaker: OPEN"));
githubRequestBreaker.on("halfOpen", () => logger.info("GitHub circuit breaker: HALF-OPEN"));
githubRequestBreaker.on("close", () => logger.info("GitHub circuit breaker: CLOSED"));

/**
 * Creates an Axios instance configured for GitHub API requests
 * 
 * @param token - GitHub Personal Access Token (PAT) for authentication
 * @returns axiosInstance with base URL and headers set for GitHub API
 * @throws error if token is missing
 */
export const githubClient = (token: string): AxiosInstance => {
  return createRetriableAxiosInstance(token);
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
  try {
    const result = await githubRequestBreaker.fire(url, token);
    if (useRedisCache === "true") {
      await redis.set(`github:${url}`, JSON.stringify(result), "EX", 300);
    }
    return result;
  } catch (err) {
    const error = err as APIError;
    logger.error("GitHub API request failed after retries:", error.message);
    throw error;
  }
};
