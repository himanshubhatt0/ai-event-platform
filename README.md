# ai-event-platform
AI-powered event and marketplace platform (NestJS + Next.js)

## Setup Instructions

### Prerequisites
- PostgreSQL (local or hosted)
- Optional for semantic search features: OpenAI API key and Pinecone account

### 1. Clone and install

```bash
git clone https://github.com/himanshubhatt0/ai-event-platform
cd ai-event-platform
```

Install backend dependencies:

```bash
cd apps/backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

### 2. Configure environment variables

Backend env file: `apps/backend/.env`

```env
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3001
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX=your_pinecone_index_name
```

Frontend env file: `apps/frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Environment Quick Notes

- Frontend base API URL is configured in `apps/frontend/.env.local` using `NEXT_PUBLIC_API_URL`.
- Backend allowed browser origin is configured in `apps/backend/.env` using `FRONTEND_URL`.
- For local setup, these usually are:
	- `NEXT_PUBLIC_API_URL=http://localhost:3000`
	- `FRONTEND_URL=http://localhost:3001`

### 3. Run database migrations (backend)

From `apps/backend`:

```bash
npx prisma migrate deploy
```

For local development with new schema changes:

```bash
npx prisma migrate dev
```

### 4. Start apps

Start backend (Terminal 1):

```bash
cd apps/backend
npm run start:dev
```

Start frontend (Terminal 2):

```bash
cd apps/frontend
npm run dev
```

### 5. Run tests

Backend tests:

```bash
cd apps/backend
npm test
```

Frontend tests:

```bash
cd apps/frontend
npm test
```

## Architecture Decisions

### Overall stack

- Monorepo-style folder layout with separate apps for frontend and backend.
- Frontend uses Next.js (App Router) for UI and routing.
- Backend uses NestJS for modular API architecture.

### Backend decisions

- Prisma ORM with PostgreSQL for relational data and schema-driven migrations.
- Feature-based Nest modules (`auth`, `organization`, `event`, `product`, `feed`, `interaction`, `search`).
- JWT-based auth with `Passport` guards for protected routes.
- Global validation using `ValidationPipe` for strict DTO validation.
- Semantic search via OpenAI embeddings + Pinecone vector index.

### Frontend decisions

- Redux Toolkit for auth/session state and async flows.
- Axios service layer for API access and auth header injection.
- Route-level pages in Next.js App Router (`/login`, `/register`, `/dashboard`, `/feed`, `/search`, `/organization/...`).
- Reusable UI primitives for shared behavior (header, toast, popup modal).

## Tradeoffs

### Chosen tradeoffs

- Next.js + Redux Toolkit:
	- Pros: clear client state handling and predictable auth flow.
	- Tradeoff: slightly more boilerplate than local component state.

- Semantic search (OpenAI + Pinecone):
	- Pros: better relevance than keyword-only search.
	- Tradeoff: added infrastructure cost and complexity (embedding sync + vector index consistency).

- Strict request handling and validation:
	- Pros: safer API contracts and fewer malformed requests.
	- Tradeoff: development requires DTO discipline and explicit payload shaping.
## Environment Quick Notes

- Frontend base API URL is configured in `apps/frontend/.env.local` using `NEXT_PUBLIC_API_URL`.
- Backend allowed browser origin is configured in `apps/backend/.env` using `FRONTEND_URL`.
- For local setup, these usually are:
	- `NEXT_PUBLIC_API_URL=http://localhost:3000`
	- `FRONTEND_URL=http://localhost:3001`
