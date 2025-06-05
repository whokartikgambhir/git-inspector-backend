// internal dependencies
import { githubClient } from "../utils/githubClient";

export const fetchOpenPullRequests = async (owner: string, repo: string) => {
  try {
    const { data } = await githubClient.get(`/repos/${owner}/${repo}/pulls`, {
      params: {
        state: "open",
      },
    });

    return data.map((pr: any) => ({
      title: pr.title,
      author: pr.user?.login,
      createdAt: pr.created_at,
      status: pr.state,
    }));
  } catch (error: any) {
    console.error(`GitHub API error:`, error);
    throw new Error(error?.message || "GitHub API call failed");
  }
};
