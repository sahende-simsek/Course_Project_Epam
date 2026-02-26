## Story: View Idea List & Details

## 1. Story ID and Title
**Story ID:** EPIC-002-005 — View Idea List & Details

---

## 2. Title
View Idea List & Details

---

## Document Control
| Attribute | Value |
|---|---|
| Story ID | EPIC-002-005 |
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
As a user I want to browse and view idea details so that I can discover and inspect ideas including attachments and evaluations.

---

## 4. Description / Details
- Implement `GET /api/ideas` with cursor or offset pagination, filters for tag and status.
- Implement `GET /api/ideas/:id` returning full details and attachment download URLs when authorized.

## Main Flow
1. Client requests a paginated list via `GET /api/ideas?limit=<n>&cursor=<x>` or filters.
2. Server returns up to `n` idea summaries and a cursor for the next page.
3. User selects an idea and client requests `GET /api/ideas/:id` for details.
4. Server returns full idea details, attachment metadata, and any authorized download URLs.

## 5. Priority
Medium

## 6. Story Points / Estimate
3 points

## 7. Assumptions
- Public vs private visibility controlled by `status` field.

## 8. Dependencies
- Caching, pagination utilities, and attachments service.

---

## 9. Acceptance Criteria

### AC-006-001: Paginated list
**Scenario:** List retrieval
```gherkin
Given multiple ideas exist
When GET /api/ideas?limit=10 is called
Then server returns up to 10 ideas and a cursor for the next page
```

### AC-006-002: Detail view
**Scenario:** View idea detail
```gherkin
Given an idea with attachments
When GET /api/ideas/:id is called by authorized user
Then server returns idea fields and attachment download metadata
```

---

## 10. Testing Strategy
- Integration tests for pagination correctness and filtering.

---

## 11. Definition of Done
- ACs validated and documented.
