# API_DOCS.md

## 📘 API Documentation – GitHub PR Analytics

This document outlines all available API endpoints, including parameters, authentication, and response structure.

---

## 🔐 Authentication

All endpoints (except `/health`) require a **GitHub Personal Access Token (PAT)** in the `Authorization` header:

```

Authorization: Bearer <your-github-pat>

````

---

## 📍 Base URL

**Live**: `https://git-inspector-backend-2hx7.onrender.com`

All endpoints are prefixed with `/api` except `/health`.

---

## 🛠️ Endpoints

### 1. `POST /api/auth` – Authenticate GitHub PAT

Authenticate and store an encrypted version of your GitHub PAT.

#### Request Body

```json
{
  "pat": "your_github_pat"
}
````

#### Response

```json
{
  "userName": "kartikgambhir",
  "email": "kartik@example.com"
}
```

---

### 2. `GET /api/prs/analytics`

Fetch overall analytics for a developer (open/closed/merged PR counts, success rate, etc.)

#### Query Params

| Param     | Type   | Required | Description                  |
| --------- | ------ | -------- | ---------------------------- |
| developer | string | ✅        | GitHub username              |
| limit     | number | ❌        | Items per page (default: 10) |
| page      | number | ❌        | Page number (default: 1)     |

#### Example

```http
GET /api/prs/analytics?developer=whokartikgambhir&limit=10&page=1
```

---

### 3. `GET /api/prs/:developer/open`

Get all open PRs for a specific developer.

#### Path Param

* `:developer` – GitHub username

#### Query Params

| Param | Type   | Required | Description      |
| ----- | ------ | -------- | ---------------- |
| repo  | string | ✅        | GitHub repo name |
| limit | number | ❌        | Max results      |

#### Example

```http
GET /api/prs/whokartikgambhir/open?repo=Sigma-Web-Dev-Course&limit=50
```

---

### 4. `GET /api/prs/metrics/:developer`

Get PR timing metrics for a developer.

#### Response

```json
{
  "averagePRTime": "2 days",
  "longestOpenPRs": [...],
  "openPRsAge": [...]
}
```

---

### 5. `POST /api/users`

Create a new user entry.

#### Request Body

```json
{
  "userName": "whokartikgambhir"
}
```

#### Response

```json
{
  "message": "User created"
}
```

---

### 6. `GET /api/users`

List all users in the system.

#### Response

```json
[
  {
    "userName": "whokartikgambhir"
  }
]
```

---

### 7. `DELETE /api/users?userName=xyz`

Remove a user by username.

---

### 8. `GET /health`

Check service and DB health.

#### Response

```json
{
  "status": "OK",
  "dbStatus": "CONNECTED",
  "uptime": 12403
}
```

---

## 🚦 Status Codes

| Code | Meaning               |
| ---- | --------------------- |
| 200  | OK                    |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 404  | Not Found             |
| 500  | Internal Server Error |
