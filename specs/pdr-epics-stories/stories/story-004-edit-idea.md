## Story: Edit Idea

## 1. Story ID and Title
**Story ID:** EPIC-002-003 — Edit Idea

---

## 2. Title
Edit Idea

---

## Document Control
| Attribute | Value |
|---|---|
| Story ID | EPIC-002-003 |
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
As the idea owner I want to edit my idea so that details remain accurate and attachments can be managed.

---

## 4. Description / Details
- Implement `PUT /api/ideas/:id` with ownership and permission checks.
- Handle add/remove attachments via attachment references and signed upload flow.

## 5. Priority
Medium

## 6. Story Points / Estimate
3 points

## 7. Assumptions
- Idea ownership is stored on idea record and enforced by middleware.

## 8. Dependencies
- Auth service for ownership checks and attachments service.

---

## 9. Acceptance Criteria

### AC-004-001: Owner can edit
**Scenario:** Owner updates idea
```gherkin
Given the user is the idea owner
When PUT /api/ideas/:id is called with valid changes
Then server responds 200 and updates are persisted
```

### AC-004-002: Non-owner forbidden
**Scenario:** Non-owner attempts edit
```gherkin
Given the user is not the owner
When PUT /api/ideas/:id is called
Then server responds 403 and no changes are made
```

---

## 10. Testing Strategy
- Unit tests for permission middleware and update logic.
- Integration test covering add/remove attachments and persistence.

---

## 11. Definition of Done
- ACs met and tests added.
