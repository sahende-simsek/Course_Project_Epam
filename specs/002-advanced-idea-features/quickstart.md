# Quickstart – Advanced Idea Workflow Phases 2–7

This guide explains how to run, develop, and test the Advanced Idea Workflow feature (Phases 2–7) in this repository.

## 1. Prerequisites

- Node.js 18+ and npm installed.
- PostgreSQL instance available (local or container) with a database configured.
- `.env` configured with at least:
  - `DATABASE_URL` – points to the Postgres database used by Prisma.
  - Existing auth-related vars (JWT secrets, etc.) from the base project.
- Existing migrations applied for the Phase 1 MVP (users, ideas, attachments, evaluations).

## 2. Schema & Migrations

1. Extend `prisma/schema.prisma` with the new models/fields from `specs/002-advanced-idea-features/data-model.md` (Draft, ReviewStage, StageReview, ScoreSummary/linkages).
2. Run Prisma migrations locally:
   - `npx prisma migrate dev --name advanced-idea-workflow`
3. Verify that the dev server can start and basic auth/idea flows still work.

## 3. Running the Application

From the repository root:

```bash
npm install
npm run dev
```

Then open the frontend in your browser (port as configured by the dev server, typically `http://localhost:3000` or the port configured by `scripts/dev-server.js`).

Key flows to exercise manually:
- Create and manage drafts ("New Idea" → Save draft → My Drafts → Resume → Submit).
- Attach multiple files to an idea.
- Move ideas through configured review stages, including a blind stage.
- Score ideas and sort lists by score.

## 4. Running Tests

Recommended commands:

- **Unit tests** (domain logic, including drafts, stages, scoring):
  - `npm test -- --runTestsByPath tests/unit/ideas.draftService.test.ts`
  - `npm test -- --runTestsByPath tests/unit/ideas.stageService.test.ts`
  - `npm test -- --runTestsByPath tests/unit/ideas.scoring.test.ts`
- **Integration tests** (HTTP + DB):
  - `npm test -- --runTestsByPath tests/integration/ideas.drafts.test.ts`
  - `npm test -- --runTestsByPath tests/integration/ideas.attachments.multiple.test.ts`
  - `npm test -- --runTestsByPath tests/integration/ideas.stages.test.ts`
  - `npm test -- --runTestsByPath tests/integration/ideas.scoring.test.ts`
- **E2E tests** (Playwright):
  - `npm run test:e2e`

Ensure coverage thresholds remain at or above the project’s standards.

## 5. Configuration

Add or update any feature-specific configuration in `src/config/index.ts`, for example:

- Attachment limits:
  - `MAX_ATTACHMENT_BYTES`
  - `MAX_ATTACHMENTS_PER_IDEA`
- Workflow & scoring:
  - `IDEAS_WORKFLOW_STAGES` (or DB-backed configuration)
  - `IDEAS_FINAL_SCORE_THRESHOLD`

Document final names and semantics in the config file and, if needed, in the main README.

## 6. Implementation Order (Suggested)

1. **Data model and migrations** – Draft, ReviewStage, StageReview, extended Attachment, ScoreSummary/linkage.
2. **Domain services** – draft lifecycle, stage transitions, blind projections, scoring.
3. **Adapters/API** – dev-server/Next.js route handlers for drafts, attachments, stages, scoring.
4. **Frontend UX** – dynamic forms, My Drafts page, evaluator queues, scoring UI.
5. **Hardening** – edge cases (concurrency, limits, blind leakage), logging, and observability.

Use the spec, research, data-model, and contracts in this feature directory as the single source of truth while implementing.