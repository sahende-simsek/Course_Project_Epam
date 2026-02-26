# Local Setup

Follow these steps to run the project locally for development and testing.

## Prerequisites
- Node.js (LTS), npm or pnpm
- PostgreSQL running locally (or use Docker)
- Optional: local S3 emulator (e.g., MinIO) for attachment tests

## 1. Install dependencies
```bash
npm install
```

## 2. Setup environment
```bash
cp .env.example .env
# Edit .env to point to local Postgres and storage emulator if used
```

Key env vars to set:
- `DATABASE_URL` — Postgres connection string
- `JWT_SIGNING_KEY` — dev JWT key
- `STORAGE_ENDPOINT`, `STORAGE_KEY`, `STORAGE_SECRET` — for S3-compatible storage

## 3. Run database migrations
```bash
npx prisma migrate dev
```

## 4. Start local services (recommended)
- Start local Postgres (or use Docker)
- Start local S3 emulator (optional)

## 5. Start Next.js dev server
```bash
npm run dev
# or
npx next dev
```

## 6. Run tests
Unit and integration tests:
```bash
npm test
npm run test:integration
```

## Troubleshooting
- If uploads fail, ensure `STORAGE_ENDPOINT` and credentials are correct and CORS allows the client origin.
- For cookie issues, check `NEXT_PUBLIC_APP_URL` and `COOKIE_DOMAIN` environment variables for local routing.
