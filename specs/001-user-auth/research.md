# research.md

## Decisions

- Decision: Use HttpOnly, Secure, SameSite cookie for refresh tokens (server sets cookie).  
  - Rationale: reduces XSS attack surface; aligns with server-side rotation and revocation.  
  - Alternatives considered: returning refresh token in JSON (client storage) — rejected for MVP due to increased XSS risk; short-lived access-only tokens — rejected for UX reasons.

- Decision: Rotate-on-use refresh tokens with default TTL 7 days.  
  - Rationale: minimizes window for token theft while supporting session continuity.  
  - Alternatives: single long-lived refresh token (30 days) — easier but larger compromise window; no refresh tokens — requires frequent re-login.

- Decision: Access token TTL default 1 hour (configurable via env).  
  - Rationale: balances usability and security; short enough to limit exposure, long enough to avoid frequent refresh.

## Cookie Attributes

- `HttpOnly`, `Secure`, `SameSite=Lax` (or Strict for high-security deployments).  
- `Path=/`, set `SameSite` depending on cross-site requirements.  
- `Expires` set per refresh token TTL; rotated cookie is given new `Expires`.

## Revocation & Replay Detection

- Store refresh tokens server-side with fields: `tokenId` (jti), `parentTokenId`, `issuedAt`, `lastUsedAt`, `expiresAt`, `revoked`.  
- On rotate: create new refresh token record, mark previous `revoked=true` and set `parentTokenId` link.  
- On detection of reuse of an already-rotated token, revoke all tokens for the associated user and log an `auth_replay_detected` event for investigation.

## Tests to validate decisions

- Integration test `auth.refresh.test.ts` covering rotate-on-use, replay rejection, expiry.  
- Contract tests verifying Set-Cookie presence and attributes on login/refresh responses.

## Unknowns / Open areas

- Exact rate limits and lockout thresholds — define in Phase 1.
- Cookie domain/path settings depending on deployment (document in quickstart and deployment docs).
