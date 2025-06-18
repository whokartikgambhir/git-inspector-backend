// external dependencies
import { Request } from "express";
import { IncomingHttpHeaders } from 'http';

// interface for standardized API error objects
export interface APIError extends Error {
  status: number;
  message: string;
  stack?: string;
  headers: IncomingHttpHeaders & {
    authorization?: string;
  };
  response?: {
    status: number;
  }
}

// interface for authenticated requests
export interface AuthenticatedRequest extends Request {
  user?: {
    username?: string;
    token?: string;
    email?: string;
  };
}

// interface for mapping user information from GitHub PRs
export interface GitHubUser {
  login: string;
}

// interface for GitHub repository response
export interface GitHubRepo {
  name: string;
  owner: {
    login: string;
  };
}

// interface for mapping GitHub PRs to a standardized format
export interface GitHubPR {
  title: string;
  user?: GitHubUser;
  created_at: string;
  closed_at?: string | null;
  state: string;
  html_url: string;
  pull_request?: { merged_at: string | null };
}

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubPR[];
}

// interface for standardize the structure of PRs
export interface MappedPR {
  title: string;
  author?: string;
  createdAt: string;
  closedAt?: string | null;
  status: string;
  state: string;
  repo: string;
  pr: string;
}

// interface for standardized response from GitHub API
export interface ValidatedRequest<T> extends Request {
  validatedBody?: T;
}

// generic type for DTO class constructor
export type ClassType<T extends object> = { new (...args: unknown[]): T };
