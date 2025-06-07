// internal dependencies
import { githubClient } from "../utils/githubClient.js";

export const fetchOpenPullRequests = async (owner: string, repo: string, token: string) => {
  try {
    const client = githubClient(token);
    const { data } = await client.get(`/repos/${owner}/${repo}/pulls`, {
      params: {
        state: "open",
      },
    });

    return data.map((pr: any) => ({
      title: pr.title,
      author: pr.user?.login,
      createdAt: pr.created_at,
      status: pr.state,
      repo: pr.html_url.split('/pull')[0],
      pr: pr.html_url
    }));
  } catch (error: any) {
    console.error(`GitHub API error (repo-specific):`, error);
    throw new Error(error?.message || "GitHub API call failed");
  }
};

export const fetchOpenPullRequestsForAllRepos = async (owner: string, token: string) => {
  try {
    const client = githubClient(token);
    const { data: repos } = await client.get(`/users/${owner}/repos`);

    const allPRs = await Promise.all(
      repos.map(async (repo: any) => {
        try {
          const { data: prs } = await client.get(
            `/repos/${owner}/${repo.name}/pulls`,
            {
              params: { state: "open" },
            }
          );

          return prs.map((pr: any) => ({
            title: pr.title,
            author: pr.user?.login,
            createdAt: pr.created_at,
            status: pr.state,
            repo: repo.name,
            pr: pr.html_url
          }));
        } catch (err) {
          console.warn(`Skipping repo ${repo.name} due to error`);
          return [];
        }
      })
    );

    return allPRs.flat();
  } catch (error: any) {
    console.error(`GitHub API error (owner-level):`, error);
    throw new Error(error?.message || "Failed to fetch repos or PRs");
  }
};

export const fetchAllPullRequestsForUser = async (userName: string, token: string) => {
  const client = githubClient(token);
  const { data: repos } = await client.get(`/users/${userName}/repos`);

  const allPRs = await Promise.all(
    repos.map(async (repo: any) => {
      try {
        const { data: prs } = await client.get(
          `/repos/${repo.owner.login}/${repo.name}/pulls`,
          {
            params: { state: "all" },
          }
        );

        return prs.map((pr: any) => ({
          title: pr.title,
          author: pr.user?.login,
          createdAt: pr.created_at,
          closedAt: pr.closed_at,
          state: pr.state,
          repo: repo.name,
          pr: pr.html_url,
        }));
      } catch (err) {
        console.warn(`Skipping repo ${repo.name} due to error`);
        return [];
      }
    })
  );

  return allPRs.flat();
};
