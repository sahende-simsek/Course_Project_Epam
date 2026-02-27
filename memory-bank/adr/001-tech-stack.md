# ADR 001 — Tech Stack Selection

## Status
Accepted

## Context

We are building the InnovatePortal MVP, an employee innovation management platform.

Requirements:
- Fast MVP development (within hours)
- AI-assisted development (SpecKit workflow)
- Clean architecture and maintainability
- Scalable to production later
- Authentication + database + API support

We need to choose a tech stack that balances:
- Development speed
- Simplicity
- Scalability

## Decision

We will use the following stack:

- **Frontend & Backend**: Next.js (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT-based authentication
- **Styling**: TailwindCSS

## Rationale

### Next.js (App Router)
- Unified frontend + backend (API routes)
- Fast setup for MVP
- Good developer experience
- Easy deployment

### TypeScript (strict)
- Type safety reduces runtime bugs
- Better AI-generated code quality
- Improves maintainability

### PostgreSQL
- Production-ready relational database
- Strong consistency and reliability
- Better than SQLite for scaling

### Prisma ORM
- Type-safe database access
- Fast schema evolution
- Excellent developer experience

### JWT Authentication
- Stateless and simple for MVP
- Easy to integrate with APIs
- Scalable for microservices later

### TailwindCSS
- Rapid, utility-first styling for consistent UI
- Fast to scaffold responsive layouts for MVP

## Consequences

- Pros:
  - Rapid developer iteration and good DX for small teams
  - Strong TypeScript + Prisma synergy reduces runtime errors
  - Easy to deploy to Vercel, Render, or other Node hosts

- Cons / Trade-offs:
  - JWT-based auth needs careful handling for refresh/revocation (see ADR for token strategy)
  - Some production concerns (DB migrations, operational runbooks) require follow-up work

## Follow-ups / Implementation Notes

- Document token strategy and revocation as a separate ADR (recommended: rotate-on-use refresh cookie + server-side refresh records).
- Add `prisma/schema.prisma` models for `User`, `Idea`, `Attachment`, `Evaluation`, and `RefreshToken` as needed.
- Configure TypeScript `strict` and CI checks (lint, typecheck, tests) as part of repo setup.

## Auth token strategy (decision detail)

To satisfy `specs/001-user-auth/spec.md` requirements for revocation and replay detection (FR-004, SC-005), we adopt the following concrete token strategy as part of the tech-stack ADR:

- Access tokens: JWTs with short TTL (default 1 hour). Include minimal claims plus `jti` (token id) and `kid` (signing key id). Signed with rotating keys; verify `kid` at validation time.
- Refresh tokens: opaque tokens stored server-side in a `RefreshToken` table. Each refresh record contains `id`, `jti`, `userId`, `parentTokenId` (nullable), `issuedAt`, `lastUsedAt`, `expiresAt`, `revoked` flag, and optional `metadata` (ip, userAgent).
- Delivery: refresh tokens are delivered to browser clients only via `Set-Cookie` as `HttpOnly; Secure; SameSite=Strict` (or `Lax` if required for cross-site flows). Do not return refresh tokens in JSON for browser flows.
- Rotation: implement rotate-on-use. When `/api/auth/refresh` is called with a valid refresh cookie, create a new refresh record (child), revoke the presented record (set `revoked=true` and `parentTokenId`), set the new cookie, and return a new access token. Detect reuse by observing a presented token that was already rotated (parent/child mismatch) and treat as replay attack (revoke sibling chain and alert/log `refresh_replay_detected`).
- Logout and revocation: `POST /api/auth/logout` revokes the active refresh record(s) for the user and clears the cookie. Admins can revoke all refresh tokens for a user.
- Cleanup: run a periodic cleanup job to prune expired or revoked refresh records (scripts/cleanup/refresh-tokens.js planned in tasks).

Rationale: this concrete approach gives deterministic server-side revocation, reduces replay windows through rotation, provides auditable events for security monitoring, and matches the spec's acceptance criteria.


## References

- specs/001-user-auth/spec.md
- innovatEPortal spec checklist and tasks
