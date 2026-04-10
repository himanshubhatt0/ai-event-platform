# User Flow Guide (Organization vs Non-Organization)

This page explains how to run the project and understand user flow quickly.

## 1) Run the Project

### Backend

```bash
cd apps/backend
npm install
npx prisma generate
npm run start:dev
```

### Frontend

```bash
cd apps/frontend
npm install
npm run dev
```

Open frontend at: `http://localhost:3000`

## 2) Core Logic

A user is treated as an **Organization User** when:

- `user.organizationId` exists

A user is treated as a **Non-Organization User** when:

- `user.organizationId` is `null` or missing

## 3) Simple Hierarchy

```text
Start
  -> Register / Login
      -> Dashboard
          -> Check user.organizationId
              -> YES (Organization User)
                  -> /organization
                      -> /organization/{id}/events
                      -> /organization/{id}/products
              -> NO (Non-Organization User)
                  -> /feed
                  -> /search
```

## 4) Page Flow (Quick)

### Organization User

1. Login/Register
2. Land on `/dashboard`
3. Open organization area
4. Manage:
   - organization events
   - organization products

### Non-Organization User

1. Login/Register
2. Land on `/dashboard`
3. Browse:
   - `/feed`
   - `/search`
4. If trying `/organization`, user is redirected back to `/dashboard`

## 5) Guard Behavior

Backend has organization protection for org-only actions.

- If `organizationId` is missing, org-only actions are blocked.
- Message intent: only organization users can perform that action.

## 6) Test Both Flows Quickly

1. Create/login with a normal account (no organization attached):
   - Confirm access to feed/search.
   - Confirm organization manage pages are not allowed.
2. Create/login with an organization account:
   - Confirm redirect/access to `/organization/{id}/events` and `/organization/{id}/products`.
   - Confirm manage actions work.
