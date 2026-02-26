# STORY-002: Submit Idea

Summary: Authenticated users can submit a new idea with title, description, optional tags, and optionally attach files via signed upload flow.

Preconditions:

Main Flow:
1. Client displays a create idea form.
2. User fills title, description, optional tags, and requests file upload(s).
3. For each file, client requests a signed upload URL and uploads file directly to storage.
4. Client POSTs idea metadata (title, description, attachment references) to `/api/ideas`.
5. Server validates input, creates idea record, returns idea id and location.


## Story: Submit Idea

## 1. Story ID and Title
**Story ID:** EPIC-002-001 — Submit Idea

---

## 2. Title
Submit Idea

---

## Document Control
| Attribute | Value |
|---|---|
| Story ID | EPIC-002-001 |
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
As an authenticated user I want to submit a new idea with optional attachments so that my idea is stored and attachments are linked securely.

---

## 4. Description / Details
- Implement `POST /api/ideas` to accept title, description, tags, and attachment references.
- File attachments must be uploaded via pre-signed URLs; server only stores references (S3 keys).

## 5. Priority
Medium

## 6. Story Points / Estimate
3 points

## 7. Assumptions
- User authentication and upload service are available.

## 8. Dependencies
- Signed upload service and attachments table/migrations.

## 9. Notes / Comments
- Validate attachments belong to user or temporary upload session.

---

## 10. Acceptance Criteria

### AC-002-001: Create idea
**Scenario:** Successful idea submission
```gherkin
Given an authenticated user with valid payload
When POST /api/ideas is called with title and description
Then server returns 201 with created idea id and location header
And idea record exists in DB with the provided fields
```

### AC-002-002: Attachments linked
**Scenario:** Attachments associated with idea
```gherkin
Given attachments uploaded via signed URLs
When idea is created with attachment references
Then attachments are linked to the idea and retrievable via API
```

---

## 11. Non-Functional Requirements
- Payload validation and rate limiting apply.

---

## 12. Testing Strategy
- Unit tests for input validation and attachment linking.
- Integration test covering signed upload + idea create flow.

---

## 13. Definition of Done
- All ACs met, tests passing, docs updated.
