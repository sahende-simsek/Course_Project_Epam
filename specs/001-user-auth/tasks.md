# Tasks: User Authentication (001-user-auth)

Feature: User Authentication
Spec: spec.md

Phase 1 — Setup
- [ ] T001 Initialize feature workspace and add CI job placeholders in .github/workflows for auth tests — specs/001-user-auth/ (create workflow file `.github/workflows/auth-tests.yml`)
- [ ] T002 [P] Add initial Prisma migration scaffold and update `prisma/schema.prisma` with preliminary `User` model — prisma/schema.prisma
- [ ] T003 [P] Create `specs/001-user-auth/quickstart.md` with local run + migration steps (already present) — specs/001-user-auth/quickstart.md

Phase 2 — Foundational (blocking prerequisites)
- [ ] T004 Implement Prisma `RefreshToken` model and generate migration — prisma/migrations/* and prisma/schema.prisma
- [ ] T005 Implement environment config loader (env var validation for `DATABASE_URL`, `JWT_SECRET`) — src/config/index.ts
- [ ] T006 [P] Add shared infra adapters: `src/auth/infra/prismaClient.ts`, `src/auth/infra/logger.ts` — src/auth/infra/
- [ ] T007 Add CI secret-scan step and TypeScript strict check in CI workflow — .github/workflows/auth-tests.yml

Phase 3 — User Story 1: Register with email & password (P1)
- [ ] T008 [US1] [P] Write failing unit tests for validators (`email` normalization, password length) — src/auth/domain/validators.test.ts
- [ ] T009 [US1] [P] Write failing unit tests for hashing functions (bcrypt) — src/auth/domain/hash.test.ts
- [ ] T010 [US1] [P] Implement `createUser(email,password)` domain function skeleton and tests — src/auth/domain/userService.ts
- [ ] T011 [US1] Implement API adapter for `POST /api/auth/register` (Next.js route) and wire to domain — src/auth/adapters/register/route.ts
- [ ] T012 [US1] Integration test `tests/integration/auth.register.test.ts` (success, duplicate 409, invalid 400) — tests/integration/auth.register.test.ts

Phase 4 — User Story 2: Login with email & password (P1)
- [ ] T013 [US2] [P] Write failing unit tests for `verifyCredentials` and token creation — src/auth/domain/service.test.ts
- [ ] T014 [US2] Implement `verifyCredentials(email,password)` domain logic and update `lastLoginAt` — src/auth/domain/authService.ts
- [ ] T015 [US2] Implement `generateAccessToken(user)` token service (JWT signing, jti) — src/auth/domain/tokenService.ts
- [ ] T016 [US2] Implement API adapter for `POST /api/auth/login` that returns access token and sets HttpOnly, Secure, SameSite refresh cookie (rotate-on-use ready) — src/auth/adapters/login/route.ts
- [ ] T017 [US2] Integration test `tests/integration/auth.login.test.ts` (login success sets cookie & returns access token; invalid creds => 401) — tests/integration/auth.login.test.ts

Phase 5 — User Story 3: Logout (P2)
- [ ] T018 [US3] Implement API adapter for `POST /api/auth/logout` to revoke refresh records and clear cookie — src/auth/adapters/logout/route.ts
- [ ] T019 [US3] Unit/integration test `tests/integration/auth.logout.test.ts` (logout returns 204, subsequent token use -> 401) — tests/integration/auth.logout.test.ts

Phase 6 — Refresh flow & Rotation (cross-story)
- [ ] T020 [P] Implement `RefreshToken` repo and `refreshTokenService.rotate(oldToken)` domain logic (parentTokenId, lastUsedAt, expiresAt, revoke old) — src/auth/domain/refreshService.ts and src/auth/infra/refreshRepo.ts
- [ ] T021 Implement `POST /api/auth/refresh` adapter: read cookie, call rotate, set rotated cookie, return access token — src/auth/adapters/refresh/route.ts
- [ ] T022 Integration test `tests/integration/auth.refresh.test.ts` — rotate-on-use, replay detection (reused token rejected), expired token rejected — tests/integration/auth.refresh.test.ts
- [ ] T023 Add background cleanup job for expired/revoked refresh tokens (script or server cron) — scripts/cleanup/refresh-tokens.js

Phase 7 — Observability, Security & Rate-limiting
- [ ] T024 Implement structured auth event logging in domain services (register/login_success/login_failure/logout/refresh/replay_detected) — src/auth/infra/logger.ts and calls in domain files
- [ ] T025 Implement basic rate-limiting middleware or adapter for auth endpoints (configurable thresholds) — src/auth/adapters/rateLimit.ts
- [ ] T026 Security test: add brute-force simulation tests for throttling/lockout (optional integration) — tests/security/bruteforce.test.ts

Phase 8 — CI, Contract Tests & Docs
- [ ] T027 Add contract tests verifying response shapes and cookie attributes for all endpoints — tests/contract/auth.contract.test.ts
- [ ] T028 Update CI workflow to run unit, integration, contract tests and secret-scan; block merge on failures — .github/workflows/auth-tests.yml
- [ ] T029 Update `specs/001-user-auth/spec.md` with any remaining gaps (rate limits, secrets rotation steps) — specs/001-user-auth/spec.md

Phase 9 — Polish & Cross-cutting
- [ ] T030 [P] Add Quickstart and developer docs for cookie domain/SameSite configuration — specs/001-user-auth/quickstart.md
- [ ] T031 [P] Add Secrets & Rotation doc with `kid`-based key rollover guidance — specs/001-user-auth/plan.md (Secrets & Rotation subsection)
- [ ] T032 Finalize tests and remove any feature flags; prepare release notes — specs/001-user-auth/release-notes.md


Dependencies (high-level)
- `T004` must complete before `T020` and `T021` (DB model required).  
- Foundational tasks `T005`/`T006`/`T007` should complete before API adapters `T011`, `T016`, `T018`, `T021`.  
- Tests in Phase A/B/C are intended to be TDD-first; unit tests (T008-T009-T013) should be created before implementing the corresponding domain code (T010, T014).

Parallel execution examples
- Parallel set A: `T008`, `T009`, `T013` (unit tests for validators, hashing, service) can be written in parallel by different engineers.  
- Parallel set B: `T002`, `T004`, `T006` (Prisma migration scaffold, refresh model, infra adapters) can be worked in parallel if coordinated on schema changes.

Implementation strategy (MVP-first)
- 1) TDD: Add failing unit tests for validators & hashing (T008-T009).  
- 2) Implement `createUser` and `verifyCredentials` minimal domain logic (T010, T014) to satisfy tests.  
- 3) Add login/register API adapters (T011, T016) and integration tests (T012, T017).  
- 4) Add RefreshToken model migration (T004) + refresh service (T020) and refresh adapter (T021).  
- 5) Add CI, contract tests, logging, and rate-limiting.  

Validation: ALL tasks follow the required checklist format: each line starts with `- [ ]`, contains a Task ID `T###`, includes `[USn]` where applicable, includes `[P]` when parallelizable, and specifies a concrete file path.

File: specs/001-user-auth/tasks.md

Summary:
- Total tasks: 32
- Tasks per story: `US1` (T008-T012 = 5), `US2` (T013-T017 = 5), `US3` (T018-T019 = 2), Cross-story/Foundational/Other = remaining tasks
