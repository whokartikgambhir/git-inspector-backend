# GitHub Inspector

A production-ready backend API built with **Express.js**, **TypeScript** and **MongoDB** that integrates with the GitHub API to provide powerful pull request analytics.

---

## 📌 Features

- 🔐 **GitHub PAT Authentication**
- 📊 **Developer PR Analytics**
- 📂 **Open PR Reports**
- ⏱️ **PR Timing Metrics**
- 🛡️ **Input Validation** with `class-validator`
- ❗ **Centralized Error Handling**
- 🚀 **Production-ready Dockerfile**
- 🧪 **Unit Tests** with `Mocha`, `Chai`, `Sinon`, `Supertest`
- 🧠 **AI-accelerated development** (see `AI_USAGE.md`)

---

## 🧱 Tech Stack

- **Node.js**, **Express.js**
- **TypeScript**
- **MongoDB**
- **Octokit (GitHub API)**
- **Docker**
- **Mocha + Chai + Sinon + Supertest**

---

## 📚 API Documentation

See full documentation in [`API_DOCS.md`](./API_DOCS.md)

---

## 🔐 Authentication

Use a **GitHub Personal Access Token (PAT)** in your `Authorization` header for all requests:

```http
Authorization: Bearer <your-github-pat>
````

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/whokartikgambhir/git-inspector-backend.git
cd git-inspector-backend
yarn install
```

### 2️⃣ Set Environment Variables

Create a `.env` file and fill in:

```
PORT=3000
MONGO_URI=<your-mongodb-uri>
GITHUB_PAT_SECRET_KEY=<encryption-key>
GITHUB_API_BASE_URL=https://api.github.com
```

---

### 3️⃣ Run the Application

#### Development:

```bash
yarn dev
```

#### Production:

```bash
yarn build
yarn start
```

---

### 🐳 Docker Setup

To build and run with Docker:

```bash
docker build -t git-inspector-backend .
docker run -p 3000:3000 --env-file .env git-inspector-backend
```

---

### 🧪 Run Tests and Coverage

```bash
yarn coverage
```

Generates a full test coverage report under `/coverage`.

---

## 📂 Project Structure

```
git-inspector-backend/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middlewares/
│   ├── utils/
│   ├── common/
├── tests/
├── docs/
│   ├── API_DOCS.md
│   ├── AI_USAGE.md
├── Dockerfile
├── .env.example
├── README.md
```

---

## 📊 Example Endpoints

| Method | Endpoint                        | Description                |
| ------ | ------------------------------- | -------------------------- |
| POST   | `/auth`                         | Authenticate GitHub PAT    |
| GET    | `/prs/analytics?developer=user` | Developer PR summary       |
| GET    | `/prs/:developer/open`          | List open PRs by developer |
| GET    | `/prs/metrics/:developer`       | PR timing insights         |
| GET    | `/user`                         | List all users             |
| DELETE | `/user/:username`               | Remove a user              |
| GET    | `/health`                       | Health check               |

---

## 🧠 AI Usage

See [`AI_USAGE.md`](./AI_USAGE.md) for how AI tools accelerated development and improved code quality.

---

## 📄 License

MIT © Kartik Gambhir
