# Release Notes — User Authentication (001-user-auth)

Date: 2026-02-24

Summary
- Adds email/password registration, login, logout flows.
- Implements JWT access tokens (1 hour TTL) and rotate-on-use refresh tokens (7 day TTL) delivered as HttpOnly, Secure cookies.
- Server-side refresh token records with revocation and replay detection.

Migration Notes
- Adds `RefreshToken` Prisma model (see `prisma/schema.prisma`). Run `npx prisma migrate dev --name add_refresh_token` before enabling refresh endpoints.

Rollout
- Deploy migration before enabling refresh endpoints. Use feature flag to toggle refresh flow if needed.

Operational Notes
- Ensure `JWT_SECRET` (or `JWT_KEY_<kid>` with `JWT_CURRENT_KID`) is set in production secrets.
- CI includes a diff-based secret-scan step; verify it passes on the feature branch.

Known Limitations
- Integration tests are placeholders and require test DB wiring to run.
- Rate-limiter is an in-memory demo; replace with Redis or other store for production.
