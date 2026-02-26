## Story: Evaluate Idea (Reviewer)

## 1. Story ID and Title
**Story ID:** EPIC-002-006 — Evaluate Idea

---

## 2. Title
Evaluate Idea (Reviewer)

---

## Document Control
| Attribute | Value |
|---|---|
| Story ID | EPIC-002-006 |
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
As a reviewer I want to submit an evaluation so that ideas can be scored and ranked for consideration.

---

## 4. Description / Details
- Implement `POST /api/ideas/:id/evaluations` that records score and optional comment; update aggregated metrics.
- Decide duplicate evaluation policy (update existing vs reject) and document it.

## 5. Priority
Medium

## 6. Story Points / Estimate
3 points

## 7. Assumptions
- Reviewer role and permissions exist.

## 8. Dependencies
- Auth role checks and aggregation background jobs or DB triggers.

---

## 9. Acceptance Criteria

### AC-007-001: Submit evaluation
**Scenario:** Reviewer submits evaluation
```gherkin
Given a reviewer and valid evaluation payload
When POST /api/ideas/:id/evaluations is called
Then server returns 201 and evaluation is stored
And idea aggregated score is updated
```

### AC-007-002: Duplicate handling
**Scenario:** Duplicate evaluation attempt
```gherkin
Given a reviewer that already evaluated the idea
When the reviewer posts another evaluation
Then server follows the chosen duplicate policy (update or reject)
```

---

## 10. Testing Strategy
- Unit tests for aggregation and duplicate handling.

---

## 11. Definition of Done
- ACs met and tests added.
