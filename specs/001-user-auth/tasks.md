# Tasks: User Authentication (001-user-auth)

Feature: User Authentication
Spec: spec.md

Phase 1 — Setup
- [x] T001 Initialize feature workspace and add CI job placeholders in .github/workflows for auth tests — specs/001-user-auth/ (create workflow file `.github/workflows/auth-tests.yml`)
- [x] T002 [P] Add initial Prisma migration scaffold and update `prisma/schema.prisma` with preliminary `User` model — prisma/schema.prisma
- [x] T003 [P] Create `specs/001-user-auth/quickstart.md` with local run + migration steps (already present) — specs/001-user-auth/quickstart.md

Phase 2 — Foundational (blocking prerequisites)
- [x] T004 Implement Prisma `RefreshToken` model and generate migration — prisma/migrations/* and prisma/schema.prisma
- [x] T005 Implement environment config loader (env var validation for `DATABASE_URL`, `JWT_SECRET`) — src/config/index.ts
- [x] T006 [P] Add shared infra adapters: `src/auth/infra/prismaClient.ts`, `src/auth/infra/logger.ts` — src/auth/infra/
- [x] T007 Add CI secret-scan step and TypeScript strict check in CI workflow — .github/workflows/auth-tests.yml

Phase 3 — User Story 1: Register with email & password (P1)
- [x] T008 [US1] [P] Write failing unit tests for validators (`email` normalization, password length) — src/auth/domain/validators.test.ts
- [x] T009 [US1] [P] Write failing unit tests for hashing functions (bcrypt) — src/auth/domain/hash.test.ts
- [x] T010 [US1] [P] Implement `createUser(email,password)` domain function skeleton and tests — src/auth/domain/userService.ts
- [x] T011 [US1] Implement API adapter for `POST /api/auth/register` (Next.js route) and wire to domain — src/auth/adapters/register/route.ts
- [x] T012 [US1] Integration test `tests/integration/auth.register.test.ts` (success, duplicate 409, invalid 400) — tests/integration/auth.register.test.ts

Phase 4 — User Story 2: Login with email & password (P1)
- [x] T013 [US2] [P] Write failing unit tests for `verifyCredentials` and token creation — src/auth/domain/service.test.ts
- [x] T014 [US2] Implement `verifyCredentials(email,password)` domain logic and update `lastLoginAt` — src/auth/domain/authService.ts
- [x] T015 [US2] Implement `generateAccessToken(user)` token service (JWT signing, jti) — src/auth/domain/tokenService.ts
- [x] T016 [US2] Implement API adapter for `POST /api/auth/login` that returns access token and sets HttpOnly, Secure, SameSite refresh cookie (rotate-on-use ready) — src/auth/adapters/login/route.ts
- [x] T017 [US2] Integration test `tests/integration/auth.login.test.ts` (login success sets cookie & returns access token; invalid creds => 401) — tests/integration/auth.login.test.ts

Phase 5 — User Story 3: Logout (P2)
- [x] T018 [US3] Implement API adapter for `POST /api/auth/logout` to revoke refresh records and clear cookie — src/auth/adapters/logout/route.ts
- [x] T019 [US3] Unit/integration test `tests/integration/auth.logout.test.ts` (logout returns 204, subsequent token use -> 401) — tests/integration/auth.logout.test.ts

Phase 6 — Refresh flow & Rotation (cross-story)
- [x] T020 [P] Implement `RefreshToken` repo and `refreshTokenService.rotate(oldToken)` domain logic (parentTokenId, lastUsedAt, expiresAt, revoke old) — src/auth/domain/refreshService.ts and src/auth/infra/refreshRepo.ts
- [x] T021 Implement `POST /api/auth/refresh` adapter: read cookie, call rotate, set rotated cookie, return access token — src/auth/adapters/refresh/route.ts
- [x] T022 Integration test `tests/integration/auth.refresh.test.ts` — rotate-on-use, replay detection (reused token rejected), expired token rejected — tests/integration/auth.refresh.test.ts
- [x] T023 Add background cleanup job for expired/revoked refresh tokens (script or server cron) — scripts/cleanup/refresh-tokens.js

Phase 7 — Observability, Security & Rate-limiting
- [x] T024 Implement structured auth event logging in domain services (register/login_success/login_failure/logout/refresh/replay_detected) — src/auth/infra/logger.ts and calls in domain files
- [x] T025 Implement basic rate-limiting middleware or adapter for auth endpoints (configurable thresholds) — src/auth/adapters/rateLimit.ts
- [x] T026 Security test: add brute-force simulation tests for throttling/lockout (optional integration) — tests/security/bruteforce.test.ts

Phase 8 — CI, Contract Tests & Docs
- [x] T027 Add contract tests verifying response shapes and cookie attributes for all endpoints — tests/contract/auth.contract.test.ts
- [x] T028 Update CI workflow to run unit, integration, contract tests and secret-scan; block merge on failures — .github/workflows/auth-tests.yml
- [x] T029 Update `specs/001-user-auth/spec.md` with any remaining gaps (rate limits, secrets rotation steps) — specs/001-user-auth/spec.md

Phase 9 — Polish & Cross-cutting
- [x] T030 [P] Add Quickstart and developer docs for cookie domain/SameSite configuration — specs/001-user-auth/quickstart.md
- [x] T031 [P] Add Secrets & Rotation doc with `kid`-based key rollover guidance — specs/001-user-auth/plan.md (Secrets & Rotation subsection)
- [x] T032 Finalize tests and remove any feature flags; prepare release notes — specs/001-user-auth/release-notes.md

Phase 10 — Test Hardening & Quality Gates
- [x] T033 Replace placeholder/skeleton tests with complete deterministic tests (unit/integration/contract). Remove any "placeholder" markers and ensure each test asserts observable behavior — tests/unit/*, tests/integration/*, tests/contract/*
- [x] T034 Add mutation testing (Stryker) configuration and npm script `npm run mutate`; schedule nightly runs on `main` and add documentation for mutation targets — stryker.conf.js
- [x] T035 Enforce CI gates: coverage thresholds, TypeScript strict check, lint; update `.github/workflows/auth-tests.yml` to block merges on failures and surface mutation results — .github/workflows/auth-tests.yml
- [x] T036 Implement reusable test fixtures and in-memory test DB helpers (`tests/helpers/testDb.ts`, `tests/helpers/createTestUser.ts`) to avoid fragile or slow tests and enable local TDD — tests/helpers/

Phase 11 — Frontend (UI, UX, Tests)
-- [x] T037 Confirm all frontend deliverables use React + TypeScript + Next.js (App Router) as per frontend spec and plan. Document rationale and constitution compliance in developer guide.
 - [x] T038 Create frontend spec and wireframes (specs/001-user-auth/frontend.spec.md) — specs/001-user-auth/frontend.spec.md
 - [x] T039 Add design tokens and theme primitives for corporate branding (`src/frontend/theme`) — src/frontend/theme/
 - [x] T040 Implement `LoginForm` component as a React function component (TypeScript, accessible) and unit tests — src/frontend/components/LoginForm.tsx, tests/unit/frontend/LoginForm.test.ts
 - [x] T041 Implement `RegisterForm` component and password strength meter + tests as React function component — src/frontend/components/RegisterForm.tsx, tests/unit/frontend/RegisterForm.test.ts
 - [x] T042 Implement `AuthClient` wrapper for API calls and secure handling guidance (document storage strategy) — src/frontend/lib/authClient.ts
 - [x] T043 Add Playwright E2E tests for register->login->refresh->logout flows under `tests/e2e/` — tests/e2e/frontend.auth.flow.spec.ts
 - [x] T043 Accessibility audit (axe) and fixes for critical flows — tests/e2e/accessibility.* or CI axe step
 - [x] T044 Add CI step to run frontend unit tests and Playwright E2E (staging or `TEST_USE_INMEMORY` dev-server) — .github/workflows/auth-tests.yml
 - [x] T045 Document frontend quickstart and developer guide, including rationale for React + TypeScript + Next.js stack and constitution compliance — specs/001-user-auth/frontend-quickstart.md


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

## Phase 12 — Constitution Alignment: Roles, Ideas, Evaluation
- [x] T046 [US1] Ensure `User` model includes basic role distinction (`SUBMITTER`, `EVALUATOR`/`ADMIN`) and update Prisma schema (field `role` with default `SUBMITTER`) — prisma/schema.prisma
- [x] T047 [US3] Add `Idea`, `Attachment` and `Evaluation` models plus `IdeaStatus` enum (`SUBMITTED`, `UNDER_REVIEW`, `ACCEPTED`, `REJECTED`) to Prisma schema — prisma/schema.prisma
- [x] T048 [US3] Implement domain service for basic idea submission (title, description, category) — src/auth/domain/ideaService.ts
- [x] T049 [US3] Implement API handler for idea submission endpoint `POST /api/ideas` that calls domain service and enforces authenticated submitter role — src/auth/adapters/ideas.submit.route.ts
- [x] T050 [US3] Add single file attachment support per idea in backend (API + storage abstraction) — src/auth/adapters/ideas.attach.route.ts
- [x] T051 [US4] Implement idea listing and detail retrieval endpoints (`GET /api/ideas`, `GET /api/ideas/{id}`) enforcing FR-011 visibility rule (Admin/Evaluator see all ideas; Submitter sees only own ideas) — src/auth/adapters/ideas.list.route.ts
- [x] T052 [US4] Implement frontend pages for idea listing and detail view that respect FR-011 visibility rule (filtered list for submitter vs full list for admin/evaluator) — src/frontend/app/ideas/page.tsx, src/frontend/app/ideas/[id]/page.tsx
- [x] T053 [US5] Implement evaluation workflow domain logic (accept/reject with comments, updating `IdeaStatus`) — src/auth/domain/evaluationService.ts
- [x] T054 [US5] Implement evaluation endpoint `POST /api/evaluations/{ideaId}` restricted to evaluator/admin role — src/auth/adapters/evaluations.route.ts
- [x] T055 [US5] Add integration tests covering status transitions and evaluation comments — tests/integration/ideas.evaluation.test.ts

File: specs/001-user-auth/tasks.md

Summary:
- Total tasks: 43 (including Phase 12)
- New constitution-alignment tasks: T046–T055
