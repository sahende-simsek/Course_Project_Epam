# Feature Specification: User Authentication

**Feature Branch**: `001-user-auth`  
**Created**: 2026-02-24  
**Status**: Draft  
**Input**: User description: "Register, Login, Logout for portal; stories: 1 Register; 2 Login; 3 Logout; Tech stack: Next.js App Router, TypeScript strict, Prisma, PostgreSQL, JWT, bcrypt; Constitution: InnovatePortal Constitution v1.2.0 (TDD, Secrets, REST, Type Safety)"

## Clarifications

### Session 2026-02-24

- Q: Token/session strategy for auth  A: B - Access JWT + refresh tokens with server-side revocation (refresh tokens stored/rotated server-side; HttpOnly refresh cookie recommended).
- Q: Refresh token storage method → A: A - HttpOnly, Secure, SameSite refresh cookie set by server (server-side rotation & revocation).
- Q: Refresh token lifetime & rotation policy → A: A - Rotate-on-use with short TTL (7 days); refresh tokens rotated on each use and stored server-side for revocation.

### Session 2026-02-25

- Q: Idea listing visibility by role → A: Admin/Evaluator can list and view all ideas; Submitter can only list and view their own ideas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Register with email & password (Priority: P1)

As a new user, I want to register with an email and password so that I can create an account.

**Why this priority**: Account creation is prerequisite for any authenticated experience.

**Independent Test**: Call the registration API with valid inputs and verify a created user record and appropriate response.

**Acceptance Scenarios**:

1. **Given** no existing account for email, **When** user submits valid email and password to `POST /api/auth/register`, **Then** respond `201 Created` with non-sensitive user metadata (id, email, createdAt) and do not return secrets.
2. **Given** email already registered, **When** user submits registration request, **Then** respond `409 Conflict` with an error message indicating duplicate account.
3. **Given** invalid input (bad email format or password too short), **When** user submits registration request, **Then** respond `400 Bad Request` with field-level validation errors.

---

### User Story 2 - Login with email & password (Priority: P1)

As a registered user, I want to log in with email and password so that I can access the portal.

**Why this priority**: Primary authentication flow required for access control.

**Independent Test**: Call the login API with valid credentials and verify a successful authentication response and issuance of token(s).

**Acceptance Scenarios**:

1. **Given** valid credentials, **When** user posts to `POST /api/auth/login`, **Then** respond `200 OK` with the access token (and optional refresh token), and set any auth cookie if applicable.
2. **Given** invalid credentials, **When** user posts to login endpoint, **Then** respond `401 Unauthorized` without revealing whether email exists.
3. **Given** locked or disabled account, **When** user attempts login, **Then** respond `403 Forbidden` with an explanatory message.

---

### User Story 3 - Logout (Priority: P2)

As a logged-in user, I want to log out so that I can secure my account.

**Why this priority**: Enables session termination and reduces risk from lost or shared devices.

**Independent Test**: Call logout endpoint with valid token/cookie and verify token revocation or cookie cleared.

**Acceptance Scenarios**:

1. **Given** an active session, **When** user posts to `POST /api/auth/logout` (with auth token), **Then** respond `204 No Content` and invalidate the token or clear the auth cookie.
2. **Given** missing or invalid token, **When** logout requested, **Then** respond `401 Unauthorized`.

---

### Edge Cases

- Attempt to register concurrently with same email (race): ensure unique constraint and return `409` to duplicates.
- Login attempts with repeated invalid passwords: ensure lockout or throttling policy (document limits in plan).
- Token revocation between access and logout: ensure logout invalidates server-side refresh or revocation list where applicable.
- Partial failures during registration (DB write succeeds after hash fails): ensure idempotent or compensating cleanup in migrations.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow a new user to register an account using email and password via `POST /api/auth/register`.
- **FR-002**: System MUST validate request input and return `400 Bad Request` with field-level errors for invalid input (email format, password length).
- **FR-003**: System MUST prevent duplicate accounts for the same email and return `409 Conflict` when attempting to register an existing email.
- **FR-004**: System MUST allow registered users to authenticate using `POST /api/auth/login` and return tokens (access token). The refresh token MUST be issued via an HttpOnly, Secure, SameSite cookie and support server-side rotation and revocation.
- **FR-005**: System MUST allow a logged-in user to terminate their session via `POST /api/auth/logout` and ensure the session/token cannot be used thereafter. Logout MUST revoke server-side refresh records and clear the auth cookie where applicable.
- **FR-006**: System MUST never expose secrets (password hashes, JWT secrets, API keys) in API responses or logs.
- **FR-007**: System MUST record authentication events (register, login success/failure, logout) in structured logs for observability.
- **FR-008**: System MUST enforce rate limiting or throttling on auth endpoints to reduce brute-force risk (document exact limits in plan).
- **FR-009**: System MUST validate and sanitize all inputs to prevent injection; DB access MUST use parameterized queries (covered by ORM usage in plan).
- **FR-010**: System MUST be covered by automated tests (unit, contract, integration) that run in CI before merge.

- **FR-011**: For idea listing and viewing in the MVP scope, the system MUST enforce that Admin/Evaluator roles can list and view all ideas, while Submitter users can only list and view ideas they have created.

### Key Entities

- **User**: represents a human account. Key attributes: `id`, `email` (unique), `passwordHash`, `createdAt`, `updatedAt`, `status` (active/disabled), `lastLoginAt`.
- **AuthToken / Session**: represents issued tokens or session records for revocation. Attributes: `tokenId` (or jti), `userId`, `issuedAt`, `expiresAt`, `revoked` flag. Refresh tokens for clients are delivered via HttpOnly, Secure, SameSite cookies; server-side records support rotation and revocation.
 - **AuthToken / Session**: represents issued tokens or session records for revocation. Attributes: `tokenId` (or jti), `userId`, `issuedAt`, `expiresAt`, `revoked` flag. Refresh tokens for clients are delivered via HttpOnly, Secure, SameSite cookies; server-side records support rotation and revocation. Refresh-token records SHOULD include `lastUsedAt`, `parentTokenId` (for rotate-on-use detection), and `expiresAt` (default TTL: 7 days for refresh tokens).
- **AuditEvent (AuthEvent)**: lightweight record for observability: `eventType` (register/login_success/login_failure/logout), `userId?`, `ip`, `userAgent`, `timestamp`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: New users can complete registration with valid inputs and receive a `201 Created` response in >= 95% of valid flows in CI/integration tests.
- **SC-002**: Successful login requests return a valid authentication response (`200 OK`) within 500ms in 95% of CI integration measurements (environment-dependent).
- **SC-003**: Authentication endpoints return correct HTTP status codes for the scenarios defined in Acceptance Criteria (100% coverage by contract tests).
- **SC-004**: No secrets (passwords, password hashes, JWT secrets, API keys) are present in responses or in test logs in CI (verified by CI scan).
- **SC-005**: Token expiry policy documented and default access tokens expire within 1 hour (configurable); refresh tokens are delivered as HttpOnly, Secure, SameSite cookies and rotated server-side; token revocation tests demonstrate logout invalidates tokens and clears cookies.
 - **SC-005**: Token expiry policy documented and default access tokens expire within 1 hour (configurable); refresh tokens are delivered as HttpOnly, Secure, SameSite cookies, have a default TTL of 7 days, and are rotated on use (rotate-on-use). Token revocation tests must demonstrate that logout invalidates tokens, rotated refresh tokens are accepted only once, and reused/old refresh tokens are rejected and flagged.

## API Specification

All endpoints follow REST semantics and return JSON errors with a structured shape: `{ "error": { "code": "string", "message": "string", "fields"?: { "field": "reason" } } }`.

- POST /api/auth/register
  - Request body: `{ "email": "string", "password": "string" }`
  - Success: `201 Created` with body `{ "id": "uuid", "email": "user@example.com", "createdAt": "ISO8601" }`
  - Errors: `400 Bad Request` (validation), `409 Conflict` (duplicate email), `500 Internal Server Error` (unexpected)

- POST /api/auth/login
  - Request body: `{ "email": "string", "password": "string" }`
  - Success: `200 OK` with body `{ "accessToken": "jwt", "expiresIn": 3600 }`.
    - Refresh token is set via `Set-Cookie` as an HttpOnly, Secure, SameSite cookie and rotated server-side for revocation support. Returning refresh tokens in JSON is discouraged for the MVP.
  - Errors: `401 Unauthorized` (invalid credentials), `403 Forbidden` (locked/disabled), `400 Bad Request` (validation)

- POST /api/auth/logout
  - Headers: `Authorization: Bearer <accessToken>` or auth cookie
  - Success: `204 No Content` on success
  - Errors: `401 Unauthorized` (missing/invalid token)

## Input Validation Rules

- `email`: required, must match a reasonable email pattern (e.g. `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`), will be normalized to lowercase before uniqueness check.
- `password`: required, minimum length 8 characters, maximum 128 characters; additional complexity rules optional (documented in plan).
- All inputs must be validated server-side and return field-level error details (avoid leaking implementation internals).

## Tests to Generate (TDD-first)

All tests MUST be written first and fail (TDD). Tests should be deterministic and runnable in CI.

- Unit tests
  - `auth/validators.test.ts`: email and password validation edge cases
  - `auth/hash.test.ts`: password hashing and verification functions (mock hashing backend in unit tests)
  - `auth/service.test.ts`: business logic for `createUser`, `verifyCredentials`, `generateToken` with mocked DB

- Integration tests (API)
  - `tests/integration/auth.register.test.ts`:
    - registration success flow
    - duplicate registration returns `409`
    - invalid input returns `400`
  - `tests/integration/auth.login.test.ts`:
    - successful login returns tokens
    - invalid credential returns `401`
  - `tests/integration/auth.logout.test.ts`:
    - logout invalidates token; subsequent access with same token is `401`
  - `tests/integration/auth.refresh.test.ts`:
    - refresh token rotate-on-use behavior: using a refresh token returns a new refresh token (rotated) and invalidates the previous one
    - reuse of a rotated refresh token must be rejected (detect replay)
    - expired refresh tokens (older than 7 days) must be rejected

- Contract tests
  - Verify response shapes and status codes for auth endpoints (used as guard rails for API consumers)

- Security tests
  - Ensure no secrets appear in responses or logs (scan diffs and CI logs)
  - Brute-force simulation tests (basic throttling validation)

## Assumptions

- Tech stack: Next.js App Router, TypeScript (strict), Prisma ORM, PostgreSQL, JWT for tokens, bcrypt for password hashing. Secrets provided via environment variables and managed in deployment.
- Tokens will include a unique identifier (`jti`) for revocation support where applicable.
- CI will run tests, TypeScript strict checks, and a light diff-based secret scanner before merge as required by the Constitution.

## Constitution Check (mapping to InnovatePortal Constitution v1.2.0)

- **Spec-Driven & Test-First (NON-NEGOTIABLE)**: This spec is required; all tests listed above MUST be authored before implementation and included in the feature branch history. CI gate requires tests to pass.
- **Authentication, Secrets & Credential Management**: Secrets (JWT signing key, DB credentials) MUST be provided via environment variables or secrets manager. The plan MUST include a `Secrets & Rotation` subsection describing storage and rotation of the JWT secret and any required migration steps for token rotation.
- **REST API Standards & Security**: Endpoints use appropriate HTTP verbs and status codes (`POST` for create/login/logout, `201`, `200`, `204`, `401`, `403`, `409`, `400`). Inputs are validated and parameterized DB access is required (see FR-009).
- **Developer Experience, Observability & Type Safety**: TypeScript strict mode required; tests and linting run in CI. Auth events are logged as structured events for observability.
- **Clean Architecture & Layered Separation**: Auth logic MUST live in application/domain layers and NOT import delivery/framework-specific code; API route handlers should be thin adapters calling application services.
- **Simplicity-First MVP**: MVP includes email/password register, login, logout. Optional features (refresh-token rotation, MFA) are out-of-scope for MVP and should be captured as follow-up stories.

## Next Steps / Implementation Plan (high level)

1. Create failing tests per `Tests to Generate` (unit + integration)  TDD step.
2. Implement domain/auth service logic (createUser, verifyCredentials, token issuance) with Prisma models and unit tests.
3. Implement API route adapters in Next.js App Router mounting the auth service.
4. Add CI checks: run tests, TypeScript strict, lint, and secret-scan.
5. Document `Secrets & Rotation` in the plan and include migration steps for future token rotation.

---


