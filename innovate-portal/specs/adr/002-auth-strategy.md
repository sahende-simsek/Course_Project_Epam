# ADR 002 — Auth Strategy: JWT vs Session & Token Handling

## Status
Proposed

## Context

The `001-user-auth` feature requires a clear decision on session management and token handling that balances security, simplicity, and developer velocity for the MVP. Requirements include server-side revocation, short-lived access tokens, and support for role propagation in issued tokens.

## Decision

Adopt a hybrid approach:
- Use JWT access tokens (short TTL, e.g. 1h) for API authorization and carrying minimal claims (user id, role, `jti`, `kid`).
- Use opaque, server-stored refresh tokens for session renewal and deterministic revocation. Deliver refresh tokens to browsers only via `HttpOnly; Secure; SameSite` cookies and implement rotate-on-use refresh logic.

## Rationale

- JWT access tokens are compact, verifiable, and efficient for stateless authorization across services. Including `jti` and `kid` enables per-token tracking and key rotation.
- Opaque refresh tokens stored in DB provide a straightforward revocation mechanism and enable replay detection when combined with rotate-on-use. This meets the spec requirement for server-side revocation and auditability.
- Returning refresh tokens in JSON increases XSS exposure; cookie delivery reduces that risk for browser clients.

## Token handling details

- Signing: Use an asymmetric or symmetric key pair per deployment; include `kid` in JWT header for key rotation.
- Access token validation: verify signature, expiry, and optional revocation by `jti` (for high-security flows; otherwise rely on short TTL).
- Refresh flow: `/api/auth/refresh` reads refresh cookie, validates server record, creates child record, revokes parent, sets new cookie, returns new access token.
- Replay detection: if a presented refresh token has been rotated (parent already revoked), treat as replay — revoke the whole chain and log `refresh_replay_detected`.
- Logout: revoke active refresh records and clear cookie.

## Consequences

- Pros: Deterministic revocation, reduced XSS exposure, auditability, and good developer ergonomics.
- Cons: Extra DB writes for refresh rotation and complexity for token cleanup; requires careful cookie/CORS configuration.

## Alternatives Considered

- Pure server-session (session id, server store): good revocation but less convenient for distributed services and scaling; rejected for cross-service auth scenarios.
- Stateless refresh JWTs: simpler storage but hard to revoke without allowlists; rejected because spec requires server-side revocation.

## Follow-ups

- Add `RefreshToken` Prisma model and migration (see tasks T004/T020).
- Implement structured `AuthEvent` logging for refresh/replay events (T024).
- Add tests for rotate-on-use and replay detection (T022/T023).
