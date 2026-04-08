# AI Event Platform - Full Folder and Route Flow Understanding

This document explains how the project is structured and how data flows end-to-end across backend and frontend.

## 1. High-Level Architecture

- apps/backend: NestJS API with Prisma, JWT auth, feed/search/interaction logic.
- apps/frontend: Next.js app with route-based pages and service-layer API clients.
- Backend is source of truth for entities and business logic.
- Frontend calls backend APIs through axios service modules.

## 2. Backend Folder Flow

Path: apps/backend/src

- app.module.ts
- Purpose: Registers all modules into one application.
- Modules wired: auth, organization, event, product, feed, interaction, search.

- main.ts
- Purpose: Bootstraps Nest app, enables CORS, cookie parsing, and global validation.

### 2.1 Auth Module Flow

Path: apps/backend/src/modules/auth

- auth.controller.ts
- Routes:
- POST /auth/register
- POST /auth/login
- GET /auth/me (JWT protected)

- auth.service.ts
- Handles register/login and token creation.

- jwt.strategy.ts, jwt-auth.guard.ts
- Reads JWT from Authorization header or auth_token cookie.
- Adds authenticated user to request object.

### 2.2 Organization Module Flow

Path: apps/backend/src/modules/organization

- organization.controller.ts (JWT protected)
- Main routes:
- POST /organization
- GET /organization
- GET /organization/:orgId
- PUT /organization/:orgId
- DELETE /organization/:orgId
- GET /organization/:orgId/events
- GET /organization/:orgId/products
- GET /organization/:orgId/users
- POST /organization/:orgId/user/:userId
- DELETE /organization/:orgId/user/:userId

- organization.service.ts
- Handles organization CRUD and organization-level views of users/events/products.

### 2.3 Event Module Flow

Path: apps/backend/src/modules/event

- event.controller.ts (JWT protected)
- Routes:
- POST /event
- GET /event
- GET /event/:eventId
- PUT /event/:eventId
- DELETE /event/:eventId

- event.service.ts
- Creates/reads/updates/deletes events.
- On create: generates embedding and upserts vector metadata to Pinecone.

### 2.4 Product Module Flow

Path: apps/backend/src/modules/product

- product.controller.ts (JWT protected)
- Routes:
- POST /product
- GET /product
- GET /product/:productId
- PUT /product/:productId
- DELETE /product/:productId

- product.service.ts
- Creates/reads/updates/deletes products.
- On create: generates embedding and upserts vector metadata to Pinecone.

### 2.5 Feed Module Flow

Path: apps/backend/src/modules/feed

- feed.controller.ts (JWT protected)
- Route:
- GET /feed

- feed.service.ts
- Fetches events + products.
- Returns mixed feed sorted by createdAt desc.
- Adds per-item interactionCounts and userInteractions for current user.

### 2.6 Search Module Flow

Path: apps/backend/src/modules/search

- search.controller.ts (JWT protected)
- Route:
- GET /search?q=<natural-language-query>

- search.service.ts
- Generates embedding for query.
- Queries Pinecone vector index.
- Fetches matched events/products from DB.
- Preserves relevance order and adds relevanceScore.
- Adds interactionCounts and userInteractions.

### 2.7 Interaction Module Flow

Path: apps/backend/src/modules/interaction

- interaction.controller.ts (JWT protected)
- Route:
- POST /interaction

- interaction.service.ts
- Toggle model for interaction types: LIKE, SAVE, REGISTER.
- If same interaction exists: remove it and return toggledOn false.
- If not exists: create it and return toggledOn true.

## 3. Database Entity Understanding

Path: apps/backend/prisma/schema.prisma

- User
- Core user account.
- Optional organizationId relation.
- Has many interactions.

- Organization
- Owns many events, products, users.

- Event
- Belongs to organization.
- Has many interactions.

- Product
- Belongs to organization.
- Has many interactions.

- Interaction
- Belongs to user.
- Targets either eventId or productId.
- type enum: LIKE, SAVE, REGISTER.

## 4. Frontend Folder Flow

Path: apps/frontend

- app/
- Next.js route pages (UI entry points).

- services/
- API abstraction for backend calls.

- redux/
- Auth state management and persistence flow.

- components/
- Shared reusable UI pieces (header, toast).

### 4.1 Core Frontend Routes

Path: apps/frontend/app

- /register
- User registration UI.

- /login
- User login UI.

- /dashboard
- Main authenticated landing page with quick links.

- /organization
- Organization list/create/delete management.

- /organization/[id]/events
- Event create/read/update/delete for selected organization.

- /organization/[id]/products
- Product create/read/update/delete for selected organization.

- /feed
- Mixed events + products feed with like/save/register toggles.

- /search
- Natural language search page with relevance-ranked results.

### 4.2 Frontend Service Layer

Path: apps/frontend/services

- api.ts
- Shared axios instance.
- Automatically attaches token from cookie/localStorage.

- auth.service.ts
- login/register/me APIs.

- organization.service.ts
- Organization + event + product CRUD APIs.

- marketplace.service.ts
- Feed API, Search API, Interaction toggle API.

## 5. End-to-End Runtime Flow (User Journey)

### 5.1 Authentication

1. User registers on /register or logs in on /login.
2. Frontend stores JWT in cookie/local storage.
3. AuthInitializer requests /auth/me and hydrates redux auth state.
4. Protected pages rely on token + backend JWT guards.

### 5.2 Organization and Inventory Management

1. User opens /organization.
2. User creates organization.
3. User opens /organization/:id/events and /organization/:id/products.
4. User performs full CRUD on events and products.
5. Backend stores data in PostgreSQL and embeddings in Pinecone on create.

### 5.3 Feed Flow

1. User opens /feed.
2. Frontend calls GET /feed.
3. Backend returns mixed event/product list with interaction summary.
4. User toggles like/save/register.
5. Frontend calls POST /interaction and updates feed state.

### 5.4 Search Flow

1. User opens /search.
2. User enters natural language query.
3. Frontend calls GET /search?q=...
4. Backend runs embedding + vector search + DB hydration.
5. Frontend shows ranked results with relevance score.
6. User can toggle like/save/register directly on results.

## 6. Route Protection Understanding

- Backend protection is enforced via JwtAuthGuard on all core business modules.
- Frontend also checks auth cookie before rendering private pages.
- Real authorization trust is always backend guard + validated user context.

## 7. Where To Extend Next

- Add recommendation endpoint based on interaction history.
- Add pagination/filter options in feed and search.
- Add role-based organization permissions.
- Add automated tests for feed/search/interaction integration.
