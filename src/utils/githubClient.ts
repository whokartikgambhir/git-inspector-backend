// external dependencies
import axios, { AxiosInstance } from "axios";

// internal dependencies
import { GITHUB_API_BASE_URL, GITHUB_API_HEADERS } from "../common/constants.js";

/**
 * Creates an Axios instance configured for GitHub API requests
 * 
 * @param token - gitHub Personal Access Token (PAT) for authentication
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
