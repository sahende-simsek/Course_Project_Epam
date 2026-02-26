# EPIC-002: Idea Submission & Evaluation

**Epic ID:** EPIC-002
**PRD Reference:** PRD-INNOVATE-001
**Version:** 0.1
**Created:** 2026-02-26
**Author:** Product Team
**Owner:** Product Owner
**Status:** Draft

## 1. Epic Summary
Enable users to submit, manage and evaluate ideas with attachments. Provide reviewer workflows and admin moderation so high-quality ideas can be surfaced and published.

## 2. Primary Persona
- Employee Innovator (contributor)

## 3. Business Value / Rationale
Collecting and surfacing employee ideas in a managed system increases discoverability, reduces loss of submissions, and enables evidence-based selection.

## 4. Acceptance Criteria (Epic)
- EAC-01: Users can create ideas with optional attachments and retrieve them.
- EAC-02: Reviewers can submit evaluations (score + comment) tied to an idea.
- EAC-03: Admins can moderate (publish/unpublish) ideas.

## 5. Success Metrics
- Number of ideas submitted per month
- % of ideas evaluated within 14 days
- Time from submission to publish (median)

## 6. Stakeholders
| Name | Role | Responsibility |
|---|---|---|
| Product Owner | PO | Prioritize, accept stories |
| Engineering | Devs | Implement features and tests |
| Security | Sec | Approve attachment & data policies |

## 7. Dependencies
- Storage service (S3-compatible) for attachments
- Auth epic (EPIC-001) must be available for secure flows

## 8. Scope / Out of Scope
In scope: create/edit/delete ideas, upload attachments, list and view ideas, evaluate, admin publish.
Out of scope: external integrations, advanced analytics.

## 9. User Stories (child items)
- STORY-002: Submit idea
- STORY-003: Upload attachment
- STORY-004: Edit idea
- STORY-005: Delete idea
- STORY-006: View idea list & details
- STORY-007: Evaluate idea (reviewer)
- STORY-008: Admin publish / moderation

## 10. Timeline / Milestones
| Milestone | Target Date | Notes |
|---|---:|---|
| Stories implemented & tested | 2026-03-05 | Aim for MVP delivery of core flows |

## 11. Risks / Assumptions
- Assumes storage credentials and bucket available.
- Risk: Large file uploads may require chunking or limits — mitigate via max file size and signed uploads.

## 12. References
- PRD: PRD-INNOVATE-001
- Auth ADR: `innovate-portal/specs/adr/002-auth-strategy.md`

---
