# API Contracts – Advanced Idea Workflow Phases 2–7

This document captures the external API surface (HTTP/JSON) impacted by the advanced idea workflow feature. It focuses on new or changed endpoints relative to the MVP.

> NOTE: All endpoints MUST follow the global error contract from the auth/ideas specs (standard `error.code`, `error.message`, optional `details`), use proper HTTP verbs, and require authentication via existing JWT mechanisms.

## Draft Management

### `POST /api/drafts`
Create a new draft for the authenticated user.

- **Request (JSON)**
  - `title: string`
  - `description: string`
  - `category: string`
  - `dynamicFieldValues: object` (optional; key/value pairs for dynamic fields)
- **Responses**
  - `201 Created` – returns the created draft
    - Body:
      - `id: string`
      - `title: string`
      - `description: string`
      - `category: string`
      - `dynamicFieldValues: object`
      - `status: "DRAFT"`
      - `createdAt: string (ISO)`
      - `updatedAt: string (ISO)`
  - `400 Bad Request` – validation errors
  - `401 Unauthorized` – no/invalid token

### `GET /api/drafts`
List drafts for the authenticated user.

- **Response**
  - `200 OK`
    - Body: `Draft[]` ordered by `updatedAt desc`.

### `GET /api/drafts/:id`
Get a single draft owned by the authenticated user.

- **Responses**
  - `200 OK` – draft payload as above
  - `404 Not Found` – no such draft for this user

### `PUT /api/drafts/:id`
Update fields on an existing draft.

- **Request (JSON)**
  - Same shape as `POST /api/drafts`, all fields optional (partial update).
- **Responses**
  - `200 OK` – updated draft
  - `400 Bad Request` – validation errors
  - `403 Forbidden` – draft does not belong to user

### `POST /api/drafts/:id/submit`
Submit a draft as a full idea.

- **Responses**
  - `201 Created` – returns the created `Idea` summary and removes draft from the active list.
  - `400 Bad Request` – missing required fields for full submission.
  - `403 Forbidden` – draft does not belong to user.

## Multi-Attachment Support

> Existing attachment endpoints are extended to allow multiple files while keeping the same authentication and error contracts.

### `POST /api/ideas/:id/attachments`
Upload one or more attachments for an idea owned by the caller (before final status).

- **Request**
  - `multipart/form-data` with one or more `file` fields.
- **Responses**
  - `201 Created` – returns the updated list of attachments for the idea.
  - `400 Bad Request` – invalid idea id, missing files.
  - `403 Forbidden` – caller does not own the idea or idea is already finalized.
  - `413 Payload Too Large` – per-file or per-idea size exceeded.
  - `415 Unsupported Media Type` – file type not in allowed whitelist.

### `DELETE /api/ideas/:id/attachments/:attachmentId`
Remove a single attachment from an idea owned by the caller (before final status).

- **Responses**
  - `204 No Content` – attachment removed.
  - `403 Forbidden` – not owner or idea finalized.
  - `404 Not Found` – attachment not found on this idea.

## Multi-Stage Workflow & Blind Review

### `GET /api/review-stages`
List globally configured review stages (admin/evaluator only).

- **Responses**
  - `200 OK` – `ReviewStage[]` ordered by `orderIndex`.

### `GET /api/ideas?stage=<stageId>&sort=score|createdAt`
List ideas filtered by current stage and sorted by score or creation date.

- **Responses**
  - `200 OK` – list of idea summaries including:
    - `id`
    - `title`
    - `currentStageId`
    - `currentStageName`
    - `overallScore` (rounded to 1 decimal) when available
    - For blind stages: **no** submitter-identifying fields.

### `POST /api/ideas/:id/stage-reviews`
Record a stage review (decision, optional comment, optional score) for the authenticated evaluator at the idea’s current stage.

- **Request (JSON)**
  - `decision: "ADVANCE" | "HOLD" | "REJECT"`
  - `comments?: string`
  - `scoreOverall?: number` (1–5 when scoring enabled for this stage)
- **Responses**
  - `201 Created` – newly created `StageReview`.
  - `400 Bad Request` – invalid decision or score.
  - `403 Forbidden` – user not allowed to act at this stage.
  - `409 Conflict` – idea already finalized or concurrent conflicting update.

### `POST /api/ideas/:id/advance`
Advance an idea to the next stage or finalize it according to configured rules and final-score thresholds (FR-215).

- **Responses**
  - `200 OK` – updated idea summary including new `currentStageId` and `status`. For final stage, includes `finalDecision` and `overallScore`.
  - `400 Bad Request` – stage exit criteria not met (e.g., not enough reviews).
  - `403 Forbidden` – user not allowed to transition this idea.
  - `409 Conflict` – concurrent transition attempt detected.

## Scoring & Aggregation

### `GET /api/ideas/:id/score`
Get the aggregated score summary for an idea.

- **Responses**
  - `200 OK` – body:
    - `ideaId: string`
    - `overallScore: number` (rounded to 1 decimal for display)
    - `rawAverage: number` (optional, full precision)
    - `reviewCount: number`
  - `404 Not Found` – idea not found or no scores yet.

These contracts are intended as a guide for implementation and testing; exact shapes should be kept consistent with the existing global error contract and auth mechanisms.
