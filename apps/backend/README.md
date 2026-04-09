# AI Event Platform Backend

NestJS backend for authentication, organization onboarding, event/product publishing, feed, interaction toggling, and semantic search.

## Stack

- NestJS
- Prisma + PostgreSQL
- JWT auth
- OpenAI embeddings
- Pinecone vector search
- Jest

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure `.env` in `apps/backend`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/eventdb
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:3001
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX=ai-event-index
```

`FRONTEND_URL` is used by backend CORS in `src/main.ts`:

- `origin: process.env.FRONTEND_URL || 'http://localhost:3001'`
- `credentials: true`

If your frontend runs on a different domain/port, update `FRONTEND_URL` accordingly.

3. Run Prisma migrations and client generation:

```bash
npx prisma migrate dev
npx prisma generate
```

4. Start API:

```bash
npm run start:dev
```

Default API URL: `http://localhost:3000`

## Modules

- `auth`: register, login, current user
- `organization`: create personal org, org details, org events/products, org admin endpoints
- `event`: create/list/get/update/delete events
- `product`: create/list/get/update/delete products
- `feed`: mixed event + product feed with interaction stats
- `interaction`: toggle `LIKE` / `SAVE` / `REGISTER`
- `search`: semantic search with relevance score

## API Endpoints

All endpoints below are JWT-protected except register/login.

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Organization

- `POST /organization/mine`
- `POST /organization`
- `GET /organization`
- `GET /organization/:orgId`
- `PUT /organization/:orgId`
- `DELETE /organization/:orgId`
- `POST /organization/:orgId/user/:userId`
- `DELETE /organization/:orgId/user/:userId`
- `GET /organization/:orgId/users`
- `GET /organization/:orgId/events`
- `GET /organization/:orgId/products`

### Event

- `POST /event`
- `GET /event`
- `GET /event/:eventId`
- `PUT /event/:eventId`
- `DELETE /event/:eventId`

### Product

- `POST /product`
- `GET /product`
- `GET /product/:productId`
- `PUT /product/:productId`
- `DELETE /product/:productId`

### Feed / Interaction / Search

- `GET /feed`
- `POST /interaction`
- `GET /search?q=<query>`

## Test

Run backend unit tests:

```bash
npm test
```

