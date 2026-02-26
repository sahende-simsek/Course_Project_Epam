## Story: Upload Attachment

## 1. Story ID and Title
**Story ID:** EPIC-002-002 — Upload Attachment

---

## 2. Title
Upload Attachment

---

## Document Control
| Attribute | Value |
|---|---|
| Story ID | EPIC-002-002 |
| Epic Reference | [specs/innovate-epam/epics/epic-002-ideas.md](specs/innovate-epam/epics/epic-002-ideas.md) |
| PRD Reference | [specs/innovate-epam/prd.md](specs/innovate-epam/prd.md) |
| Version | 0.1 |
| Created | 2026-02-26 |
| Last Updated | 2026-02-26 |
| Author | Engineering Team |
| Assignee | Unassigned |
| Status | Draft |

---

## 3. User Story
As an authenticated user I want to upload attachments via pre-signed URLs so that large files are uploaded securely to object storage.

---

## 4. Description / Details
- Implement `POST /api/uploads/sign` which returns a time-limited pre-signed URL and `attachmentId`.
- Server validates filename, content-type and enforces max size and allowed mime types.

## Main Flow
1. Client requests a signed upload URL via `POST /api/uploads/sign` with filename and content-type.
2. Server validates request and returns a time-limited pre-signed URL and an `attachmentId`.
3. Client uploads file directly to object storage using the pre-signed URL.
4. Client informs the server of upload completion (or includes `attachmentId` when creating resources).
5. Server verifies the upload, marks the attachment as available, and associates it when requested.

## 5. Priority
Medium

## 6. Story Points / Estimate
2 points

## 7. Assumptions
- Object storage (S3-compatible) or local emulator available in env.

## 8. Dependencies
- Storage adapter and permissions.

---

## 9. Acceptance Criteria

### AC-003-001: Signed URL issued
**Scenario:** Request signed URL
```gherkin
Given an authenticated user and valid filename/content-type
When POST /api/uploads/sign is called
Then server returns a pre-signed URL, expiry, and attachmentId
```

### AC-003-002: Upload succeeds and linkable
**Scenario:** Complete upload
```gherkin
Given client uploads file using pre-signed URL
When server is notified of upload completion
Then attachment is stored and can be associated with an idea
```

---

## 10. Non-Functional Requirements
- Signed URLs expire within configured TTL (default 15 minutes).

---

## 11. Testing Strategy
- Integration test for signed upload flow and policy enforcement.

---

## 12. Definition of Done
- ACs met and tests green.
