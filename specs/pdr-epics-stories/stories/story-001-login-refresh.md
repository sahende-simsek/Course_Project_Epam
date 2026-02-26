# Story: Login, Refresh and Rotation

## 1. Story ID and Title
**Story ID:** EPIC-001-001 — Login, Refresh and Rotation

---

## 2. Title
Login, Refresh and Rotation

---

> **Standard Compliance:** Scrum Guide 2020, INVEST Principles, BABOK v3, IEEE 830

---

## Document Control
| Attribute | Value |
|---|---|
| Story ID | EPIC-001-001 |
| Epic Reference | [specs/innovate-epam/epics/epic-001-auth.md](specs/innovate-epam/epics/epic-001-auth.md) |
| PRD Reference | [specs/innovate-epam/prd.md](specs/innovate-epam/prd.md) |
| Version | 0.1 |
| Created | 2026-02-26 |
| Last Updated | 2026-02-26 |
| Author | Engineering Team |
| Assignee | Unassigned |
| Status | Draft |

---

## 3. User Story
As an authenticated user I want a secure session lifecycle (login + refresh) so that my session can be renewed without re-entering credentials and refresh replay attacks are detected.

---

## 4. Description / Details
- Implement `POST /api/auth/login`, `POST /api/auth/refresh`, and `POST /api/auth/logout`.
- Login creates a refresh DB record and sets an HttpOnly `refresh` cookie containing a `tokenId` (opaque UUID).
- Refresh rotates the DB row transactionally and issues a new access token and rotated cookie.

## Main Flow
1. Client submits credentials to `POST /api/auth/login`.
2. Server validates credentials, creates a refresh DB record, issues an access token, and sets an HttpOnly `refresh` cookie containing `tokenId`.
3. Client stores access token and uses it for authenticated requests.
4. When access token expires, client calls `POST /api/auth/refresh` with the `refresh` cookie.
5. Server rotates the refresh record transactionally and returns a new access token and updated `refresh` cookie.
6. Client replaces stored tokens and continues; if a replay is detected, server returns 401 and logs an AuthEvent.

## 5. Priority
High

## 6. Story Points / Estimate
5 points

## 7. Assumptions
- DB (Postgres) and secrets (JWT key) available in environment.

## 8. Dependencies
- `STORY-009` (refresh repo/schema) — DB schema and repo helpers must exist.

## 9. Notes / Comments
- Use `AuthEvent` log for security-relevant events (replay, revoke).

## 10. Attachments / References
- `src/auth/domain/refreshService.ts`
- `src/auth/infra/refreshRepo.ts`

---

## 11. Acceptance Criteria

### AC-EPIC001-001: Login returns cookies and access token
**Scenario:** Successful login
```gherkin
Given valid credentials
When POST /api/auth/login is called
Then response 200 contains access token
And Set-Cookie header sets `refresh` cookie with tokenId
And a refresh record exists in DB for user and tokenId
```

### AC-EPIC001-002: Refresh rotates token
**Scenario:** Successful refresh
```gherkin
Given a valid `refresh` cookie referencing active tokenId
When POST /api/auth/refresh is called
Then refreshRepo creates a rotated token record and returns new access token
And Set-Cookie updates `refresh` with new tokenId
```

### AC-EPIC001-003: Replay detection revokes all tokens
**Scenario:** Reuse of rotated token
```gherkin
Given a refresh tokenId already rotated
When same tokenId is used again
Then server revokes all refresh tokens for that user and returns 401
And an AuthEvent is logged with metadata
```

### AC-EPIC001-004: Logout revokes and clears cookie
**Scenario:** Logout
```gherkin
Given user has active session
When POST /api/auth/logout is called
Then server revokes refresh tokens and returns 204
And Set-Cookie clears `refresh` cookie
```

---

## 12. Non-Functional Requirements
- NFR-S-01: Cookies must be `HttpOnly`, `SameSite=Strict`, `Secure` in non-local envs.
- NFR-P-01: Access token issuance latency <100ms.

---

## 13. Technical Notes
- Implement transactional rotate-on-use in `refreshRepo.createRotatedToken(parentId, ...)`.
- Use UUID `tokenId` stored server-side; cookie contains only tokenId.

---

## 14. Dependencies & Risks
- DEP-01: Database migrations for refresh token table must be applied.
- R-01: Misconfigured cookie Secure flag in dev -> document env exceptions.

---

## 15. Estimation & Planning
- Complexity: Medium
- Story Points: 5

---

## 16. Testing Strategy
- Unit tests for `refreshService` and `refreshRepo`.
- Integration test for full login → refresh → replay flow.

---

## 17. Definition of Done
- See template DoD; all ACs verified, tests passing, docs updated.
