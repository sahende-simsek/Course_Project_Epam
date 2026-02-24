# Frontend Quickstart — Authentication

This quickstart covers running the frontend locally (Next.js App Router) and connecting to the auth backend during development.

Prereqs:
- Node 18+ and `npm` installed
- `DATABASE_URL` set for integration runs, or run with `TEST_USE_INMEMORY=1` for in-memory test helpers

Local dev server (frontend + API routes in same repo):

```bash
npm install
npm run dev
# dev server serves Next.js pages under src/frontend/app
```

Notes:
- Frontend uses React + TypeScript + Next.js (App Router). Pages live under `src/frontend/app/`.
- API adapters used by the frontend are the Next.js API routes under `src/auth/adapters/`.
- For local end-to-end testing, set `TEST_USE_INMEMORY=1` to run with in-memory Prisma mocks where appropriate.
