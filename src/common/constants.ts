// default pagination settings for API endpoints
export const DEFAULT_PAGINATION = Object.freeze({
  LIMIT: 10,
  PAGE: 1,
});

// common error messages used
export const MESSAGES = Object.freeze({
  STATUS_OK: 'OK',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  MISSING_TOKEN: 'GitHub Personal Access Token (PAT) is required.',
  INVALID_TOKEN: 'Invalid or expired GitHub token.',
  AUTH_SUCCESS: 'Authenticated successfully',
  USER_EXISTS: 'User already exists',
  USER_CREATED: 'User created successfully',
  USER_DELETED: 'User deleted successfully',
  USER_NOT_FOUND: 'User not found',
  MISSING_DEVELOPER: 'Developer username is required',
  UNAUTHORIZED_USER: 'Unauthorized GitHub username',
});

// HTTP status codes used
export const STATUS_CODES: Record<string, number> = Object.freeze({
  OK: 200,
  CREATED: 201,
  DELETED: 204,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500,
  BAD_REQUEST: 400,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
});

// gitHub API base URL
export const GITHUB_API_BASE_URL = "https://api.github.com";

// default headers for GitHub API requests
export const GITHUB_API_HEADERS = Object.freeze({
  Accept: "application/vnd.github.v3+json",
  "Content-Type": "application/json",
});

// gitHub API rate limit settings
export const GITHUB_API_RATE_LIMIT = Object.freeze({
  MAX_REQUESTS: 5000, // per hour for authenticated requests
  RESET_TIME: 3600,   // seconds (1 hour)
});

// default port for the application server
export const DEFAULT_PORT = 3000;

// API endpoint paths used in the application
export const API_ENDPOINTS = Object.freeze({
  HEALTH_CHECK: "/health",
  API: "/api",
  AUTH: "/auth",
  PRS: Object.freeze({
    OPEN: "/prs/:developer/open",
    METRICS: "/prs/metrics/:developer",
    ANALYTICS: "/prs/analytics",
    COMPARE: "/prs/compare/:devA/:devB"
  }),
  USER: "/users",
  SEARCH: Object.freeze({
    ISSUES: "/search/issues"
  })
});

export enum DB_STATES {
  DISCONNECTED = "disconnected",
  CONNECTED = "connected",
  CONNECTING = "connecting",
  DISCONNECTING = "disconnecting",
  UNKNOWN = "unknown"
}

// possible states for GitHub pull requests
export const GITHUB_STATES = Object.freeze({
  OPEN: "open",
  CLOSED: "closed",
  MERGED: "merged"
});
