---

description: "Implementation tasks for Advanced Idea Workflow Phases 2–7"
---

# Tasks: Advanced Idea Workflow Phases 2–7

**Input**: Design documents from `/specs/002-advanced-idea-features/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure tooling and configuration are ready for advanced idea features.

- [x] T001 Update TypeScript and Jest configs if needed to include new domain modules in `src/auth/domain` and tests under `tests/unit` and `tests/integration`.
- [x] T002 [P] Add or confirm npm scripts for typecheck, lint, unit, integration, contract, and e2e tests in `package.json` (align with constitution testing commands).
- [ ] T003 [P] Verify Playwright E2E setup works for the existing auth/ideas flows so new journeys can be added under `tests/e2e`.
- [x] T004 [P] Ensure Stryker mutation testing configuration includes new domain files for drafts, stages, and scoring.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core schema, domain, and config needed before user stories.

- [x] T005 Apply Prisma schema changes for Draft, ReviewStage, StageReview, extended Attachment, and any ScoreSummary/links in `prisma/schema.prisma`.
- [ ] T006 Generate and run Prisma migrations for the new models using `npx prisma migrate dev`.
- [x] T007 [P] Add initial domain interfaces/services for idea drafts and stages in `src/auth/domain` (without full story-specific behavior).
- [x] T008 [P] Extend configuration in `src/config/index.ts` for attachment limits and scoring threshold (e.g., `MAX_ATTACHMENT_BYTES`, `MAX_ATTACHMENTS_PER_IDEA`, `IDEAS_FINAL_SCORE_THRESHOLD`).
- [ ] T009 Ensure dev-server and Next.js routes can load the new config and Prisma models without runtime errors.

**Checkpoint**: After T005–T009, the project compiles and runs with the new schema and base services, but no new UI or full story behavior yet.

---

## Phase 3: User Story 1 – Smart Submission & Drafts (Priority: P1) 🎯 MVP

**Goal**: Dynamic idea form with category-based fields and a draft lifecycle (save, list, resume, submit).

**Independent Test**: A submitter can create a new idea with dynamic fields, save it as a draft, see it in "My Drafts", resume it later, and submit it without data loss.

### Tests for User Story 1

- [x] T010 [P] [US1] Add unit tests for draft lifecycle (create, update, submit, ownership) in `tests/unit/ideas.draftService.test.ts`.
- [x] T011 [P] [US1] Add unit tests for dynamic form configuration resolution based on category in `tests/unit/ideas.dynamicFormConfig.test.ts`.
- [x] T012 [P] [US1] Add integration tests for draft endpoints (create, list, get, update, submit) in `tests/integration/ideas.drafts.test.ts`.
- [x] T013 [P] [US1] Add E2E test for submitter journey: new idea → save draft → My Drafts → resume → submit in `tests/e2e/frontend/ideas.drafts.flow.spec.ts`.

### Implementation for User Story 1

- [x] T014 [P] [US1] Implement `Draft` Prisma model and related enums/statuses in `prisma/schema.prisma` and regenerate client.
- [x] T015 [P] [US1] Implement draft domain service (create, list, load, update, submit) in `src/auth/domain/draftService.ts`.
- [x] T016 [US1] Implement draft HTTP endpoints in auth/ideas adapter (dev-server/Next.js routes) in `src/auth/adapters/drafts.route.ts`.
- [x] T017 [US1] Implement dynamic form configuration loader/util in `src/frontend/lib/ideaFormConfig.ts`.
- [x] T018 [US1] Implement dynamic "New Idea" form React component using configuration in `src/frontend/app/ideas/new/page.tsx`.
- [x] T019 [US1] Implement "My Drafts" page (list, open, delete) in `src/frontend/app/ideas/drafts/page.tsx`.
- [x] T020 [US1] Wire submit-from-draft flow to create an `Idea` and remove/mark draft in `src/auth/domain/draftService.ts` and corresponding adapter.
- [x] T021 [US1] Add logging/observability for key draft events (created, updated, submitted) in `src/auth/domain/draftService.ts`.

**Checkpoint**: US1 passes its unit, integration, and E2E tests and can be demoed independently.

---

## Phase 4: User Story 2 – Multi-Media Idea Support (Priority: P2)

**Goal**: Allow multiple attachments per idea with type/size validation and proper listing for submitters and evaluators.

**Independent Test**: A submitter can upload several allowed file types (within limits), see them on the idea, replace/remove individual files, and evaluators can open/download them.

### Tests for User Story 2

- [x] T022 [P] [US2] Add unit tests for multi-attachment validation (per-file and per-idea limits, MIME whitelist) in `tests/unit/ideas.attachments.rules.test.ts`.
- [x] T023 [P] [US2] Add integration tests for multi-attachment upload, rejection of disallowed/oversized files, and delete/replace behaviors in `tests/integration/ideas.attachments.multiple.test.ts`.
 

### Implementation for User Story 2

- [x] T025 [P] [US2] Extend `Attachment` Prisma model and related queries for multiple files and metadata in `prisma/schema.prisma` and regenerate client.
- [x] T026 [P] [US2] Implement attachment domain rules for limits and MIME validation in `src/auth/domain/attachmentService.ts`.
- [x] T027 [US2] Implement multi-attachment upload and delete endpoints for ideas in `src/auth/adapters/attachments.route.ts`.
- [x] T028 [US2] Update idea detail views to display attachments for submitters and evaluators in `src/frontend/app/ideas/[id]/page.tsx`.
- [x] T029 [US2] Implement frontend upload UI for multiple files with error messaging in `src/frontend/components/IdeaAttachmentsUploader.tsx`.
- [x] T030 [US2] Ensure logging for attachment upload/rejection events in `src/auth/domain/attachmentService.ts`.

**Checkpoint**: US1 and US2 both work independently; multi-file attachments are fully supported.

---

## Phase 5: User Story 3 – Multi-Stage & Blind Review (Priority: P2)

**Goal**: Global multi-stage workflow where evaluators advance ideas through stages and blind stages hide submitter identity.

**Independent Test**: Evaluators can see queues per stage, move ideas forward or finalize them, and blind stages never reveal submitter identity until configured reveal.

### Tests for User Story 3

- [ ] T031 [P] [US3] Add unit tests for stage configuration, transitions, and exit rules in `tests/unit/ideas.stageService.test.ts`.
- [ ] T032 [P] [US3] Add unit tests for blind-view projections that strip identifying fields in `tests/unit/ideas.blindProjection.test.ts`.
- [ ] T033 [P] [US3] Add integration tests for multi-stage transitions, concurrency conflicts, and correct status updates in `tests/integration/ideas.stages.test.ts`.
- [ ] T034 [P] [US3] Add E2E test for evaluator journey through multiple stages including a blind stage in `tests/e2e/frontend/ideas.stages.flow.spec.ts`.

### Implementation for User Story 3

- [x] T035 [P] [US3] Implement `ReviewStage` Prisma model and `Idea.currentStageId` linkage in `prisma/schema.prisma` and regenerate client.
- [ ] T036 [P] [US3] Implement stage domain service for loading workflow, validating transitions, and applying exit rules in `src/auth/domain/stageService.ts`.
- [ ] T037 [US3] Implement blind projection helper that returns stage-specific idea views without submitter identity for blind stages in `src/auth/domain/ideaViewProjection.ts`.
- [ ] T038 [US3] Implement stage review creation endpoint (`POST /api/ideas/:id/stage-reviews`) in `src/auth/adapters/stageReviews.route.ts`.
- [ ] T039 [US3] Implement idea advancement endpoint (`POST /api/ideas/:id/advance`) applying stage transitions and finalization rules in `src/auth/adapters/stageAdvance.route.ts`.
- [x] T040 [US3] Implement evaluator-facing queues filtered by stage and blind visibility in `src/frontend/app/welcome-admin/page.tsx` or a new `src/frontend/app/ideas/review/[stageId]/page.tsx`.
- [ ] T041 [US3] Add logging for stage changes and blind-stage access to support audit requirements in `src/auth/domain/stageService.ts`.

**Checkpoint**: US1–US3 are functional; ideas can be drafted, attached, and reviewed through multi-stage (including blind) workflow.

---

## Phase 6: User Story 4 – Scoring System (1–5 Ratings) (Priority: P3)

**Goal**: Evaluators score ideas on a 1–5 scale, see aggregated averages, sort/filter by score, and use a threshold for final decisions.

**Independent Test**: Evaluators can assign scores, see aggregated averages per idea, sort queues by score, and final decisions at the last stage follow the configured threshold (with override support).

### Tests for User Story 4

- [ ] T042 [P] [US4] Add unit tests for score aggregation (arithmetic mean, precision, rounding) and final decision threshold logic in `tests/unit/ideas.scoring.test.ts`.
- [ ] T043 [P] [US4] Add integration tests for scoring endpoints and sorted idea lists in `tests/integration/ideas.scoring.test.ts`.
- [ ] T044 [P] [US4] Add E2E test: evaluators score ideas and verify list ordering and final decision behavior in `tests/e2e/frontend/ideas.scoring.flow.spec.ts`.

### Implementation for User Story 4

- [ ] T045 [P] [US4] Implement score aggregation helpers (compute averages, rounding, tie-breakers) in `src/auth/domain/scoringService.ts`.
- [ ] T046 [P] [US4] Extend `StageReview` model and domain logic to store per-review scores in `prisma/schema.prisma` and `src/auth/domain/stageService.ts`.
- [ ] T047 [US4] Implement aggregated score read API (e.g., `GET /api/ideas/:id/score` and score fields in idea list endpoints) in `src/auth/adapters/scoring.route.ts` and existing idea list routes.
- [ ] T048 [US4] Implement score display and sorting/filtering in evaluator queues in `src/frontend/app/welcome-admin/page.tsx` or related list pages.
- [ ] T049 [US4] Implement final decision threshold check in the final-stage advancement logic (using config from `src/config/index.ts`) in `src/auth/domain/stageService.ts`.
- [ ] T050 [US4] Ensure that score and history views respect blind-review rules in `src/auth/domain/ideaViewProjection.ts` and frontend history components.

**Checkpoint**: All four user stories (US1–US4) are independently testable and usable; scoring fully integrated with multi-stage review.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Hardening, docs, and cross-story improvements.

- [ ] T051 [P] Add or update feature documentation for drafts, multi-stage review, and scoring in `innovate-portal/docs/` and/or `README.md`.
- [ ] T052 Refine UX for drafts, attachment uploads, review queues, and scoring (labels, error messages, empty states) in `src/frontend/app` and `src/frontend/components`.
- [ ] T053 [P] Add additional unit tests for edge cases (concurrency conflicts, attachment limits, blind leakage) in `tests/unit`.
- [ ] T054 [P] Add additional integration tests for error paths (409 conflicts, 413/415 responses, forbidden access) in `tests/integration`.
- [ ] T055 Run a full test suite (typecheck, lint, unit, integration, e2e) and confirm coverage/mutation thresholds are met.
- [ ] T056 Address any performance or logging issues discovered during manual testing or CI runs.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup** – No dependencies; must be completed or verified before significant feature work.
- **Phase 2: Foundational** – Depends on Setup; blocks all user stories until schema and base services are in place.
- **Phase 3: US1 (P1)** – Depends on Foundational; delivers MVP drafts and dynamic forms.
- **Phase 4: US2 (P2)** – Depends on Foundational; can proceed in parallel with US1 once schema is ready.
- **Phase 5: US3 (P2)** – Depends on Foundational; can proceed in parallel with US1/US2 but assumes basic idea flows exist.
- **Phase 6: US4 (P3)** – Depends on US3’s stage model and on foundational schema; can start once stage reviews exist.
- **Phase 7: Polish** – Depends on all targeted user stories being functionally complete.

### User Story Dependencies

- **US1 (Smart Submission & Drafts)** – Independent once schema and base services exist.
- **US2 (Multi-Media Support)** – Independent once extended Attachment model exists; integrates with ideas but does not require stages.
- **US3 (Multi-Stage & Blind Review)** – Depends on ideas and evaluators; does not require scoring.
- **US4 (Scoring System)** – Depends on StageReview data and stage workflow from US3.

### Parallel Execution Examples

- After Phase 2, teams can work in parallel on:
  - Drafts & dynamic forms (US1 tasks T010–T021).
  - Multi-attachments (US2 tasks T022–T030).
  - Multi-stage workflow (US3 tasks T031–T041).
- Scoring tasks (US4 T042–T050) can run in parallel with the later parts of US3 once StageReview storage is in place.
- Polish tasks (T051–T056) can be distributed across team members after core stories are complete.

## Implementation Strategy

- Treat **US1** as the MVP slice: complete Phases 1–3, ensure drafts and dynamic submission forms are production-ready, then demo.
- Incrementally add **US2** and **US3** to layer in richer submissions and structured multi-stage review.
- Finally, add **US4** scoring once review stages are stable, then run Phase 7 polish to harden the feature set before any final demo or release.
