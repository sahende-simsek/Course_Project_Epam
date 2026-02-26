---
# Product Requirements Document (PRD) — InnovateEPAM

| Attribute | Value |
|-----------|-------|
| **Document ID** | PRD-INNOVATE-001 |
| **Project Name** | InnovateEPAM (InnovatePortal) |
| **Version** | 0.1 |
| **Date** | 2026-02-26 |
| **Author** | Project Team |
| **Status** | Draft |
| **Classification** | Internal |

---

## 1. Purpose / Overview
InnovateEPAM is a web platform to submit, share and evaluate innovation ideas within EPAM teams. It enables authenticated users to create ideas with attachments, have other users evaluate and comment, and lets admins moderate and publish high-quality submissions.

Expanded:
- Provide a lightweight, discoverable place for employees to capture ideas quickly from any device.
- Ensure attachments (design mockups, specs, data samples) can be uploaded securely and linked to idea records.
- Allow peer review and scoring to surface top ideas for evaluation by decision makers.
- Give admins moderation tools to manage quality, abuse, and to promote selected ideas to a public listing.

---

## 2. Background / Context
Organizations need a lightweight, auditable workflow to capture and surface employee-driven innovation. InnovateEPAM replaces ad-hoc spreadsheets and email with a secure, testable and extensible web application integrated with company identity and storage.

Expanded:
- Current practice: ideas are captured in spreadsheets or chat threads which are hard to track and audit.
- InnovateEPAM will centralize idea metadata, attachments, evaluations and audit logs for traceability.
- Integration goals: align with corporate identity provider for authentication and with existing object storage for attachments.

---

## 3. Scope
In scope:
- User authentication and secure session management (access + rotate-on-use refresh tokens).
- Idea creation, edit, and delete with attachments (S3-compatible storage, signed uploads).
- Evaluation workflow: reviewers can score, comment, and flag ideas.
- Admin moderation and publication.

Expanded in-scope details:
- Authentication: implement short-lived JWT access tokens and server-side opaque refresh tokens with rotate-on-use, plus cookie delivery and CSRF protections where applicable.
- Idea CRUD: full create/read/update/delete for idea records, with ownership checks, soft-delete semantics, and versioning for edits.
- Attachments: signed URL upload flow, server-side metadata management, size/type validation, and private storage by default.
- Evaluation: per-idea evaluations, reviewer role checks, aggregation of scores and basic ranking (top N).
- Moderation: admin queue, flagging, manual edit/publish actions, and audit logging for all admin operations.

Out of scope (MVP):
- External single-sign-on federation beyond workplace auth, advanced analytics dashboard, multi-tenant hosting.

Clarification on out-of-scope:
- No multi-tenant or white-label support in MVP; single organizational tenancy only.
- Advanced analytics, reporting and ML-based scoring deferred to post-MVP.

---

## 4. Objectives / Success Criteria
| Objective | Success Indicator | Priority |
|---|---:|---|
| Secure, robust auth | All auth flows covered by automated tests and token rotation implemented | Critical |
| Idea submission & attachments | Users can submit ideas with attachments; uploads succeed and files retrievable | Critical |
| Evaluation workflow | Reviewers can evaluate and scores stored; top 10 ideas can be listed | High |

Expanded success measures:
- Security: no medium/high auth vulnerabilities in static scans; integration tests validate rotate-on-use and replay detection.
- Reliability: permitted file upload failure rate <1% in staging; integration tests for upload flow.
- Usability: 90% of test users can submit an idea with attachments within 3 minutes on first use (measured in UAT).

---

## 5. Stakeholders
| Name | Role | Responsibility |
|---|---|---|
| Product Owner | PO | Define priorities, acceptance criteria |
| Engineering Team | Devs | Build features and tests |
| Security Lead | Sec | Review auth + data policies |
| Platform Ops | Ops | Deploy and maintain services |

Expanded notes:
- Include UX designer in stakeholder reviews for the submission and upload flows.
- Security Lead to sign off on cookie settings, token handling, and S3 ACL policies before production rollout.

---

## 6. User Personas / Target Audience
Persona 1: Employee Innovator
- Role: Contributor
- Goals: Quickly submit ideas with attachments; track status
- Pain Points: Loss of attachments, unclear status

Persona 2: Reviewer
- Role: Peer reviewer or manager
- Goals: Evaluate ideas, provide feedback

Persona 3: Admin
- Role: Moderator
- Goals: Moderate and publish ideas, manage abuse

Expanded persona requirements:
- Contributors: need a simple form, clear upload progress, and receive confirmation with idea ID and link.
- Reviewers: need a queue, history of their reviews, and ability to change evaluations within policy limits.
- Admins: need bulk moderation tools (filter, batch publish/archive), audit logs, and ability to permanently purge if required.

---

## 7. Requirements (Functional & Non-Functional)

This section consolidates both functional and non-functional requirements for easier review and traceability. Functional items describe required behaviors; non-functional items describe quality attributes and operational constraints.

### Functional Requirements

- FR-001: User Authentication
  - Description: Sign-up/login, JWT access token issuance, rotate-on-use refresh tokens stored server-side and delivered via secure cookies.
  - Priority: Must Have
  - Acceptance: Unit + integration tests for login, refresh rotation, replay detection and logout revocation.

- FR-002: Submit Idea
  - Description: Create idea record with title, description, optional attachments (1..N), store metadata and author linkage.
  - Priority: Must Have
  - Acceptance: Integration/E2E test performing signUrl -> upload -> confirm -> create -> retrieve.

- FR-003: Evaluate Idea
  - Description: Authenticated users can submit evaluations (score 1-5 + comment); updates allowed per policy; aggregated score available via API.
  - Priority: Should Have
  - Acceptance: Integration tests asserting aggregation, idempotency and correct error codes for duplicate/finalised evaluations.

Notes (functional specifics):
- Support corporate SSO and password flows (configurable); rate-limit auth endpoints and log suspicious activity.
- Server-side validation: title length, description sanitization, attachment size limit (default 20MiB) and mime whitelist.
- Policy for evaluation updates: define allowed edit-window and conflict/error behavior (e.g., `409 Conflict`).

### Non-Functional Requirements

- NFR-001: Security — refresh cookies `HttpOnly; Secure; SameSite=Strict` (production), rotating signing keys with `kid` header, secrets stored in secrets manager.
- NFR-002: Performance — 95% of API requests <300ms under normal load; auth endpoints 95th percentile <500ms.
- NFR-003: Availability — 99.9% uptime for critical APIs.

Expanded NFR targets and operational controls:
- NFR-004 (Logging/Observability): Emit structured JSON logs for `auth.*`, `upload.*`, and `admin.*` events including `userId`, `action`, `requestId`, and timestamp. Metrics: `upload.success`, `upload.failure`, `auth.refresh.rotate`, `auth.replay_detected`.
- NFR-005 (Backups & Recovery): Daily DB backups; staging retention 30 days, production retention 90 days; recovery runbooks maintained.
- NFR-006 (Operational Constraints): Signed URL TTLs (upload default 10m, download for private items default 1h), resumable upload recommendation for >10MiB, attachment policy enforcement.

---

## 8. Use Cases / User Stories
- UC-01: Submit an idea (see `specs/innovate-epam/stories/story-001-login-refresh.md` for related auth story)

Expanded use cases:
- UC-02: Upload attachments then create idea — client obtains signed URLs, uploads files, then references attachments in idea create call.
- UC-03: Reviewer evaluates and updates score — reviewer adds score and comment; aggregated score recalculates.
- UC-04: Admin moderates — admin views flagged items, edits metadata, publishes or archives ideas.

---

## 9. Assumptions & Dependencies
- Assumes PostgreSQL via Prisma is available in platform environment
- Depends on S3-compatible storage for attachments

Expanded:
- Assumes a secrets management solution to store JWT signing keys and storage credentials.
- Depends on CI pipeline to run migrations and tests; assumes staging environment mirrors production storage config for upload testing.

---

## 10. Acceptance Criteria
- AC-001: Auth flows covered by unit + integration tests demonstrating rotate-on-use
- AC-002: Idea submission integration test passing with file upload

Expanded acceptance criteria examples:
- AC-003: Admin moderation actions persist and are queryable via admin API within 2s.
- AC-004: Attachment download URLs are time-limited and return 200 for authorized users and 403 for unauthorized requests.

---

## 11. Milestones / Timeline
| Milestone | Target Date | Notes |
|---|---:|---|
| MVP release (Auth + Submit) | 2026-03-15 | Includes automated tests |

Expanded timeline considerations:
- Include contingency windows for security review (add 1 week) and for incident fixes discovered during staging.
- Plan a soft launch to a pilot team before org-wide rollout.

---

## 12. Risks & Mitigations
| Risk | Probability | Impact | Mitigation |
|---|---:|---:|---|
| Replay attack on refresh token | Medium | High | Rotate-on-use + revoke all on replay; monitoring and alerting |

Expanded risk register:
- Risk: Misconfigured object storage exposing attachments. Mitigation: enforce private ACLs, run CI checks that validate bucket policies, and scan for public objects daily.
- Risk: Large file uploads causing timeouts. Mitigation: limit single-file size and recommend chunked/resumable uploads for >10MB.
- Risk: Insufficient auth logging. Mitigation: require structured logging and periodic audit reviews before production.

---

## 13. Appendix / References
- See `specs/001-user-auth/spec.md` and `innovate-portal/specs/adr/002-auth-strategy.md` for design details.

---

## 14. Detailed Functional Requirements

- FR-004: Idea Attachments
  - Description: Attachments are uploaded via pre-signed URLs. Uploaded files are scanned for type and size limits and stored in S3-compatible storage with an association to the idea record.
  - Priority: Must Have
  - Acceptance Criteria:
    - AC-FR004.1: Upload pre-signed URL returned and accepted by client within 5s.
    - AC-FR004.2: File metadata stored and accessible via authenticated GET.

- FR-005: Idea Edit & Versioning
  - Description: Users can edit their idea; changes create a version entry for audit/history.
  - Priority: Should Have
  - Acceptance Criteria:
    - AC-FR005.1: Each update produces a new version record with timestamp and actor.

- FR-006: Admin Moderation
  - Description: Admins can flag, edit, or publish ideas. Published ideas are visible to wider audiences.
  - Priority: Should Have
  - Acceptance Criteria:
    - AC-FR006.1: Admin action history is logged and queryable.

Expanded implementation notes:
- Attachments: server returns an `attachmentId` along with signed URL; client must notify server when upload completes so the server can validate checksums and mark attachment as available.
- Versioning: store change-diff metadata and optionally a snapshot of title/description per version for auditability.
- Moderation: admin endpoints must support filtering, sorting and exporting moderation actions for compliance reviews.

## 15. Detailed Non-Functional Requirements

- Security
  - All tokens signed with rotating keys; access tokens TTL <= 15 minutes; refresh TTL configurable (e.g., 30 days) and rotate-on-use.
  - All PII encrypted at rest where required; transport encrypted with TLS 1.2+.

- Scalability
  - System must support 1000 concurrent active sessions with horizontal scaling of API workers.

- Observability
  - All auth events (login, refresh, logout, replay-detection) emitted to event log and metrics.

Expanded operational notes:
- Key rotation: document key rotation procedure and automate rotation in CI/CD where possible.
- Load testing: run a capacity test to validate 1000 concurrent sessions and scale rules in autoscaling groups.
- Monitoring: create alerts for refresh rotation failures, replay-detection events, and upload error spikes.

## 16. Data Model (Core Entities)

```typescript
interface User {
  id: string; // uuid
  email: string;
  name?: string;
  createdAt: string;
}

interface Idea {
  id: string;
  authorId: string; // User.id
  title: string;
  description: string;
  status: 'draft' | 'published' | 'flagged' | 'archived';
  createdAt: string;
  updatedAt?: string;
}

interface Attachment {
  id: string;
  ideaId: string;
  storagePath: string;
  filename: string;
  contentType: string;
  size: number;
}

interface Evaluation {
  id: string;
  ideaId: string;
  reviewerId: string; // User.id
  score: number; // 1-5
  comment?: string;
  createdAt: string;
}

interface RefreshToken {
  id: string; // tokenId stored in cookie
  userId: string;
  createdAt: string;
  expiresAt: string;
  revokedAt?: string;
  replacedBy?: string; // token id
}

Expanded data notes:
- Consider indexing `userId` and `revokedAt` for efficient revocation queries.
- Enforce foreign key constraints for attachments -> idea and idea -> user.
- Add soft-delete flags and `deletedAt` timestamps where needed for auditability.
```

## 17. Traceability Matrix (sample)

| Req ID | Requirement Short | Use Case | Test Case | Status |
|---|---|---|---|---|
| FR-001 | Auth | UC-Auth | TC-auth-01 | ☐ |
| FR-002 | Submit Idea | UC-Submit | TC-submit-01 | ☐ |

## 18. Acceptance Criteria

- AC-Auth-01: Login returns JWT access token and sets `refresh` cookie with tokenId present in DB.
- AC-Auth-02: Refresh rotates token: old token marked `replacedBy` and new token created; cookie updated.
- AC-Auth-03: Reuse of rotated token triggers revocation of all tokens for user and emits `auth.replay_detected` event.
- AC-IO-01: Idea submission integration test uploads file using pre-signed URL and creates idea with attachment record.

## 18.1 Auth: Acceptance Criteria 

- AC-Auth-01a (Login happy path): Given valid credentials, POST /api/auth/login responds 200 with JSON { access_token, expires_in } and `Set-Cookie: refresh=<tokenId>; Path=/; HttpOnly; Secure; SameSite=Strict` (or dev variant). The backend stores a refresh record with `id=tokenId`, `userId`, `expiresAt`.

- AC-Auth-01b (Login failure): Given invalid credentials, POST /api/auth/login responds 401 and no cookie is set.

- AC-Auth-02a (Refresh rotate happy path): Given a valid non-rotated refresh tokenId in cookie, POST /api/auth/refresh returns 200 with new access_token and sets cookie to new tokenId; DB shows old token `replacedBy=newId` and new token active.

- AC-Auth-02b (Refresh expired): Given an expired refresh token, POST /api/auth/refresh returns 401 and clears cookie.

- AC-Auth-03a (Replay detection): If a rotated tokenId is presented (i.e., already `replacedBy` another token), server revokes all refresh tokens for that user (mark `revokedAt`) and returns 401; an `auth.replay_detected` event with userId, tokenId and request id is emitted to logs.

- AC-Auth-04 (Logout): POST /api/auth/logout revokes the specific session or all sessions (based on payload) and returns 204; cookie cleared.

## 18.2 Upload Flow: Steps and API Contract

Flow summary:
1. Client requests a signed URL: `POST /api/uploads/sign` with JSON { filename, contentType, size }.
2. Server validates policy (size, mime) and returns `{ uploadUrl, attachmentId, expiresAt }`.
3. Client PUTs file directly to `uploadUrl` (S3) using the provided headers.
4. Client notifies server: `POST /api/uploads/confirm` with `{ attachmentId, checksum?, size }`.
5. Server validates availability (optionally checks checksum), marks attachment available and links to temporary session or user.

API contract examples:

POST /api/uploads/sign
Request: { filename: string, contentType: string, size: number }
Response: { uploadUrl: string, attachmentId: string, expiresAt: string }

POST /api/uploads/confirm
Request: { attachmentId: string, checksum?: string }
Response: 200 on success, attachment metadata in body.

Acceptance tests:
- AC-UP-01: Signed URL issued within 2s and is usable for upload (integration test that performs sign -> upload -> confirm).
- AC-UP-02: Server rejects sign requests violating size/mime policy with 400 and descriptive error.
- AC-UP-03: Confirm step validates presence of object in storage and sets `available=true` in metadata; failing confirmation marks attachment as `failed`.

Expanded acceptance notes:
- Ensure unit tests simulate rotation and replay paths including DB state transitions and event emission.
- Include an end-to-end smoke test that authenticates, uploads an attachment, creates an idea, and verifies the attachment is associated and retrievable.

## 19. Success Metrics

- Metric 1: Auth test coverage >= 90% for auth domain logic (unit + integration).
- Metric 2: Upload success rate >= 99% in staging for supported file types.

Expanded measurement plan:
- Implement observability metrics for `upload.success`, `upload.failure`, `auth.refresh.rotate`, and `auth.replay.detected` and record them in staging for one week before production.
- Add UAT acceptance where a pilot group runs task flows to validate usability metrics.

## 20. Milestones & Timeline 

| Milestone | Target Date | Owner |
|---|---:|---|
| Auth core + tests | 2026-03-01 | Backend Team |
| Idea submission + uploads | 2026-03-08 | Backend + Frontend |
| Evaluation workflow + admin | 2026-03-15 | Full Team |

## 21. Risks & Mitigations 

| Risk | Prob | Impact | Mitigation |
|---|---:|---:|---|
| Token replay attacks | Medium | High | Rotate-on-use; revoke; monitoring; incident runbook |
| Large file uploads cause timeouts | Medium | Medium | Enforce size limits and use resumable uploads for >10MB |
| Data leak through misconfigured S3 ACLs | Low | High | Enforce private ACLs by default; automated checks in CI |

## 22. Next Steps / Plan

1. Triage and convert PRD items into epics/stories (create idea/evaluation/admin epics) and prioritize for MVP sprints.
2. Implement `T1` from `STORY-001` (login should persist refresh token and set real cookie) and add corresponding integration test.
3. Add integration tests for upload and refresh rotation; run them in CI against a staging environment with real storage and DB.
4. Schedule security review and a pilot release to a small user group; gather feedback and iterate before full rollout.

