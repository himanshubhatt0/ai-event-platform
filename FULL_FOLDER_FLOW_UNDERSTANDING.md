# AI Event Platform - Full Folder and Route Flow Understanding

This file describes the current structure and runtime flow for the monorepo as of the latest cleanup pass.

## 1. High-Level Architecture

- `apps/backend`: NestJS API with Prisma, JWT auth, feed/search/interaction logic.
- `apps/frontend`: Next.js UI with Redux auth state and API service layer.
- Backend is source of truth for auth, entities, interactions, and semantic ranking.
- Frontend consumes backend APIs via axios wrappers.

## 2. Backend Folder and Module Flow

Path: `apps/backend/src`

- `app.module.ts`
	Registers modules: `auth`, `organization`, `event`, `product`, `feed`, `interaction`, `search`.

- `main.ts`
	Bootstraps Nest app with global validation, CORS, and cookie parsing.
	CORS origin is configured using backend env key `FRONTEND_URL` with fallback `http://localhost:3001` and `credentials: true`.

### 2.1 Auth Module

Path: `apps/backend/src/modules/auth`

- `auth.controller.ts`
	- `POST /auth/register`
	- `POST /auth/login`
	- `GET /auth/me`

- `auth.service.ts`
	- registration/login logic
	- JWT generation

- `jwt.strategy.ts`, `jwt-auth.guard.ts`
	- validates tokens and injects `req.user`

### 2.2 Organization Module

Path: `apps/backend/src/modules/organization`

- `organization.controller.ts` (JWT protected)
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

- `organization.service.ts`
	- organization create/update/delete and user assignment helpers
	- org-scoped event/product listings

### 2.3 Event Module

Path: `apps/backend/src/modules/event`

- `event.controller.ts` (JWT + `OrgGuard` where needed)
	- `POST /event`
	- `GET /event`
	- `GET /event/:eventId`
	- `PUT /event/:eventId`
	- `DELETE /event/:eventId`

- `event.service.ts`
	- create/read/update/delete event records
	- Pinecone sync on create/update/delete

### 2.4 Product Module

Path: `apps/backend/src/modules/product`

- `product.controller.ts` (JWT + `OrgGuard` where needed)
	- `POST /product`
	- `GET /product`
	- `GET /product/:productId`
	- `PUT /product/:productId`
	- `DELETE /product/:productId`

- `product.service.ts`
	- create/read/update/delete product records
	- Pinecone sync on create/update/delete

### 2.5 Feed Module

Path: `apps/backend/src/modules/feed`

- `feed.controller.ts`
	- `GET /feed`

- `feed.service.ts`
	- merges events and products into one list
	- computes per-item interaction counts and current-user interaction flags

### 2.6 Interaction Module

Path: `apps/backend/src/modules/interaction`

- `interaction.controller.ts`
	- `POST /interaction`

- `interaction.service.ts`
	- toggle behavior for `LIKE`, `SAVE`, `REGISTER`

### 2.7 Search Module

Path: `apps/backend/src/modules/search`

- `search.controller.ts`
	- `GET /search?q=<query>`

- `search.service.ts`
	- query embedding generation
	- Pinecone vector lookup
	- DB hydration + relevance ordering + interaction summary data

## 3. Database Entity Flow

Path: `apps/backend/prisma/schema.prisma`

- `User` -> optional `organizationId`, owns many `Interaction`
- `Organization` -> owns many `User`, `Event`, `Product`
- `Event` -> belongs to `Organization`, has many `Interaction`
- `Product` -> belongs to `Organization`, has many `Interaction`
- `Interaction` -> belongs to `User`, points to `Event` or `Product`, type in `LIKE | SAVE | REGISTER`

## 4. Frontend Folder and Route Flow

Path: `apps/frontend`

- `app/`: route pages
- `services/`: backend API wrappers
- `redux/`: auth slice/store/provider
- `components/`: shared UI (`AppHeader`, `Toast`, `PopupModal`)
- `utils/`: cookies and API error parsing helpers

### 4.1 Active Pages

Path: `apps/frontend/app`

- `/register`: account creation
- `/login`: login and redirect handling
- `/dashboard`: role-aware cards (normal user vs org user)
- `/organization`: redirect page to correct org location (or dashboard)
- `/organization/[id]/events`: create + list org events
- `/organization/[id]/products`: create + list org products
- `/feed`: mixed feed with interactions
- `/search`: semantic query + interaction toggles

### 4.2 Frontend Service Layer

Path: `apps/frontend/services`

- `api.ts`: axios instance with auth header interceptor
- `auth.service.ts`: `/auth/register`, `/auth/login`, `/auth/me`
- `organization.service.ts`: currently active org/event/product API wrappers used by pages/components
- `marketplace.service.ts`: `/feed`, `/search`, `/interaction`

Note: unused organization wrapper methods were removed during cleanup to keep only currently used calls.

## 5. End-to-End User Flow

### 5.1 Authentication

1. User registers or logs in.
2. JWT is persisted in cookie.
3. `AuthInitializer` hydrates redux user state via `/auth/me`.
4. Protected pages verify auth on client and backend guard verifies on API.

### 5.2 Organization Owner Flow

1. User without organization creates one from header (`POST /organization/mine`).
2. User is redirected to `/organization/:id/events`.
3. User creates events/products from org pages.
4. Backend persists data and syncs vectors for search.

### 5.3 Consumer Flow

1. User opens `/feed` for combined marketplace items.
2. User toggles `LIKE`, `SAVE`, `REGISTER` via `/interaction`.
3. User opens `/search` and submits natural-language query.
4. Backend returns relevance-ranked event/product matches.

## 6. Security and Authorization

- `JwtAuthGuard` protects business endpoints.
- `OrgGuard` enforces organization-based write actions for event/product mutations.
- Frontend checks auth state for UX, backend guards enforce real authorization.

## 7. Testing Status

- Backend tests: run with `npm test` in `apps/backend`.
- Frontend tests: run with `npm test -- --runInBand` in `apps/frontend`.
- Test files were updated to match current controller signatures and current page UI output.
