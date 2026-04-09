# AI Event Platform Frontend

Next.js frontend for auth, dashboard, organization management pages, feed browsing, and semantic search.

## Stack

- Next.js (App Router)
- React + TypeScript
- Redux Toolkit
- Axios
- Jest + Testing Library

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables (example `.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Also make sure backend env has:

```env
FRONTEND_URL=http://localhost:3001
```

This must match your frontend URL so backend CORS allows browser requests.

3. Start dev server:

```bash
npm run dev
```

Frontend runs on `http://localhost:3001`.

## Main Routes

- `/login`
- `/register`
- `/dashboard`
- `/organization`
- `/organization/[id]/events`
- `/organization/[id]/products`
- `/feed`
- `/search`

## Service Layer

- `services/api.ts`: shared axios instance + auth header interceptor
- `services/auth.service.ts`: auth endpoints
- `services/organization.service.ts`: active org/event/product endpoints used by current UI
- `services/marketplace.service.ts`: feed, semantic search, interaction toggle

## API Usage Notes

Current frontend only keeps API wrapper methods that are used by active pages/components. Unused wrappers were removed to keep service code lean and easier to maintain.

## Test

Run frontend unit tests:

```bash
npm test -- --runInBand
```
