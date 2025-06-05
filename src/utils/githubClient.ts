// external dependencies
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const githubClient = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    "User-Agent": "github-pr-analytics-app"
  },
});
