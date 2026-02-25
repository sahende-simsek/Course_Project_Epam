# Checklist: User Auth + Ideas MVP Requirements Quality

Created: 2026-02-25
Feature: 001-user-auth (extended MVP: auth, roles, ideas, evaluations)
Purpose: Validate that written requirements in spec.md and plan.md are complete, clear, consistent, and testable for the full MVP scope.

## Requirement Completeness

- [ ] CHK001 Are role requirements (submitter vs evaluator/admin) explicitly specified for all relevant actions (auth, idea submission, evaluation) and linked to concrete stories or FR IDs? [Completeness, Gap]
- [ ] CHK002 Are requirements documented for idea submission (title, description, category) including which fields are mandatory/optional and their constraints? [Completeness, Spec §User Scenarios]
- [ ] CHK003 Are requirements specified for single file attachment per idea, including allowed file types, maximum size, and storage location strategy? [Completeness, Gap]
- [ ] CHK004 Are requirements documented for listing ideas (filters, sorting, pagination, visibility rules by role)? [Completeness, Gap]
- [ ] CHK005 Are requirements defined for viewing a single idea including attachments and evaluations and what metadata must be shown? [Completeness, Gap]
- [ ] CHK006 Are evaluation workflow requirements fully specified (who can evaluate, which statuses exist, required fields like comments, and how status transitions work)? [Completeness, Spec §Requirements, Plan §PHASE E]
- [ ] CHK007 Are non-functional requirements (performance, security, logging, rate limiting) extended beyond auth endpoints to also cover ideas and evaluations APIs? [Completeness, Gap]

## Requirement Clarity

- [ ] CHK008 Are role names (e.g., SUBMITTER, EVALUATOR, ADMIN) clearly defined with unambiguous descriptions of their permissions and limitations? [Clarity, Plan §PHASE D]
- [ ] CHK009 Is the term "single attachment per idea" clarified in requirements (e.g., overwrite vs reject additional uploads, how replacement works)? [Clarity, Gap]
- [ ] CHK010 Are status labels (SUBMITTED, UNDER_REVIEW, ACCEPTED, REJECTED) defined in terms of when they apply and what they mean for user-visible behavior? [Clarity, Plan §PHASE D]
- [ ] CHK011 Are error conditions for idea and evaluation APIs (e.g., unauthorized, forbidden, not found, validation errors) described with specific status codes and error payload shapes, similar to auth APIs? [Clarity, Spec §API Specification, Gap]
- [ ] CHK012 Are any qualitative terms such as "simple evaluation workflow" or "basic idea submission" replaced or complemented with concrete, testable descriptions? [Clarity, Gap]

## Requirement Consistency

- [ ] CHK013 Are role-based access rules for ideas and evaluations consistent between spec.md, plan.md, and tasks.md (e.g., submitter vs evaluator capabilities)? [Consistency, Spec §Requirements, Plan §PHASE E]
- [ ] CHK014 Do data model definitions in plan.md (User, Idea, Attachment, Evaluation, Role, IdeaStatus) align with entities and expectations described in spec.md (fields, relations, enums)? [Consistency, Plan §PHASE D, Spec §Key Entities]
- [ ] CHK015 Are HTTP status codes and error structures for idea/evaluation endpoints consistent with those defined for auth endpoints in spec.md? [Consistency, Spec §API Specification]
- [ ] CHK016 Are TDD/test requirements in spec.md (e.g., coverage, contract tests) applied consistently to new idea and evaluation flows in plan.md and tasks.md? [Consistency, Spec §Tests to Generate, Plan §PHASE F]

## Acceptance Criteria Quality & Measurability

- [ ] CHK017 Do idea submission and evaluation flows have explicit acceptance scenarios similar in structure to the auth user stories (Given/When/Then), rather than only high-level descriptions? [Acceptance Criteria, Spec §User Scenarios, Gap]
- [ ] CHK018 Are success criteria (SC-style metrics) extended to cover idea submission, listing, and evaluation performance and correctness (e.g., status code coverage, latency bounds)? [Measurability, Gap]
- [ ] CHK019 Can role restrictions and status transitions be objectively verified from the written requirements (e.g., state diagrams, tables, or explicit rules)? [Measurability, Plan §PHASE D, PHASE E]
- [ ] CHK020 Are there explicit requirements describing how to verify that secrets and sensitive fields never appear in responses/logs for idea and evaluation entities (e.g., internal reviewer notes, raw file paths)? [Acceptance Criteria, Spec §Success Criteria, Gap]

## Scenario Coverage

- [ ] CHK021 Are primary flows documented for: register/login/logout, idea submission, idea listing, idea detail view, and evaluation decision with comments? [Coverage, Spec §User Scenarios, Plan §PHASE E]
- [ ] CHK022 Are alternate flows documented, such as submitter editing or resubmitting an idea and evaluator re-evaluating or updating a decision (if in scope)? [Coverage, Gap]
- [ ] CHK023 Are exception flows specified for unauthorized/forbidden access to idea/evaluation routes based on missing or incorrect role? [Coverage, Spec §Requirements, Gap]
- [ ] CHK024 Are flows defined for how ideas appear (or not) to different roles (e.g., submitter sees only their own ideas vs evaluator sees all)? [Coverage, Gap]

## Edge Case Coverage

- [ ] CHK025 Are requirements defined for concurrent idea submissions or updates (e.g., two evaluators deciding at the same time, conflict resolution)? [Edge Case, Gap]
- [ ] CHK026 Are zero-state scenarios for lists specified (no ideas, no evaluations yet) including what the UI and API should return? [Edge Case, Gap]
- [ ] CHK027 Are requirements documented for invalid or malicious attachments (wrong file type, oversize, scanning failures) and the resulting behavior? [Edge Case, Gap]
- [ ] CHK028 Are retry/timeout behaviors for file storage or external dependencies (if any) described for attachment handling? [Edge Case, Gap]

## Non-Functional Requirements

- [ ] CHK029 Are performance targets (latency, throughput) defined for idea and evaluation endpoints, not just auth, and are they realistically testable in CI or staging? [Non-Functional, Gap]
- [ ] CHK030 Are security requirements (auth, authorization, rate limiting, input validation) explicitly extended to all new endpoints (`/api/ideas`, `/api/evaluations/...`) in the spec/plan? [Security, Spec §Requirements, Plan §PHASE E]
- [ ] CHK031 Are minimal accessibility requirements documented for the new UI pages (idea submission form, listings, detail, evaluation UI)—e.g., labels, keyboard navigation, focus states? [Non-Functional, Gap]
- [ ] CHK032 Are logging and observability requirements for ideas and evaluations (e.g., events, audit trails of decisions) documented similarly to auth events? [Non-Functional, Spec §Requirements, Plan §PHASE J, Gap]

## Dependencies & Assumptions

- [ ] CHK033 Are dependencies on file storage (local disk vs S3 or similar) explicitly documented, including any environment-specific configuration and fallback for local dev? [Dependency, Plan §Research & Open Questions]
- [ ] CHK034 Are assumptions about user identity (e.g., email uniqueness, one account per person) and their impact on idea ownership clearly stated? [Assumption, Spec §Key Entities]
- [ ] CHK035 Are dependencies between auth feature and ideas/evaluation features captured (e.g., ideas require authenticated users, evaluations require evaluator role provisioning)? [Dependency, Plan §Summary]

## Ambiguities & Conflicts

- [ ] CHK036 Are there any ambiguous terms ("simple", "basic", "minimal") in the constitution-level description of the MVP that should be refined into concrete requirements? [Ambiguity, Gap]
- [ ] CHK037 Are there conflicting statements about scope (e.g., auth-only vs full portal MVP) between spec.md, plan.md, tasks.md, and the InnovatePortal constitution summary, and are they resolved? [Conflict, Spec §Summary, Plan §Summary]
- [ ] CHK038 Is there a clear ID or tagging scheme for requirements and acceptance criteria so that tasks and tests can trace back to specific FR/SC items including new idea/evaluation requirements? [Traceability, Spec §Requirements, Gap]
- [ ] CHK039 Are rollback and migration requirements for new DB models (Idea, Attachment, Evaluation, Role, IdeaStatus) documented so that schema changes can be safely deployed and, if necessary, rolled back? [Dependency, Plan §PHASE D, PHASE I]
- [ ] CHK040 Are open questions around rate-limiting, lockout, and attachment storage clearly marked and tracked so they cannot be forgotten before release? [Ambiguity, Plan §Research & Open Questions]
