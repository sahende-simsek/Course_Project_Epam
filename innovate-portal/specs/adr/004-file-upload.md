# ADR 004 — File Upload: Local vs Cloud Storage

## Status
Proposed

## Context

Ideas may include attachments. We must choose where to store uploaded files for the MVP, keeping in mind cost, simplicity, scalability, and security (signed URLs, access control). Options: local filesystem (server disk) or cloud object storage (S3-compatible).

## Decision

Use cloud object storage (S3-compatible, e.g., AWS S3 or MinIO) for attachments, with optional local fallback for very early local development. Clients upload files to signed URLs (pre-signed PUT) to avoid server bandwidth egress; the server stores metadata in `Attachment` table.

## Rationale

- Cloud object storage is scalable, durable, and offloads storage/egress concerns. It simplifies production deployments and integrates with CDN later.
- Pre-signed uploads allow direct client → storage transfer, reducing server load and cost.
- Local filesystem is simplest for tiny prototypes but complicates horizontal scaling and introduces risk of data loss if not managed.

## Implementation notes

- Development: provide a `TEST_USE_LOCAL_UPLOADS` config flag to allow local disk storage for ease of testing; use a directory under `public/uploads` and store path in DB.
- Production: use S3-compatible buckets and generate pre-signed URLs for uploads. The server will validate file metadata (mimetype, size) and persist metadata only after successful upload confirmation or using client-provided ETag checks.
- Security: restrict allowed MIME types and file size limits; generate short-lived signed URLs; restrict bucket permissions for principle of least privilege.
- Single-attachment policy: enforce by DB unique constraint on `Attachment.ideaId` (if chosen) or replace semantics implemented in a transaction.

## Alternatives Considered

- Local-only storage: simple but non-scalable and not durable across instances; acceptable for throwaway prototypes only.
- Proxy upload through server: simpler for authorization but increases server bandwidth and cost; rejected in favor of pre-signed uploads.

## Follow-ups

- Implement storage adapter abstraction so provider can be swapped (local adapter vs S3 adapter).
- Add integration tests for upload flow including signed URL generation, allowed mimetypes, size limits, and attachment metadata persistence.
