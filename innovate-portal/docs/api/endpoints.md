# API Endpoints

This file lists core API endpoints for InnovatePortal. Use this as a quick reference; full contract details (request/response schemas) live next to each handler.

## Auth

### POST /api/auth/register
Creates a new user. Returns 201 with user id.

### POST /api/auth/login
Validates credentials and returns an `access_token` and sets `refresh` cookie.

### POST /api/auth/refresh
Rotates the refresh token and returns a new access token; updates `refresh` cookie.

### POST /api/auth/logout
Revokes refresh tokens for session and clears cookie.

## Ideas

### POST /api/ideas
Create an idea. Requires auth. Payload includes title, description, tags, attachmentIds.

### GET /api/ideas
List ideas with pagination and filters (tag, status, cursor/limit).

### GET /api/ideas/:id
Get idea details including attachments and evaluations (visibility enforced by status and auth).

### PUT /api/ideas/:id
Update idea (owner only). Supports adding/removing attachment references; creates version record.

### DELETE /api/ideas/:id
Soft-delete an idea (owner or admin). Admin purge endpoint available for permanent delete.

## Uploads

### POST /api/uploads/sign
Request a pre-signed URL for an attachment. Returns `uploadUrl`, `attachmentId`, `expiresAt`.

### POST /api/uploads/confirm
Client notifies server that upload completed; server validates checksum/metadata and marks attachment available.

## Admin

### GET /api/admin/ideas
List ideas for moderation (filter by status, flagged, date range).

### POST /api/admin/ideas/:id/publish
Publish idea (admin only).
