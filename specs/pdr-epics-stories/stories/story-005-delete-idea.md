## Story: Delete Idea

## 1. Story ID and Title
**Story ID:** EPIC-002-004 — Delete Idea

---

## 2. Title
Delete Idea

---

## Document Control
| Attribute | Value |
|---|---|
| Story ID | EPIC-002-004 |
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
As an idea owner or admin I want to delete an idea so that inappropriate or outdated ideas can be removed.

---

## 4. Description / Details
- Implement `DELETE /api/ideas/:id` performing soft-delete (status=deleted).
- Provide an admin-only purge endpoint to permanently remove records if required by policy.

## Main Flow
1. Client (owner or admin) initiates delete by calling `DELETE /api/ideas/:id`.
2. Server verifies permissions and performs a soft-delete (mark `status=deleted`).
3. Server returns 204 No Content on success and writes an audit log entry.
4. If admin requests purge, admin calls `POST /api/admin/ideas/:id/purge`; server permanently removes records per policy and returns 200.

## 5. Priority
Low

## 6. Story Points / Estimate
2 points

## 7. Assumptions
- Audit logs and retention policy are respected.

## 8. Dependencies
- Auth/permission middleware and audit logging.

---

## 9. Acceptance Criteria

### AC-005-001: Owner delete
**Scenario:** Owner deletes idea
```gherkin
Given the user is the idea owner
When DELETE /api/ideas/:id is called
Then server responds 204 and idea is marked deleted
```

### AC-005-002: Admin purge
**Scenario:** Admin permanently removes idea
```gherkin
Given an admin user
When POST /api/admin/ideas/:id/purge is called
Then server permanently removes record and related attachments per policy
```

---

## 10. Testing Strategy
- Tests for permission matrix and soft vs permanent delete behaviors.

---

## 11. Definition of Done
- ACs met and tests added.
