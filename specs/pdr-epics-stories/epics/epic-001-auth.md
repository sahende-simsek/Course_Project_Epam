---
# EPIC-001: Authentication & Session Management

> **Standard Compliance:** SAFe 6.0, OWASP Top 10, BABOK v3

| Epic ID | EPIC-001 |
|--------:|:--------|
| PRD Reference | PRD-INNOVATE-001 |
| Version | 0.1 |
| Created | 2026-02-26 |
| Last Updated | 2026-02-26 |
| Author | Product Team |
| Owner | Security/Product Owner |
| Status | Draft |

---

## 1. Epic Summary
Provide a secure, auditable session lifecycle and authentication system covering login, access token issuance, refresh-token rotation (rotate-on-use), replay detection and revocation, logout, and secure cookie handling. This epic establishes the baseline security, operational, and testing expectations for all auth flows used by the platform.

## 2. Primary Persona
- Security-conscious end user (employee) who needs secure, predictable authentication behavior with minimal friction.

## 3. Business Value / Rationale
- Reduces risk of account takeover and replay attacks through rotate-on-use refresh tokens.
- Enables reliable, testable session management for downstream features (ideas, uploads, evaluations).
- Provides auditability for security and compliance reviews.

## 4. Acceptance Criteria (Epic-level)
- EAC-01: Login issues a short-lived JWT access token and creates a server-side refresh token record with a `tokenId` returned only as an HttpOnly cookie.
- EAC-02: `POST /api/auth/refresh` rotates the refresh token record on successful use, issues a new access token, and sets a new `refresh` cookie containing the new `tokenId`.
- EAC-03: Reuse (replay) of a rotated refresh token causes immediate revocation of all refresh tokens for the affected user, logs an `AuthEvent` with metadata (ip, userAgent), and responds with 401.
- EAC-04: `POST /api/auth/logout` revokes refresh tokens for the session or user as appropriate and clears the `refresh` cookie.
- EAC-05: All cookie settings: `HttpOnly`, `Secure` in non-local envs, `SameSite=Strict`, `Path=/`, and Max-Age aligned with refresh TTL.

## 5. Success Metrics / Definition of Done
- Auth unit and integration tests cover login, refresh rotation, replay, and logout flows (100% for critical paths).
- No critical security findings in a post-implementation security review focused on token handling.
- E2E flow demonstrates user login → refresh → logout without manual cookie tampering.

## 6. Stakeholders / Owners
| Name | Role | Responsibility |
|---|---|---|
| Product Owner | PO | Prioritize and accept stories |
| Security Lead | Sec | Approve design, review audits |
| Engineering | Devs | Implement flows and tests |
| Ops | Ops | Manage secrets and deployments |

## 7. Dependencies
- Key management / env secrets (JWT signing key) available in platform.
- Database (Postgres + Prisma) for refresh token records.
- Cookie and deployment configuration supporting Secure cookies behind proxy.

## 8. Scope / Out of Scope
In scope:
- Login endpoint, refresh endpoint, logout, refresh token DB schema, rotate-on-use logic, replay detection, audit logging, and relevant tests.
Out of scope:
- Third-party SSO federation (outside initial workplace auth), session mirroring across multiple identity providers.

## 9. User Stories (child items)
- STORY-001: Login, Refresh and Rotation
- STORY-009: Refresh token DB schema & repo
- STORY-010: Audit & AuthEvent logging
- STORY-011: Token signing key rotation plan

## 10. Timeline / Milestones
| Milestone | Target Date | Notes |
|---|---:|---|
| Implement stories & unit tests | 2026-02-28 | Core logic and repo functions complete |
| Integration & E2E tests | 2026-03-03 | End-to-end login/refresh/replay covered |
| Security review & sign-off | 2026-03-05 | Review of cookie, key management, and replay handling |

## 11. Risks / Assumptions
- Risk: Misconfigured Secure cookie settings when running behind dev proxies — mitigate with clear environment docs and automated checks.
- Assumption: Time-synchronized servers for token expiry semantics.

## 12. Technical Considerations
- Use opaque `tokenId` values stored in DB (UUIDs) rather than raw tokens in cookies.
- Access tokens are JWTs with short TTL (e.g., 5–15 minutes) signed with HS256/RS256 per deployment policy.
- Rotate-on-use implementation must be transactional to avoid race conditions.

## 13. References / Links
- PRD: PRD-INNOVATE-001
- ADR: `innovate-portal/specs/adr/002-auth-strategy.md`
- Refresh implementation: `src/auth/domain/refreshService.ts`


---

