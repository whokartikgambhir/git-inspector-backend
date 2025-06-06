// external dependencies
import axios from "axios";

/**
 * Creates a GitHub client with a specific PAT.
 * This ensures token is passed dynamically per request (not hardcoded).
 */
export const githubClient = (token: string) => {
  return axios.create({
    baseURL: "https://api.github.com",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });
};
