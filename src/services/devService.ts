// internal dependencies
import { githubClient } from "../utils/githubClient";

export const fetchDeveloperPRStats = async (developer: string) => {
  try {
    const { data } = await githubClient.get(`/search/issues`, {
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
