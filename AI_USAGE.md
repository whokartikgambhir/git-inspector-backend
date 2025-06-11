# AI_USAGE.md

## 🤖 AI Tools Used

- **ChatGPT (GPT-4, OpenAI)**
- **GitHub Copilot**

---

## 🛠️ How AI Assisted in the Development Process

### 🧱 1. Project Design & Architecture
- Defined a clean, scalable folder structure (`controllers/`, `routes/`, `services/`, `middlewares/`, `common/`).
- Proposed best practices for RESTful API route design and naming conventions.

### 🔐 2. Authentication & GitHub API
- Guided implementation of GitHub Personal Access Token (PAT) validation middleware.
- Helped configure **Octokit** for authenticated GitHub API interactions (listing PRs, metrics).
- Suggested solutions for handling GitHub API rate limits and errors.

### 🧠 3. PR Analytics Logic & MongoDB Aggregation
- Helped write aggregation logic for:
  - Time PRs remain open before merge/close.
  - Longest-running open PRs.
  - Developer-specific success/failure metrics.
- Improved query efficiency and reduced redundant API calls via caching.

### 🔒 4. Security Enhancements
- Recommended encrypting PAT tokens using Node.js crypto.
- Helped write secure `.env` handling with a fallback config strategy.
- Suggested rate limiting and Helmet middleware for basic protection.

### 🧪 5. Unit Testing & Coverage
- Helped define test strategy using **Mocha**, **Chai**, **Sinon**, and **Supertest**.
- Provided sample stubs and mocks for Octokit and middleware layers.
- Assisted in configuring **nyc** for test coverage reporting.

### 🐳 6. Docker & CI Readiness
- Wrote a production-grade Dockerfile for TS-based Express apps.
- Explained multistage builds and Docker environment variables.
- Helped resolve Render deployment issues (e.g., `shx`, type resolution bugs).

---

## ✨ Example Prompts Used

> “Create Express middleware for validating GitHub PAT token with Octokit.”  
> “How to calculate PR average open time using MongoDB aggregation?”  
> “Write unit tests for Express route with class-validator and Octokit stub.”  
> “Suggest a Dockerfile for a TypeScript + Node.js project with Yarn and env vars.”  
> “How to test coverage with nyc and Mocha for TypeScript project?”

---

## 🚀 Benefits Achieved

- ⚡ **Faster development**: Iterated rapidly with accurate feedback.
- 🧼 **Cleaner code**: Followed well-structured and readable design.
- 🛡 **Better security**: Adopted safer practices (e.g., token encryption, validation).
- 📊 **Improved testing**: Generated meaningful test coverage with mocks.
- 🔄 **Seamless deployment**: Solved common container & deployment errors.

---

## 📌 Final Note

AI tools acted as a pair programmer:
- Reduced context-switching
- Boosted confidence in implementation
- Shortened the learning curve for production-readiness
