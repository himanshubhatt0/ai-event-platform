# ai-event-platform
AI-powered event and marketplace platform (NestJS + Next.js)

## Environment Quick Notes

- Frontend base API URL is configured in `apps/frontend/.env.local` using `NEXT_PUBLIC_API_URL`.
- Backend allowed browser origin is configured in `apps/backend/.env` using `FRONTEND_URL`.
- For local setup, these usually are:
	- `NEXT_PUBLIC_API_URL=http://localhost:3000`
	- `FRONTEND_URL=http://localhost:3001`
