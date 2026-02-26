# Research – Advanced Idea Workflow Phases 2–7

## R-001 – Dynamic Forms & Drafts Implementation
- **Decision**: Implement dynamic idea forms and drafts using the existing Next.js App Router frontend (`src/frontend/app`) with client-side React components that read a JSON-based form configuration. Persist drafts as a separate `Draft` model via Prisma, linked to `Idea` on submission.
- **Rationale**: Keeps form behavior in the frontend where UX belongs, keeps domain rules in the backend, and allows evolving form configs without DB changes for every field tweak. A dedicated `Draft` model avoids overloading `Idea` with draft-only semantics.
- **Alternatives considered**: (a) Encode dynamic fields entirely in the DB schema (many nullable columns) – rejected as inflexible and hard to evolve; (b) Represent drafts as `Idea` rows with a `status = DRAFT` flag – rejected to avoid polluting the main idea table with incomplete records and to keep draft clean-up simpler.

## R-002 – Multi-Attachment Storage & Limits
- **Decision**: Extend the existing `Attachment` model to support multiple files per idea, storing metadata (filename, media type, size, storage ref/URL) in PostgreSQL via Prisma and reusing the existing storage mechanism (local disk or pluggable provider). Enforce per-file and per-idea limits in the domain layer with clear validation errors.
- **Rationale**: Reusing the current storage path minimizes infra changes, while centralizing validation in the domain layer ensures consistent enforcement across UI flows and APIs.
- **Alternatives considered**: (a) Pushing all validation into the frontend – rejected because it is bypassable and duplicates rules; (b) Introducing a new attachment microservice – rejected as premature for this phase.

## R-003 – Global Multi-Stage Workflow Model
- **Decision**: Model review stages as a single **global** workflow configuration for all ideas in this phase, using a `ReviewStage` table with `orderIndex`, `isBlind`, and `exitRule` fields. Ideas track their current stage via a foreign key to `ReviewStage`.
- **Rationale**: A global workflow is simpler to reason about, fits the course project scope, and avoids the complexity of per-portfolio configurations while still enabling realistic multi-stage flows.
- **Alternatives considered**: (a) Per-portfolio or per-track workflows – rejected for this phase due to added configuration and UI complexity; (b) Hard-coding stages in code – rejected to keep stages data-driven and easier to change via migrations.

## R-004 – Blind Review Enforcement
- **Decision**: Enforce blind review by having domain/application services project a restricted idea view whenever `ReviewStage.isBlind = true`, omitting submitter identity and other identifying fields, and ensuring adapters (API/Next.js) only expose that projected view.
- **Rationale**: Keeps blind-review rules in one place (the domain boundary) and reduces the risk of accidentally leaking PII via new endpoints or UI views.
- **Alternatives considered**: (a) Relying solely on frontend logic to hide fields – rejected because APIs would still expose sensitive data; (b) Creating duplicate “anonymized” tables – rejected as overkill and harder to maintain.

## R-005 – Scoring & Final Decision Rules
- **Decision**: Use a simple 1–5 scoring scale per evaluator and stage, aggregate scores per idea as the arithmetic mean (average) of all applicable evaluator scores, store with ≥2 decimal places, display rounded to 1 decimal place, and configure a threshold for the final stage where `average >= threshold` → default **Accepted**, otherwise **Rejected**. Authorized evaluators/admins can override the default outcome with a justification.
- **Rationale**: Arithmetic mean is intuitive and easy to explain to stakeholders; a configurable threshold aligns with the course project’s “simple but realistic” goal, and override capability keeps humans in control of edge cases.
- **Alternatives considered**: (a) Median or weighted averages by role – rejected for this phase as unnecessary complexity; (b) Complex multi-criteria weighted formulas – rejected to keep the initial scoring model simple and testable.

## R-006 – Testing & CI Strategy for This Feature
- **Decision**: Follow the existing Jest/Playwright/Stryker setup, adding:
  - Unit tests under `tests/unit` for draft lifecycle, stage transitions, blind projections, and score aggregation helpers.
  - Integration tests under `tests/integration` for draft save/resume/submit, multi-attachment validation, stage advancement, and scoring endpoints.
  - E2E tests under `tests/e2e/frontend` for end-to-end flows (drafts, multi-stage review, scoring & sorting).
  - Mutation testing via the existing Stryker configuration, focusing on new domain modules for drafts, stages, and scoring.
- **Rationale**: Reuses the project’s agreed testing stack and constitution thresholds while ensuring each new behavior has unit + integration + E2E coverage.
- **Alternatives considered**: (a) Introducing a different test framework for this feature – rejected to avoid fragmentation; (b) Skipping mutation testing – rejected as it would violate the constitution’s quality gates.
