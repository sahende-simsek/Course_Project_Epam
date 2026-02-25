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


### User Story 4 - Role Assignment / Role-based Access (Priority: P3)

As an admin or provisioning system, I want to assign roles to users so that the API enforces correct visibility and permissions.

**Why this priority**: Role-based access is required to separate submitter and evaluator responsibilities.

**Independent Test**: Assign `role` on a `User` record and verify `GET /api/ideas` returns the correct scope for that role.

**Acceptance Scenarios**:

1. **Given** a user with role `EVALUATOR`, **When** the user requests `GET /api/ideas`, **Then** respond `200 OK` and return all ideas.
2. **Given** a user with role `SUBMITTER`, **When** the user requests `GET /api/ideas`, **Then** respond `200 OK` and return only ideas where `authorId` equals the caller.
3. **Given** an unauthenticated request, **When** requesting `GET /api/ideas`, **Then** respond `401 Unauthorized`.

### User Story 5 - Submit Idea (Priority: P1)

As an authenticated submitter, I want to submit an idea with a title, description, and category so that my idea is tracked for evaluation.

**Why this priority**: Idea submission is core to the portal's purpose.

**Independent Test**: POST valid payload to `POST /api/ideas` and verify `201 Created` and persisted `Idea` linked to caller.

**Acceptance Scenarios**:

1. **Given** an authenticated submitter with valid `{ title, description, category }`, **When** POSTing to `POST /api/ideas`, **Then** respond `201 Created` with the created `Idea` (status `SUBMITTED`) and persist the record linked to the caller.
2. **Given** missing required fields, **When** POSTing, **Then** respond `400 Bad Request` with `fields` describing validation errors.
3. **Given** an unauthenticated request, **When** POSTing, **Then** respond `401 Unauthorized`.

### User Story 6 - Attach File (Priority: P2)

As the idea author, I want to attach a file to my idea so evaluators can review supporting material.

**Why this priority**: Attachments provide context for evaluators and are important for decision quality.

**Independent Test**: Upload file to storage or prepare metadata and POST to `POST /api/ideas/attach`; verify `201 Created` and Attachment associated to the idea.

**Acceptance Scenarios**:

1. **Given** the caller is the idea author and submits valid attachment metadata to `POST /api/ideas/attach`, **When** the file extension is allowed, **Then** respond `201 Created` with the created `Attachment` and associate it to the idea.
2. **Given** a disallowed file type or invalid payload, **When** POSTing, **Then** respond `415 Unsupported Media Type` or `400 Bad Request` accordingly.
3. **Given** the idea already has an attachment and the specification requires a single attachment, **When** attaching another file, **Then** the server MUST either reject with `409 Conflict` or replace the existing attachment depending on the chosen policy (documented behavior); if multiple attachments are allowed, accept and return `201 Created`.

### User Story 7 - Evaluate Idea (Priority: P2)

As an authenticated evaluator or admin, I want to evaluate an idea with a decision and comments so that the idea's status is resolved.

**Why this priority**: The evaluation finalises an idea and completes the submission lifecycle.

**Independent Test**: POST `{ ideaId, decision, comments }` to `POST /api/evaluations` as an evaluator and verify `201 Created`, persisted `Evaluation`, and updated `Idea.status`.

**Acceptance Scenarios**:

1. **Given** an authenticated evaluator posts `{ ideaId, decision: ACCEPTED|REJECTED, comments }` to `POST /api/evaluations` and the idea is not already final, **When** processing, **Then** create an `Evaluation`, update `Idea.status` to the decision, and respond `201 Created` with evaluation details.
2. **Given** the idea is already `ACCEPTED` or `REJECTED`, **When** attempting to evaluate, **Then** respond `409 Conflict` and do not create a new `Evaluation`.
3. **Given** a caller without evaluator role, **When** POSTing to `POST /api/evaluations`, **Then** respond `403 Forbidden`.

### Edge Cases

- Attempt to register concurrently with same email (race): ensure unique constraint and return `409` to duplicates.
- Login attempts with repeated invalid passwords: ensure lockout or throttling policy (document limits in plan).
- Token revocation between access and logout: ensure logout invalidates server-side refresh or revocation list where applicable.
- Partial failures during registration (DB write succeeds after hash fails): ensure idempotent or compensating cleanup in migrations.
 - Role drift or stale tokens: ensure role changes on `User` (e.g., promoting to `EVALUATOR`) are respected for newly issued tokens and consider short-lived access tokens or token revocation for role changes.
 - Idea ownership race: concurrent attempts to attach/delete an attachment by different sessions should be handled with DB constraints and clear `409 Conflict` responses when ownership/uniqueness is violated.
 - Attachment size and type limits: uploaded files exceeding size limits or disallowed MIME types must be rejected with `415` or `413` as appropriate; ensure streaming uploads do not result in partial DB records.
 - Single-vs-multiple attachment policy conflict: if single-attachment is enforced, concurrent attach attempts must result in deterministic acceptance/rejection (use DB unique constraint or transaction to enforce).
 - Evaluation concurrency: prevent two evaluators from finalising the same idea simultaneously; implement optimistic concurrency checks or transactions that return `409 Conflict` on concurrent finalisation.
 - Missing role checks: endpoints must return `403 Forbidden` where caller lacks required role (e.g., non-evaluators posting to `/api/evaluations`).

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

 - **FR-012**: The system MUST allow assignment and persistence of a `role` on the `User` record (e.g., `SUBMITTER`, `EVALUATOR`, `ADMIN`) and include the role in issued access tokens so role checks can be enforced by API adapters.
 - **FR-013**: The system MUST allow an authenticated submitter to create an `Idea` via `POST /api/ideas` with required fields `{ title, description, category }`. The server MUST validate inputs, persist the `Idea` with `status=SUBMITTED`, and set `authorId` to the caller. Successful creation must return `201 Created` with the created `Idea` object.
 - **FR-014**: The system MUST allow an idea author to attach file metadata via `POST /api/ideas/attach` with `{ ideaId, filename, url, mimetype, size }`. The endpoint MUST verify ownership (caller is `authorId`), validate file extension and size limits, and persist an `Attachment` linked to the `Idea`. The endpoint MUST return `201 Created` on success and enforce the single-vs-multiple attachment policy documented in the spec (reject with `409 Conflict` if single-attachment is enforced and an attachment already exists, or accept additional attachments if multiple are allowed).
 - **FR-015**: The system MUST allow users with `EVALUATOR` or `ADMIN` roles to submit evaluations via `POST /api/evaluations` with `{ ideaId, decision, comments }`. The endpoint MUST validate the evaluator role, ensure the `decision` is one of the allowed values (`ACCEPTED` or `REJECTED`), prevent evaluations when the idea is already final (return `409 Conflict`), persist an `Evaluation` record on success, and update the `Idea.status` atomically with the evaluation.

### Key Entities

- **User**: represents a human account. Key attributes: `id`, `email` (unique), `passwordHash`, `createdAt`, `updatedAt`, `status` (active/disabled), `lastLoginAt`.
- **AuthToken / Session**: represents issued tokens or session records for revocation. Attributes: `tokenId` (or jti), `userId`, `issuedAt`, `expiresAt`, `revoked` flag. Refresh tokens for clients are delivered via HttpOnly, Secure, SameSite cookies; server-side records support rotation and revocation.
 - **AuthToken / Session**: represents issued tokens or session records for revocation. Attributes: `tokenId` (or jti), `userId`, `issuedAt`, `expiresAt`, `revoked` flag. Refresh tokens for clients are delivered via HttpOnly, Secure, SameSite cookies; server-side records support rotation and revocation. Refresh-token records SHOULD include `lastUsedAt`, `parentTokenId` (for rotate-on-use detection), and `expiresAt` (default TTL: 7 days for refresh tokens).
- **AuditEvent (AuthEvent)**: lightweight record for observability: `eventType` (register/login_success/login_failure/logout), `userId?`, `ip`, `userAgent`, `timestamp`.

 - **Idea**: represents a submitted idea. Key attributes: `id`, `title`, `description`, `category`, `status` (enum: `SUBMITTED` | `UNDER_REVIEW` | `ACCEPTED` | `REJECTED`), `authorId`, `createdAt`, `updatedAt`. Relations: has-many `Attachment`, has-many `Evaluation`.

 - **Attachment**: metadata record for files attached to an Idea. Key attributes: `id`, `ideaId`, `filename`, `url`, `mimetype`, `size`, `createdAt`. Constraints: `mimetype` and `size` must be validated; consider optional uniqueness constraint when single-attachment policy is chosen.

 - **Evaluation**: record representing an evaluator decision. Key attributes: `id`, `ideaId`, `evaluatorId`, `decision` (`ACCEPTED` | `REJECTED`), `comments`, `createdAt`. Side-effect: updates `Idea.status` atomically.

 - **Role**: enumerated on `User` as `SUBMITTER` | `EVALUATOR` | `ADMIN`. Roles determine what endpoints and data each user can access.

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



## Gaps / Missing implementations (observed)

- Refresh-token rotation and rotate-on-use server-side revocation: the spec requires rotate-on-use refresh tokens delivered via `Set-Cookie` and server-side records. Current `POST /api/auth/login` sets a placeholder refresh cookie and `POST /api/auth/logout` clears cookies and calls revocation helpers; full rotate-on-use flow is not implemented and should be delivered to satisfy FR-004/SC-005.
- Single-file vs multiple attachments: course guide requested "single file attachment per idea" while the code and DB model support multiple attachments per idea. The checklist has been updated to reflect multiple attachments; decide whether to enforce single-attachment behavior (reject additional uploads) or accept multiple attachments (current behavior).
- `UNDER_REVIEW` transitional status: while `SUBMITTED` and final statuses (`ACCEPTED`/`REJECTED`) are implemented, there is no explicit transition to `UNDER_REVIEW` in the evaluation flow; add a workflow step if required by acceptance tests.

## Input Validation Rules

- `email`: required, must match a reasonable email pattern (e.g. `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`), will be normalized to lowercase before uniqueness check.
- `password`: required, minimum length 8 characters, maximum 128 characters; additional complexity rules optional (documented in plan).
- All inputs must be validated server-side and return field-level error details (avoid leaking implementation internals).

Additional validation rules for Idea/Attachment/Evaluation:

- `title`: required, non-empty, max length 256 characters.
- `description`: required, non-empty, max length 5000 characters.
- `category`: required, must be one of allowed categories (documented in plan) or a free-text string with max length 100.
- `ideaId`: required for attachment/evaluation endpoints; must be a valid UUID and exist in DB.
- Attachment metadata:
  - `filename`: required, max length 255, must not contain path traversal characters.
  - `mimetype`: required, must be in allowed list (default whitelist: `application/pdf`, `image/png`, `image/jpeg`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (`.docx`)).
  - `size`: required, numeric, must be <= `MAX_ATTACHMENT_BYTES` (assumed default 10 * 1024 * 1024 = 10MB unless overridden in config).
  - `url`: required, must be an HTTPS URL or signed URL from configured storage provider.
- Evaluation payload:
  - `decision`: required, allowed values `ACCEPTED` | `REJECTED` (case-sensitive).
  - `comments`: optional, max length 2000 characters.

All validation failures should be returned as `400 Bad Request` with `fields` describing the specific errors.

## Tests to Generate (TDD-first)

All tests MUST be written first and fail (TDD). Tests should be deterministic and runnable in CI.

- Unit tests
  - `auth/validators.test.ts`: email and password validation edge cases
  - `auth/hash.test.ts`: password hashing and verification functions (mock hashing backend in unit tests)
  - `auth/service.test.ts`: business logic for `createUser`, `verifyCredentials`, `generateToken` with mocked DB

 - Idea/Attachment/Evaluation unit tests
   - `ideas/validators.test.ts`: validate `title`, `description`, `category` edge cases
   - `attachments/validators.test.ts`: mimetype whitelist and size limit checks
   - `evaluation/service.test.ts`: atomic update of `Idea.status` and concurrency conflict handling (mock DB transaction failures)

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
      - `tests/integration/ideas.create.test.ts`:
        - submitter can create idea (201)
        - missing fields returns 400
      - `tests/integration/ideas.visibility.test.ts`:
        - evaluator/admin sees all ideas
        - submitter sees only own ideas
        - unauthenticated request gets 401
      - `tests/integration/attachments.test.ts`:
        - author can attach allowed file (201)
        - disallowed mime or oversized file rejected (415/413)
        - when single-attachment policy enforced, second attach returns 409
      - `tests/integration/evaluations.test.ts`:
        - evaluator can accept/reject and idea status updates atomically (201)
        - attempt to evaluate already final idea returns 409
        - non-evaluator attempting to evaluate returns 403
        - concurrent evaluation attempts result in one success and one 409 (simulate concurrency)
    - refresh token rotate-on-use behavior: using a refresh token returns a new refresh token (rotated) and invalidates the previous one
    - reuse of a rotated refresh token must be rejected (detect replay)
    - expired refresh tokens (older than 7 days) must be rejected

- Contract tests
  - Verify response shapes and status codes for auth endpoints (used as guard rails for API consumers)

 - Contract tests for Idea API
   - Verify `POST /api/ideas`, `GET /api/ideas`, `POST /api/ideas/attach`, and `POST /api/evaluations` response shapes and status codes match the spec.

- Security tests
  - Ensure no secrets appear in responses or logs (scan diffs and CI logs)
  - Brute-force simulation tests (basic throttling validation)

 - Additional security tests
   - Verify role elevation does not occur via token tampering (reject tokens without server signature).
   - Ensure signed attachment URLs expire and cannot be reused beyond TTL.

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


