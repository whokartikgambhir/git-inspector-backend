# API_DOCS.md

## 📘 GitHub PR Analytics API Documentation

This document outlines the available REST API endpoints provided by the GitHub PR Analytics backend.

---

## 🔐 Authentication

All endpoints (except `/health`) require a GitHub Personal Access Token (PAT) in the request header:

Authorization: Bearer <your-github-pat>


---

## 🩺 GET `/health`

**Description:** Health check endpoint to verify server and database connectivity.

**Response:**
```json
{
  "status": "OK",
  "dbStatus": "CONNECTED",
  "uptime": 12345
}

👤 POST /auth
Description: Authenticate a user via GitHub PAT, store them in DB, and return user info.

Request Body:
{
  "token": "<github-pat>"
}

Success Response:

json
Copy
Edit
{
  "message": "User authenticated successfully",
  "data": {
    "userName": "whokartikgambhir",
    "email": "kartik@example.com"
  }
}
Error Response:

json
Copy
Edit
{
  "message": "Invalid or unauthorized GitHub token"
}
👥 GET /user
Description: Retrieve all users from the database.

Response:

json
Copy
Edit
[
  {
    "userName": "whokartikgambhir",
    "email": "kartik@example.com"
  }
]
🧹 DELETE /user/:username
Description: Delete a user by GitHub username.

Response:

json
Copy
Edit
{
  "message": "User deleted successfully"
}
📊 GET /prs/analytics?developer=<username>
Description: Get PR analytics for a specific developer.

Query Params:

developer (required): GitHub username

Response:

json
Copy
Edit
{
  "developer": "mockuser",
  "totalPRs": 10,
  "mergedPRs": 7,
  "closedPRs": 2,
  "openPRs": 1,
  "successRate": "70.00%",
  "averageMergeTimeInHours": 24.6
}
Error Response:

json
Copy
Edit
{
  "message": "Developer parameter is required"
}
📂 GET /prs/:developer/open
Description: List all currently open PRs by a developer.

Response:

json
Copy
Edit
[
  {
    "title": "Fix bug in auth middleware",
    "author": "mockuser",
    "created_at": "2024-11-01T14:22:10Z",
    "status": "open"
  },
  {
    "title": "Update documentation",
    "author": "mockuser",
    "created_at": "2024-11-03T10:00:00Z",
    "status": "open"
  }
]
⏱️ GET /prs/metrics/:developer
Description: PR timing metrics for a developer.

Response:

json
Copy
Edit
{
  "developer": "mockuser",
  "averageTimeToMergeHours": 20.5,
  "averageTimeToCloseHours": 12.3,
  "openPRDurations": [
    {
      "title": "Add metrics endpoint",
      "durationHours": 40.1
    }
  ],
  "topLongestOpenPRs": [
    {
      "title": "Refactor backend logic",
      "durationHours": 72.9
    },
    {
      "title": "Add cache to metrics",
      "durationHours": 68.3
    }
  ]
}

🔁 Common Errors
Code	Message
400	Missing or invalid query parameters
401	Unauthorized – Invalid GitHub PAT
404	User not found
500	Internal Server Error

✅ Status Codes Reference
Code	Meaning
200	Success
201	Created
400	Bad Request
401	Unauthorized
404	Not Found
500	Server Error

📌 Notes
All times are in UTC and durations are in hours

You must pass Authorization: Bearer <pat> for protected routes
