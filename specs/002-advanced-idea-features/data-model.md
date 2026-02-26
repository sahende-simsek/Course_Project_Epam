# Data Model – Advanced Idea Workflow Phases 2–7

This document refines the conceptual entities from the spec into a concrete data model suitable for Prisma/PostgreSQL and the existing InnovatePortal architecture.

## Existing Entities (Context)

### Idea (existing)
- **Fields (subset / relevant to this feature)**:
  - `id: string`
  - `authorUserId: string`
  - `title: string`
  - `description: string`
  - `category: string` (used by dynamic forms)
  - `status: IdeaStatus` (e.g., `SUBMITTED`, `UNDER_REVIEW`, `ACCEPTED`, `REJECTED`)
  - `currentStageId: string | null` → FK to `ReviewStage` (added in this feature)
  - `createdAt: Date`
  - `updatedAt: Date`
- **Relationships**:
  - `Idea` has many `Attachment` records.
  - `Idea` has many `StageReview` records.
  - `Idea` may have one or more linked `Draft` records (by convention we keep at most a small number per user/idea).

## New/Extended Entities

### Draft
Represents an in-progress idea that is not yet visible to evaluators.

- **Fields**:
  - `id: string`
  - `ownerUserId: string` → FK to `User`
  - `title: string`
  - `description: string`
  - `category: string`
  - `dynamicFieldValues: Json` (structured responses for dynamic form sections)
  - `linkedIdeaId: string | null` → FK to `Idea` once submitted
  - `status: DraftStatus` (e.g., `DRAFT`, `SUBMITTED_FROM_DRAFT`)
  - `createdAt: Date`
  - `updatedAt: Date`
- **Relationships & Rules**:
  - A draft belongs to exactly one user.
  - When submitted, a draft is converted into an `Idea` and marked accordingly; we keep the draft row for audit/history or soft-delete based on requirements.

### Attachment (extended)
Extends the existing single-attachment model to support multiple files and richer media types.

- **Fields**:
  - `id: string`
  - `ideaId: string` → FK to `Idea`
  - `filename: string`
  - `mediaType: string` (MIME type)
  - `sizeBytes: number`
  - `storageRefOrUrl: string` (opaque reference for underlying storage provider)
  - `createdAt: Date`
  - `createdByUserId: string` → FK to `User`
- **Constraints & Rules**:
  - Per-file size limit and per-idea total size limit enforced by domain logic and validated before persistence.
  - MIME types restricted to a configurable whitelist.

### ReviewStage
Represents one stage in the global multi-stage workflow.

- **Fields**:
  - `id: string`
  - `name: string` (e.g., `Initial Screening`, `Committee Review`, `Final Decision`)
  - `description: string`
  - `orderIndex: number` (global ordering across all stages)
  - `isBlind: boolean` (whether submitter identity is hidden at this stage)
  - `assignmentRule: string` (encoded rule, e.g., `EVALUATOR`, `COMMITTEE`, or a group identifier)
  - `exitRule: string` (encoded, e.g., `MIN_REVIEWS:2`, `CONSENSUS:MAJORITY`)
  - `createdAt: Date`
  - `updatedAt: Date`
- **Relationships**:
  - One-to-many from `ReviewStage` to `StageReview`.
  - `Idea.currentStageId` references the current stage.

### StageReview
A single evaluator’s review at a given stage, including decision, comments, and score.

- **Fields**:
  - `id: string`
  - `ideaId: string` → FK to `Idea`
  - `stageId: string` → FK to `ReviewStage`
  - `evaluatorUserId: string` → FK to `User`
  - `decision: StageDecision` (e.g., `ADVANCE`, `HOLD`, `REJECT`)
  - `comments: string | null`
  - `scoreOverall: number | null` (1–5 where scoring is enabled for this stage)
  - `scoreBreakdown: Json | null` (optional per-criterion scores)
  - `createdAt: Date`
- **Constraints & Rules**:
  - Uniqueness constraint on `(ideaId, stageId, evaluatorUserId)` to prevent duplicate reviews by the same evaluator at the same stage.
  - Domain services enforce stage exit rules (minimum reviews, consensus) before advancing `Idea.currentStageId` or finalizing status.

### ScoreSummary (logical/derived)
Logical aggregate for scores per idea (and optionally per stage).

- **Fields**:
  - `ideaId: string` → FK to `Idea`
  - `overallScore: number` (arithmetic mean across applicable `StageReview.scoreOverall` values)
  - `scoreDetails: Json` (e.g., per-stage breakdown, counts of reviews)
  - `lastUpdatedAt: Date`
- **Implementation Options**:
  - Materialized view / dedicated table updated via domain service after each stage review.
  - Or computed on read via a query that aggregates `StageReview` rows (first iteration may favor a computed-on-read approach with indexes to keep queries fast).

## Relationships Summary

- `User` 1—N `Draft`
- `User` 1—N `StageReview`
- `Idea` 1—N `Attachment`
- `Idea` 1—N `StageReview`
- `ReviewStage` 1—N `StageReview`
- `Idea` 1—0..1 `ScoreSummary` (if materialized)

These structures are intended to map cleanly to Prisma models and keep domain logic testable and independent of Next.js while supporting the scenarios and FRs in the spec.
