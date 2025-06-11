# AI_USAGE.md

## 👩‍💻 AI Tools Used

- **ChatGPT (GPT-4 by OpenAI)**
- **GitHub Copilot**

---

## ⚙️ How AI Helped in Development

### 🔧 1. Project Architecture & Setup
- Planned the overall folder structure for a scalable Express.js + TypeScript backend.
- Suggested RESTful API route designs and naming conventions based on best practices.

### 🔐 2. GitHub Authentication & API Integration
- Helped implement middleware for validating GitHub Personal Access Tokens (PAT).
- Guided on using Octokit to interact with GitHub APIs (e.g., list PRs, handle rate limits).
- Assisted in error handling when GitHub APIs failed due to missing tokens or limits.

### 🧠 3. Business Logic & MongoDB Queries
- Suggested optimized aggregation pipelines for:
  - Calculating average PR open time.
  - Identifying longest-running PRs.
  - Developer-specific PR metrics (success rate, counts).
- Helped design the logic for calculating PR timings both for open and closed states.

### 🔒 4. Security Enhancements
- Advised encrypting stored PAT tokens with a secret key using crypto utilities.
- Identified the need for `.env` configuration and recommended creating `.env.example`.

### 🧪 5. Testing Strategy
- Provided boilerplate structure for unit testing with:
  - **Supertest** for HTTP endpoint tests.
  - **Sinon** for stubbing GitHub API and services.
- Suggested test cases for each route, including edge conditions like missing params or invalid tokens.

### 📦 6. Dockerization
- Assisted in writing a minimal and production-ready Dockerfile to run the TypeScript project efficiently.

---

## 💡 Examples of Prompts Used with ChatGPT

> “Help me calculate average time between PR creation and merge using MongoDB.”  
> “How to mock Octokit and GitHub API calls in unit tests with Supertest?”  
> “Suggest a clean folder structure for an Express.js project with validation and caching.”  
> “How to handle GitHub rate limiting gracefully in Node.js?”

---

## 🚀 Outcome of Using AI

- Accelerated development significantly by reducing trial-and-error for edge case logic.
- Ensured REST compliance and scalable code design.
- Improved test coverage with structured mocks and reusable patterns.
- Maintained code clarity, documentation, and better security practices.

---

## 🧾 Summary

AI tools acted like a coding assistant — helping with:
- Implementation speed
- Query correctness
- Clean architecture
- Production readiness