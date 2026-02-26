# Implementation Plan: Advanced Idea Workflow Phases 2–7

**Branch**: `002-advanced-idea-features` | **Date**: 2026-02-26 | **Spec**: `/specs/002-advanced-idea-features/spec.md`
**Input**: Feature specification from `/specs/002-advanced-idea-features/spec.md` and research in `/specs/002-advanced-idea-features/research.md`.

## Summary

This feature extends the existing InnovatePortal MVP with advanced idea submission and review capabilities:
- smart, category-driven submission forms and drafts;
- multi-file attachments with validation;
- a global multi-stage review workflow with optional blind stages; and
- a simple 1–5 scoring model with aggregated scores and configurable final decision thresholds.

Implementation will reuse the current Next.js + Prisma + PostgreSQL stack and follow the constitution’s spec-driven, test-first approach. New domain concepts (Draft, ReviewStage, StageReview, ScoreSummary) will live in the domain layer, with thin HTTP/Next.js adapters and Prisma-based infrastructure.

## Technical Context

**Language/Version**: TypeScript (strict) targeting Node.js 18+; Next.js App Router (current project version).  
**Primary Dependencies**: Next.js (App Router), React, Prisma ORM, PostgreSQL, JWT, bcrypt, Jest, Playwright, Stryker Mutator.  
**Storage**: PostgreSQL via Prisma for ideas, drafts, stages, reviews, and attachment metadata; existing attachment storage mechanism (local filesystem or pluggable provider) reused for file content.  
**Testing**: TDD-first using Jest for unit/integration tests and Playwright for E2E, with Stryker for mutation testing, aligned with the project constitution.

**Testing Requirements (MANDATORY)**

We will drive implementation from tests, in this order:
- **Unit tests (first)** – new domain services and helpers:
  - Draft lifecycle (create, update, submit) – e.g., `tests/unit/ideas.draftService.test.ts`.
  - Stage transitions and exit rules – e.g., `tests/unit/ideas.stageService.test.ts`.
  - Blind-review projections – e.g., `tests/unit/ideas.blindProjection.test.ts`.
  - Score aggregation and threshold logic – e.g., `tests/unit/ideas.scoring.test.ts`.
- **Integration tests** – HTTP/API adapters and Prisma integration:
  - Draft endpoints: save/resume/submit – under `tests/integration/ideas.drafts.test.ts`.
  - Multi-attachment upload and validation – `tests/integration/ideas.attachments.multiple.test.ts`.
  - Multi-stage transitions and conflict handling – `tests/integration/ideas.stages.test.ts`.
  - Scoring endpoints and sorting by score – `tests/integration/ideas.scoring.test.ts`.
- **Contract/E2E tests** – end-to-end user journeys:
  - Submitter: create draft → resume → submit with multiple attachments.
  - Evaluator: process ideas through multiple stages, including blind stages.
  - Scoring: evaluators score ideas, lists sorted/filtered by aggregated score.

Mapping to acceptance criteria:
- Each User Story’s acceptance scenarios (US1–US4) will have at least one integration/E2E test that mirrors the Given/When/Then flow.
- Edge cases (concurrent transitions, limits, blind leakage) will be covered by dedicated unit + integration tests.

CI expectations:
- `npm run typecheck`, `npm run lint`, and `npm test` (unit + integration) MUST pass on every PR.
- E2E tests (`npm run test:e2e`) MUST cover at least one happy-path journey per user story.
- Coverage thresholds: maintain ≥80% line and ≥75% branch coverage on new code; do not regress global thresholds.
- Mutation testing: run Stryker on the main branch (nightly or per-release) targeting new domain modules for drafts, stages, and scoring, and keep mutation score ≥75% as per constitution.

**Target Platform**: Web application running on Node.js 18+ with PostgreSQL (same as existing InnovatePortal environment).  
**Project Type**: Full-stack web application (Next.js frontend + Node/Prisma backend within the same repository).  
**Performance Goals**: Do not degrade existing idea/auth endpoints beyond current SLAs (e.g., SC-002 style 500ms targets); list and queue views with sorting/filtering by score should remain responsive for the expected dataset (hundreds to low thousands of ideas in course scope).  
**Constraints**: Respect blind-review privacy (no PII in blind-stage responses or logs), enforce attachment size/type limits via configuration, and keep workflow configuration simple (single global workflow) for this phase.  
**Scale/Scope**: Designed for a course-scale deployment (hundreds of active users, thousands of ideas) while remaining compatible with future extensions (per-portfolio workflows, more complex scoring) without major schema changes.

## Constitution Check

*Gate status: PASS (no violations expected; re-check after design/implementation details are finalized).* 

- **Spec-Driven & Test-First**: Work is anchored in `/specs/002-advanced-idea-features/spec.md` and this plan. All changes will be driven by tests derived from the user stories and FRs; no code without corresponding failing tests in the branch history.
- **Clean Architecture & Layered Separation**: New domain logic (draft lifecycle, stages, blind projections, scoring) will live in domain-layer modules (mirroring existing `src/auth/domain` patterns). Next.js route handlers and dev-server adapters will orchestrate HTTP concerns and delegate to domain services; Prisma repositories will remain in the infra layer.
- **Simplicity-First MVP**: We will implement a single global workflow configuration, a simple 1–5 scoring model, and a minimal set of stage exit rules. More advanced features (per-portfolio workflows, weighted scoring) are deferred and, if needed, will be captured as follow-up specs.
- **REST API Standards & Security**: New/extended endpoints (drafts, multi-attachments, stage reviews, scoring) will follow the existing global error contract and enforce authentication/authorization. Blind stages will be enforced at the domain boundary so that APIs cannot leak submitter identity.
- **Developer Experience, Observability & Type Safety**: All new code will use TypeScript strict mode, leverage existing logging patterns for key events (draft submitted, stage advanced, final decision made), and ensure errors are clear and actionable.
- **Authentication, Secrets & Credential Management**: The feature reuses existing auth and DB secrets; it does not introduce new secrets or token types. We will ensure that logs and responses for blind-review flows do not inadvertently include sensitive identifiers.

At this stage, no constitution principle requires an explicit exception or deviation; if implementation work uncovers a need (e.g., additional tooling), it will be documented in the Complexity Tracking section.

## Secrets & Rotation (required when auth/credentials are changed)

This feature does **not** introduce new secrets, keys, or token types. It relies on the existing:
- `DATABASE_URL` for PostgreSQL access; and
- JWT-related secrets (`JWT_SECRET` / `JWT_KEY_<kid>`) and rotation policies defined by the auth feature.

Plan impact:
- No new secret storage or rotation mechanism is required.
- We MUST ensure that no blind-review responses or logs contain secrets or additional PII beyond what is already permitted by the auth/ideas specs.
- If we later introduce stage-specific configuration flags via env vars (e.g., default score thresholds), they will follow the existing configuration pattern in `src/config/index.ts` and will not contain sensitive data.

Any future change that modifies token lifetimes, signing keys, or introduces new secrets will be handled under the auth feature’s `Secrets & Rotation` plan and referenced from here.

## Project Structure

### Documentation (this feature)

```text
specs/002-advanced-idea-features/
├── spec.md         # Feature specification (Phases 2–7)
├── plan.md         # This file (/speckit.plan output)
├── research.md     # Phase 0 research decisions
├── data-model.md   # Phase 1 data model
├── quickstart.md   # Phase 1 developer quickstart (to be generated)
├── contracts/      # Phase 1 API contracts (e.g., contracts/api.md)
└── checklists/     # Existing requirements/checklists for this feature
```

### Source Code (repository root)

```text
src/
├── auth/
│   ├── adapters/         # HTTP/API adapters for auth & ideas (dev-server, API routes)
│   ├── domain/           # Domain logic (users, ideas, evaluations, stages, scoring)
│   └── infra/            # Prisma repositories and DB plumbing
├── config/
│   └── index.ts          # Environment config and feature flags (incl. workflow/scoring config)
└── frontend/
    ├── app/              # Next.js App Router pages (submit, drafts, review queues, scoring views)
    ├── components/       # Shared React components (forms, lists, score widgets)
    ├── lib/              # Frontend utilities and API clients
    └── theme/            # Styling and design system

tests/
├── unit/                 # Unit tests for domain logic
├── integration/          # Integration tests for HTTP + DB flows (ideas, drafts, stages, scoring)
├── contract/             # Contract tests (auth/ideas APIs)
└── e2e/                  # Playwright E2E tests for end-to-end flows
```

**Structure Decision**: Reuse the existing single-repo structure with shared domain (`src/auth/domain`) and Next.js frontend (`src/frontend/app`). Advanced idea features will be implemented as additional domain modules and frontend pages/components rather than as a new service or project.

## Complexity Tracking

At this time, no additional architectural complexity beyond the existing clean-architecture setup is required. If implementation later identifies a need for new cross-cutting patterns (e.g., a workflow engine abstraction), we will document the justification and alternatives here before proceeding.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| _None_    | N/A        | N/A                                   |
