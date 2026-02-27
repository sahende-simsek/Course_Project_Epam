# Authentication Flow

This document describes the implemented authentication lifecycle and security controls for InnovatePortal.

## Sequence (high-level)
1. User submits credentials to `POST /api/auth/login`.
2. Backend validates credentials (passwords with bcrypt or corporate SSO verification).
3. On success, backend issues:
   - Short-lived JWT access token (in response body) with `jti` and expiry (~10–15 min).
   - Opaque server-side refresh token record saved in DB with `tokenId` (UUID) and metadata.
   - `refresh` cookie set via `Set-Cookie` with the `tokenId` only (HttpOnly, Secure, SameSite=Strict in non-local envs).
4. Client attaches access token to Authorization header for protected API calls.
5. When access token expires, client calls `POST /api/auth/refresh` with cookie present.
6. Backend rotates refresh token transactionally (create new record, mark previous replacedBy). If replay detected, revoke all refresh tokens for user and emit `auth.replay_detected` event.
7. Backend returns new access token and updates `refresh` cookie with new `tokenId`.
8. `POST /api/auth/logout` revokes refresh tokens and clears cookie.

## Token Contracts
- Access token: JWT signed using service key; includes `sub` (userId), `exp`, `iat`, `jti`.
- Refresh token: server-side record with fields: `id` (tokenId), `userId`, `createdAt`, `expiresAt`, `revokedAt`, `replacedBy`.

## Detailed Acceptance Criteria (Auth)
- AC-Auth-01 (Login): `POST /api/auth/login` with valid credentials returns 200, response contains `access_token` and `Set-Cookie` sets `refresh` cookie with `tokenId`; DB contains refresh record.
- AC-Auth-02 (Rotate): `POST /api/auth/refresh` with valid cookie rotates token: the old record is marked `replacedBy` and new record created; response includes new access token and updated cookie.
- AC-Auth-03 (Replay): Reuse of a rotated token must cause revocation of all refresh tokens for that user and return 401; an `auth.replay_detected` event must be logged.
- AC-Auth-04 (Logout): `POST /api/auth/logout` revokes refresh tokens for session and clears cookie (204).

## Security Notes
- Cookie: `HttpOnly`, `Secure` (in prod), `SameSite=Strict` recommended; local dev may use `SameSite=Lax` and non-secure flag only on localhost.
- CSRF: using cookie-based refresh requires CSRF mitigation on state-changing endpoints; `POST /api/auth/refresh` must validate origin or use double-submit cookie pattern if needed.
- Auditing: log `login`, `refresh`, `logout`, `replay-detected` events with request id and user id.
