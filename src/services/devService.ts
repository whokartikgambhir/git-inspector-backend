// internal dependencies
import { githubClient } from "../utils/githubClient.js";

export const fetchDeveloperPRStats = async (developer: string, token: string) => {
  try {
    const client = githubClient(token);
    const { data } = await client.get(`/search/issues`, {
      params: {
        q: `type:pr author:${developer}`
      },
    });

    return data;
  } catch (error: any) {
    console.error("GitHub Developer PR fetch error:", error);
    throw new Error(error?.message || "Failed to fetch developer PRs");
  }
};
