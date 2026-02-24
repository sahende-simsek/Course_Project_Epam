# quickstart.md

Local quickstart for `001-user-auth` feature (developer flow).

Prerequisites
- Node 18+ and npm installed
- PostgreSQL running locally; `DATABASE_URL` env var set
- `JWT_SECRET` env var set for signing access tokens

Install & prepare

```bash
npm ci
npx prisma migrate dev --name init_auth
```

Run tests (unit)

```bash
npm test
```

Run integration tests (example)

```bash
npm run test:integration -- tests/integration/auth.register.test.ts
```

Notes
- To run integration tests the test runner will need access to a test database; use a disposable database and run `npx prisma migrate deploy` against it.
- Cookie domain and `SameSite` may require configuration depending on local setup (subdomains, proxying).
