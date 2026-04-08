# 🚀 AI Event Platform – Backend

A scalable backend system built using **NestJS + Prisma + PostgreSQL + OpenAI + Pinecone**, supporting event/product management with **AI-powered semantic search**.

---

# 🧠 📌 Features

### ✅ Core Modules

* Authentication (JWT-based)
* Organization Management
* Event Management
* Product Management
* Interaction System (Like / Save / Register)

###  Advanced Features

* AI-powered semantic search using OpenAI embeddings
* Vector similarity search using Pinecone
* Unified feed (events + products)
* Clean architecture with modular structure
* Full unit test coverage (Jest)

---

# 🏗️ Tech Stack

| Layer             | Technology          |
| ----------------- | ------------------- |
| Backend Framework | NestJS              |
| ORM               | Prisma              |
| Database          | PostgreSQL          |
| AI                | OpenAI (Embeddings) |
| Vector DB         | Pinecone            |
| Auth              | JWT                 |
| Testing           | Jest                |

---

# 📁 Project Structure

```
apps/backend/
│
├── src/
│   ├── common/
│   │   └── utils/
│   │       ├── ai.service.ts
│   │       └── pinecone.service.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── organization/
│   │   ├── event/
│   │   ├── product/
│   │   ├── interaction/
│   │   ├── feed/
│   │   └── search/
│   │
│   └── prisma/
│
├── prisma/
│   └── schema.prisma
│
└── .env
```

---

# ⚙️ Setup Instructions

## 1️⃣ Clone Repository

```bash
git clone https://github.com/himanshubhatt0/ai-event-platform.git
cd ai-event-platform/apps/backend
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Environment Variables

Create `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/eventdb
JWT_SECRET=your_secret
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX=ai-event-index
```

---

## 4️⃣ Setup Database

```bash
npx prisma migrate dev
npx prisma generate
```

---

## 5️⃣ Run Server

```bash
npm run start:dev
```

Server will run on:

```
http://localhost:3000
```

---

#  API Endpoints

## Auth

* `POST /auth/register`
* `POST /auth/login`

## Organization

* `POST /organization`
* `POST /organization/:orgId/user/:userId`
* `GET /organization/:orgId/users`

## Event

* `POST /event`
* `GET /event`

## Product

* `POST /product`
* `GET /product`

## Feed

* `GET /feed`

## Interaction

* `POST /interaction`

## 🔍 Search (AI Powered)

* `GET /search?q=your_query`

---

# 🤖 AI Semantic Search

### Flow:

```
User Query
   ↓
OpenAI → Generate Embedding
   ↓
Pinecone → Vector Similarity Search
   ↓
PostgreSQL → Fetch Actual Data
   ↓
Return Ranked Results
```

### Example:

```http
GET /search?q=cheap laptop
```

### Result:

* Matches "Affordable Laptop"
* Even if keyword "cheap" not present

---

# 🧪 Running Tests

```bash
npm run test
```

✔ Unit tests for:

* Services
* Controllers

---

# 👨‍💻 Author

**Himanshu Bhatt**

