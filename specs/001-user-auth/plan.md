# Implementation Plan: User Authentication (001-user-auth)

**Branch**: `001-user-auth` | **Date**: 2026-02-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-user-auth/spec.md`

## Summary

Implement email/password registration, login, and logout for the portal (MVP). Use JWT access tokens (short-lived, default 1 hour) and rotate-on-use refresh tokens (HttpOnly, Secure, SameSite cookie; default TTL 7 days) with server-side records for revocation and replay-detection. TDD-first: write failing unit and integration tests, then implement domain services, API adapters, DB migrations, CI gates, and documentation.

## Technical Context

**Language/Version**: TypeScript (Node 18+/LTS)  
**Primary Dependencies**: Next.js App Router, Prisma, bcrypt, jsonwebtoken, cookie, supertest, jest / vitest  
**Storage**: PostgreSQL (Prisma ORM)  
**Testing**: Jest or Vitest + Supertest for integration, and contract tests using jest/supertest  
**Target Platform**: Node server (serverless or Node-hosted)  
**Project Type**: Web-service (API adapters in Next.js App Router)  
**Performance Goals**: SC-002 target: 200–500ms median for auth endpoints in CI environment; 500ms 95th threshold documented (env-dependent).  
**Constraints**: Must not expose secrets in responses/logs; refresh tokens set via secure cookies and rotated server-side; follow InnovatePortal Constitution requirements (TDD-first, secret management, type safety).  
**Scale/Scope**: MVP for initial user base; data model sized for per-user refresh records (expected small volume per user).

## Constitution Check

Gate: Spec must be test-first and include Secrets & Rotation plan. Current spec satisfies major constitution requirements (TDD-first, secrets via env vars, REST semantics, TypeScript strict). Remaining constitution items to include in Phase 1 design: explicit `Secrets & Rotation` subsection and CI secret-scan configuration. No blocking violations identified; these items will be added to plan artifacts.

## Project Structure (recommended)

```text
src/
├── auth/
│   ├── domain/            # business logic: createUser, verifyCredentials, token services
│   ├── adapters/          # Next.js API route handlers (register/login/logout/refresh)
│   ├── infra/             # prisma client, email, logger adapters
│   └── tests/             # unit tests for auth domain
tests/
├── integration/
│   └── auth.*.test.ts
└── contract/

prisma/
├── schema.prisma
```

**Structure Decision**: Keep auth logic isolated under `src/auth/*` with thin adapters for Next.js routes per Constitution "layered separation" requirement.

## Phased Tasks (Markdown tasks grouped by phase)

PHASE A — Tests (TDD-first)
- Test: `auth/validators.test.ts` — validate email normalization, password length/complexity. Path: `src/auth/domain/validators.test.ts`. Command: `npm test -- tests/unit/auth/validators.test.ts`. Estimate: Lo
- Test: `auth/hash.test.ts` — ensure bcrypt hashing and verification (mock speed). Path: `src/auth/domain/hash.test.ts`. Command: `npm test -- tests/unit/auth/hash.test.ts`. Estimate: Lo
- Test: `auth/service.test.ts` — unit tests for `createUser`, `verifyCredentials`, token generation with mocked Prisma. Path: `src/auth/domain/service.test.ts`. Estimate: Med
- Integration: `tests/integration/auth.register.test.ts` — registration success, duplicate `409`, invalid `400`. Command: `npm run test:integration -- tests/integration/auth.register.test.ts`. Estimate: Med
- Integration: `tests/integration/auth.login.test.ts` — login success returns `accessToken` and sets refresh cookie; invalid creds `401`. Estimate: Med
- Integration: `tests/integration/auth.logout.test.ts` — logout revokes refresh record and clears cookie; subsequent use `401`. Estimate: Med
- Integration: `tests/integration/auth.refresh.test.ts` — rotate-on-use: using refresh returns rotated refresh cookie, invalidates previous; replay fails; expired tokens rejected. Estimate: Hi
- Contract tests: response shape + status codes across endpoints. Estimate: Med

PHASE B — Domain Implementation
- Task: `createUser(email,password)` — validate, hash (bcrypt), create user via Prisma. File: `src/auth/domain/userService.ts`. Command: `npm test` (unit). Estimate: Med
- Task: `verifyCredentials(email,password)` — look up user, compare hash, track `lastLoginAt`. File: `src/auth/domain/authService.ts`. Estimate: Med
- Task: `generateAccessToken(user)` — sign short-lived JWT (include `sub`, `jti`, `exp`). File: `src/auth/domain/tokenService.ts`. Estimate: Lo
- Task: `refreshTokenService.rotate(oldToken)` — validate server-side record, issue new refresh token record (parentTokenId link), mark old revoked, return new `jti` and set cookie. File: `src/auth/domain/refreshService.ts`. Estimate: Hi
- Task: `revocationList`/storage — simple DB table (Prisma model) with indexes. File: `prisma/migrations/*` + `src/auth/infra/refreshRepo.ts`. Estimate: Med

PHASE C — API Adapters (Next.js App Router)
- API: `POST /api/auth/register` — adapter at `src/auth/adapters/register/route.ts`. Request `{email,password}`. Success: `201 {id,email,createdAt}`. Tests: integration. Estimate: Med
- API: `POST /api/auth/login` — adapter at `src/auth/adapters/login/route.ts`. Request `{email,password}`. Success: `200 {accessToken,expiresIn}` + Set-Cookie refresh token (HttpOnly, Secure, SameSite=Lax/Strict per deployment). Rotate cookie on refresh use. Estimate: Med
- API: `POST /api/auth/logout` — adapter at `src/auth/adapters/logout/route.ts`. Require auth (access token) or cookie; revoke server-side refresh records and clear cookie. Success: `204`. Estimate: Lo
- API: `POST /api/auth/refresh` — adapter at `src/auth/adapters/refresh/route.ts`. Read refresh cookie, call `refreshService.rotate`, set new cookie, return `200 {accessToken,expiresIn}`. On replay detection, revoke all related refresh tokens for the user and log event. Estimate: Hi

PHASE D — DB Migration (Prisma)
- Migration: `RefreshToken` model (Prisma snippet below). Add indexes on `tokenId`, `userId`, and `expiresAt`. Include cleanup TTL job. Estimate: Med

Prisma model snippet:

```prisma
model RefreshToken {
  id           String   @id @default(uuid())
  tokenId      String   @unique
  userId       String   @index
  parentTokenId String? 
  issuedAt     DateTime @default(now())
  lastUsedAt   DateTime?
  expiresAt    DateTime
  revoked      Boolean  @default(false)
  ip           String?
  userAgent    String?
}
```

Cleanup policy: background job (daily) to delete revoked/expired tokens older than 30 days.

PHASE E — Integration & Contract Test Matrix
- Contract tests: verify error shape `{ error: { code, message, fields? } }` for all endpoints. Estimate: Med
- Integration: run all `tests/integration/auth.*.test.ts` in CI matrix. CI command: `npm run test:integration`. Estimate: Med

PHASE F — CI / Pipeline Changes
- Add steps: `npm ci`, `npm run build` (tsc check), `npm run test` (unit), `npm run test:integration` (integration), `npm run test:contract`, `secret-scan` (diff-based). Example CI snippet (GitHub Actions or pipeline):

```yaml
- uses: actions/checkout@v4
- run: npm ci
- run: npm run build
- run: npm test --silent
- run: npm run test:integration --silent
- run: ./scripts/secret-scan.sh
```

Estimate: Med

PHASE G — Docs & Secrets
- Docs: add `specs/001-user-auth/quickstart.md` with local run + migration steps. Estimate: Lo
- Secrets & Rotation: document JWT signing key storage (env var `JWT_SECRET` or secrets manager), key rollover process (support key id `kid`, store previous keys for grace window), and migration steps to invalidate old refresh tokens if required. Estimate: Med

PHASE H — Rollout & Rollback
- Use feature flag for auth endpoints if rolling out incrementally. Plan DB migrations for forward/backward compatibility (add `RefreshToken` table before enabling refresh flow). Rollback: clear feature flag, do not delete migration rows immediately (allow manual cleanup). Estimate: Med

PHASE I — Observability & Security Checklist
- Structured logs for events: `auth_event` with fields: `eventType`, `userId?`, `ip`, `userAgent`, `tokenId?`, `requestId`, `timestamp`.  
- Alerting: replay detection log events should trigger high-severity alert for investigation.  
- Rate-limiting: recommend default thresholds (TBD): 5 attempts per IP per minute for login endpoints, exponential backoff and temporary lockout per account after 5 failed attempts in 15 minutes. Document in plan and test via brute-force simulation. Estimate: Lo

PHASE J — Effort Estimates & Order
- Order: Tests (TDD) → Domain → API adapters → Migrations → CI → Docs → Release.  
- Provide Lo/Med/Hi estimates inline above for each task. Total implementation ~ several days depending on infra and team.

## Immediate PR Checklist (deliverables for first PR)

- [ ] Failing unit tests added for validators and hashing  
- [ ] Failing integration tests for registration and login (skeleton)  
- [ ] Basic `createUser` and `verifyCredentials` domain functions with unit tests  
- [ ] Prisma migration `RefreshToken` model added (draft)  
- [ ] README/quickstart entry for running tests locally

## Research & Open Questions

- All major clarifications resolved: cookie-based refresh tokens + rotate-on-use + 7-day TTL + 1-hour access TTL.  
- TBD: exact rate-limiting thresholds and lockout policy — pick sensible defaults in Phase 1 and make configurable via env.

---

Generated artifacts: `research.md`, `data-model.md`, `quickstart.md`, `contracts/auth-api.md` (created alongside this plan).

