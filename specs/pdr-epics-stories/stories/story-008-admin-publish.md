## Story: Admin Publish / Moderation

## 1. Story ID and Title
**Story ID:** EPIC-002-007 — Admin Publish / Moderation

---

## 2. Title
Admin Publish / Moderation

---

## Document Control
| Attribute | Value |
|---|---|
| Story ID | EPIC-002-007 |
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
As an admin I want to moderate and publish ideas so that curated content appears publicly.

---

## 4. Description / Details
- Provide admin endpoints for moderation queue, changing idea status, and adding editorial notes.
- Publishing sets idea `status=published` and creates an audit log entry with admin metadata.

## Main Flow
1. Admin views the moderation queue via `GET /api/admin/ideas?status=flagged`.
2. Admin reviews an idea and selects the publish action.
3. Client issues `POST /api/admin/ideas/:id/publish` with any editorial notes.
4. Server verifies admin privileges, sets `status=published`, creates an audit log entry that includes admin metadata and the provided editorial note, and returns 200 including the recorded editorial note in the response payload.
5. Client displays a publish confirmation and shows the admin's editorial note beneath the action (not just a generic "recorded" label).

## 5. Priority
Low

## 6. Story Points / Estimate
3 points

## 7. Assumptions
- Admin role and audit logging infrastructure exist.

## 8. Dependencies
- Auth roles, audit log service, public listing behavior.

---

## 9. Acceptance Criteria

### AC-008-001: Moderation queue
**Scenario:** Admin views flagged ideas
```gherkin
Given admin privileges
When GET /api/admin/ideas?status=flagged is called
Then server returns moderation queue entries
```

### AC-008-002: Publish action
**Scenario:** Admin publishes idea
```gherkin
Given an idea in moderation
When POST /api/admin/ideas/:id/publish is called
Then idea status is set to published and audit log entry is created
```

---

## 10. Testing Strategy
- Integration tests for moderation flows and audit logs.

---

## 11. Definition of Done
- ACs met and tests added.
