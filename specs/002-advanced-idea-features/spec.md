# Feature Specification: Advanced Idea Workflow Phases 2–7

**Feature Branch**: `002-advanced-idea-features`  
**Created**: 2026-02-26  
**Status**: Draft  
**Input**: User description: "Phase 2–7 enhancements from project guide: Smart Submission Forms (dynamic fields), Multi-Media Support (multiple file types), Draft Management (save drafts), Multi-Stage Review (configurable stages), Blind Review (anonymous evaluation), Scoring System (1–5 ratings)."

This feature builds on the Phase 1 InnovatEPAM Portal MVP (auth, basic idea submission, single attachment, simple evaluation) and introduces advanced submission and review capabilities corresponding to Phases 2–7 of the project guide.

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Smart Submission & Drafts (Priority: P1)

As an idea submitter, I want a smart submission form that adapts to my idea type and lets me save drafts so that I can gradually refine complex ideas without losing work.

**Why this priority**: Dynamic fields and drafts directly improve idea quality and reduce friction for submitters; they are the foundation for the remaining advanced features.

**Independent Test**: A submitter can start a new idea, see fields change based on selected category/type, save the idea as a draft, close the browser, and later resume and submit it as a full idea without data loss.

**Acceptance Scenarios**:

1. **Given** a logged-in submitter on the "New Idea" page, **When** they select a category that requires extra details (e.g., "Process Improvement" vs. "New Product"), **Then** the form displays additional context-specific fields (e.g., current process owner, expected cost savings) without reloading the page.
2. **Given** a partially completed idea form, **When** the submitter clicks "Save draft" without filling all required submission fields, **Then** the system saves a draft version that is visible only to that submitter in a "My Drafts" list and does not appear in the main evaluation queue.
3. **Given** an existing draft, **When** the submitter opens it from "My Drafts", edits fields (including dynamic fields), and submits, **Then** the system converts the draft into a regular idea in "Submitted" status and removes it from the drafts list.
4. **Given** multiple drafts for the same user, **When** they navigate to "My Drafts", **Then** they can see each draft with last-modified timestamp and delete drafts they no longer need.

---

### User Story 2 – Multi-Media Idea Support (Priority: P2)

As an idea submitter, I want to attach multiple files of different types to my idea so that I can provide richer context (documents, images, presentations, short videos) for evaluators.

**Why this priority**: Allowing multiple file types improves the quality and clarity of submissions and supports more realistic enterprise use cases.

**Independent Test**: A submitter can create or open an idea, upload several allowed file types up to defined size limits, see them listed on the idea detail view, and evaluators can open/download each file.

**Acceptance Scenarios**:

1. **Given** a logged-in submitter editing or creating an idea, **When** they attach several allowed file types (e.g., PDF, PPTX, PNG, MP4) within size limits, **Then** the system accepts each file, associates it with the idea, and shows a list of attachments with type-appropriate labels (e.g., filename and file type).
2. **Given** an attempted upload with a disallowed type or exceeding size limits, **When** the user selects the file and clicks upload, **Then** the system rejects the file with a clear error message and does not create a partial attachment record.
3. **Given** an idea that already has attachments, **When** the submitter revisits the idea, **Then** they can see the existing attachments and (subject to rules) remove or replace specific attachments without affecting other files.
4. **Given** an evaluator reviewing an idea, **When** they open the idea details, **Then** they can see the list of attachments and open/download each file in a way that is consistent with company security policies.

---

### User Story 3 – Multi-Stage & Blind Review (Priority: P2)

As an evaluator or admin, I want ideas to flow through multiple configurable review stages, optionally with anonymized submitter identity, so that evaluations are fair, structured, and aligned with our governance process.

**Why this priority**: Multi-stage review ensures that ideas are screened, shortlisted, and finally approved in a repeatable way; blind review reduces bias in early stages.

**Independent Test**: For a configured multi-stage workflow, evaluators can advance ideas through stages, see which stage each idea is in, and—when blind review is enabled—evaluate ideas without seeing submitter identity until a reveal point.

**Acceptance Scenarios**:

1. **Given** a configured workflow with at least two stages (e.g., "Initial Screening" → "Committee Review" → "Final Decision"), **When** an evaluator completes a review at stage 1 with a decision that warrants progression, **Then** the idea advances to the next stage and appears in the next-stage queue for authorized reviewers.
2. **Given** an idea at any intermediate stage, **When** an evaluator records a decision that ends the idea (e.g., "Rejected" or "Withdrawn"), **Then** the idea leaves all active queues and its final status is clearly visible across the system.
3. **Given** blind review enabled for early stages, **When** an evaluator at a blind stage opens an idea, **Then** they cannot see submitter identity or any fields flagged as identifying, while downstream non-blind stages can see this information after configured reveal.
4. **Given** multiple evaluators assigned to the same stage, **When** each provides a review, **Then** the system records each review separately and shows stage completion only when the stage exit rule is met (e.g., minimum number of reviews or consensus threshold).

---

### User Story 4 – Scoring System (1–5 Ratings) (Priority: P3)

As an evaluator, I want to score ideas on a simple 1–5 scale (optionally across multiple criteria) so that we can prioritize ideas using a clear, comparable score.

**Why this priority**: A simple scoring model helps rank ideas and supports reporting; it builds on multi-stage review but can be deployed incrementally.

**Independent Test**: Evaluators can assign scores to ideas, the system computes an overall score per idea according to the configured model, and lists can be sorted/filtered by score.

**Acceptance Scenarios**:

1. **Given** an evaluator viewing an idea at a review stage that requires scoring, **When** they provide a 1–5 rating (and optional comments), **Then** the system stores the score along with the evaluator identity, stage, and timestamp.
2. **Given** multiple scores for the same idea and stage, **When** the system displays the idea in a list or detail view, **Then** it shows the aggregated score as the arithmetic mean (average) of all evaluator scores for that idea at the relevant stage, rounded to one decimal place for display.
3. **Given** a list of ideas in a review queue, **When** the evaluator sorts by score, **Then** the list is ordered deterministically using the aggregated score (and a documented tie-breaker such as submission date).
4. **Given** a completed review, **When** stakeholders view an idea’s history, **Then** they can see the audit trail of scores and comments per stage without exposing which evaluator scored which idea in blind stages (until reveal).

### Edge Cases

- A submitter has multiple drafts for the same high-level idea: how to prevent confusion or accidental duplicate submissions while still allowing flexible experimentation.
- Maximum number and total size of attachments per idea, and behavior when these limits are reached (e.g., clear error vs. silent failure).
- Concurrent edits: what happens if a submitter edits a draft on two devices at the same time or edits a submitted idea while a review is in progress.
- Multi-stage conflicts: two evaluators attempt to move the same idea to different next stages at nearly the same time; system should have a deterministic outcome (e.g., optimistic locking with a clear error for the "losing" update).
- Blind-review leakage: ensure that notifications, exports, and logs do not accidentally include identifying information for ideas in blind stages.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-201**: The system MUST support dynamic idea submission forms in which visible fields can change based on idea category/type and/or other answers, while preserving the same underlying idea record.
- **FR-202**: The system MUST allow a logged-in submitter to save an in-progress idea as a draft at any time without satisfying all required submission fields, and drafts MUST be visible only to their owner until submitted or deleted.
- **FR-203**: The system MUST allow a submitter to resume, edit, and submit a draft, converting it into a normal idea in the existing idea lifecycle (starting in the initial submitted status).
- **FR-204**: The system MUST provide a "My Drafts" view where submitters can see, open, and delete their own drafts, ordered by last updated time.

- **FR-205**: The system MUST allow each idea to have multiple attachments associated with it, each with at least: filename, media type, size, and URL or storage reference.
- **FR-206**: The system MUST enforce a configurable whitelist of allowed file types and a configurable maximum size per file and per idea; disallowed or oversized uploads MUST be rejected with clear error messages and without persisting partial attachments.
- **FR-207**: The system MUST allow submitters (while they own the idea and before it reaches a final status) to remove or replace individual attachments, subject to business rules, without affecting other attachments.

- **FR-208**: The system MUST support a configurable multi-stage review workflow for ideas, where each stage has a name, description, allowed transitions, and assignment rules (who can act in that stage), and this workflow configuration applies globally to all ideas in this phase (no per-portfolio or per-track variations in the initial implementation).
- **FR-209**: The system MUST allow evaluators at a given stage to record a decision (e.g., "advance", "hold", "reject") and optional comments, and MUST apply the configured transition to move the idea to the next stage or final status.
- **FR-210**: The system MUST support enabling blind review for specific stages such that submitter identity and any configured identifying fields are hidden from evaluators at those stages, while remaining available in later non-blind stages.
- **FR-211**: The system MUST record all stage changes, including who performed them (where not blind), timestamps, and any comments, so that a complete review history can be inspected later by authorized users.

- **FR-212**: The system MUST allow evaluators to assign a numeric score in the range 1–5 to an idea at applicable stages, optionally broken down by multiple criteria (e.g., impact, effort, strategic fit) while still computing a single overall score.
- **FR-213**: The system MUST compute and store an aggregated overall score per idea as the arithmetic mean (average) of all applicable evaluator scores for that idea, storing the value with at least two decimal places of precision while displaying it rounded to one decimal place, and using documented tie-breakers (such as earlier submission date) when ordering ideas with the same displayed score.
- **FR-215**: The system MUST support a configurable decision threshold on the aggregated overall score for at least the final review stage such that, by default, ideas whose aggregated score is greater than or equal to the configured threshold result in a final decision of "Accepted" and ideas below the threshold result in "Rejected", while still allowing authorized evaluators/admins to override the default outcome with a justification.
- **FR-214**: The system MUST allow users with appropriate permissions to sort and filter idea lists by overall score and review stage, and to use score as an input in downstream reporting or exports.

### Key Entities *(include if feature involves data)*

- **Draft**: Represents an in-progress idea that is not yet visible to evaluators. Key attributes: `id`, `ownerUserId`, `title`, `description`, `category`, `dynamicFieldValues` (structured), `createdAt`, `updatedAt`, `linkedIdeaId?` (after submission), `status` (e.g., `DRAFT`, `SUBMITTED_FROM_DRAFT`).
- **Attachment (extended)**: Existing attachment concept extended for multiple files and richer media types. Key attributes: `id`, `ideaId`, `filename`, `mediaType`, `sizeBytes`, `storageRefOrUrl`, `createdAt`, `createdByUserId`.
- **ReviewStage**: Represents a configured stage in the multi-stage workflow. Key attributes: `id`, `name`, `description`, `orderIndex`, `isBlind`, `assignmentRule` (e.g., role or group), `exitRule` (e.g., minimum reviews, consensus).
- **StageReview**: Represents a single evaluator’s review at a particular stage. Key attributes: `id`, `ideaId`, `stageId`, `evaluatorUserId`, `decision`, `comments`, `scoreOverall`, `scoreBreakdown` (if used), `createdAt`.
- **ScoreSummary**: Logical view/entity that aggregates scores per idea (and optionally per stage). Key attributes: `ideaId`, `overallScore`, `scoreDetails`, `lastUpdatedAt`.

## Constitution Check (mandatory)

- **Spec-Driven & Test-First**: This feature will follow spec-driven and TDD practices. For each user story, we will first create or extend tests:
  - Unit tests for dynamic form configuration resolution, draft lifecycle transitions, stage and score aggregation rules.
  - Integration tests for draft save/resume/submit, multi-attachment upload and validation, multi-stage transitions, blind review behavior, and scoring flows.
  - Contract/E2E tests for key user journeys (submit idea with attachments and drafts; evaluator processes multi-stage review; scoring and ranking flow).
- **Testing Principles**: Tests will be deterministic, isolated, and derived directly from the acceptance scenarios above. Blind review tests must ensure no identifying fields appear in responses for blind stages.
- **CI Gates**: This feature will not introduce new CI types but will extend existing gates:
  - All new tests must run in CI (unit, integration, contract/E2E where applicable) and must keep overall coverage within agreed thresholds.
  - Any new configuration for stages, drafts, or scoring must include validation tests to prevent invalid configs from reaching production.
- **Security & Privacy**: Blind review and attachment handling must respect existing security principles: no secrets or PII in logs, controlled access to attachments, and strict separation between blind and non-blind views.
- **Deviations**: Any temporary simplifications (e.g., limiting the number of stages or scoring criteria in the first iteration) must be documented in the implementation plan with a follow-up task to generalize later.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-201**: At least 80% of submitters in testing can successfully save a draft, leave the application, and later resume and submit the same draft without losing any entered data.
- **SC-202**: In integration tests, 95% of valid multi-file uploads (across all allowed types) complete successfully within an acceptable time window for the test environment, and 100% of disallowed/oversized files are rejected with clear validation messages.
- **SC-203**: For a configured multi-stage workflow, 100% of ideas in test scenarios follow only allowed stage transitions, and the system prevents conflicting concurrent transitions with a clear error.
- **SC-204**: In blind-review test scenarios, 0% of responses or UI views for blind stages expose submitter identity or other configured identifying fields to evaluators before the reveal point.
- **SC-205**: In scoring tests, ideas with higher aggregated scores are consistently ranked above lower-scoring ideas when sorted by score, with deterministic handling of ties as documented in the aggregation rules.
- **SC-206**: All new endpoints or UI flows introduced for drafts, multi-stage review, and scoring achieve test coverage consistent with project standards (e.g., ≥80% lines, ≥70% branches for the new code paths), as measured in CI.

