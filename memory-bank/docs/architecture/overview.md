# Architecture Overview

InnovatePortal is a full-stack web application built with Next.js (App Router) on the frontend and a small Node/TypeScript API backend. The system is designed for clear separation of concerns, secure session management (short-lived JWT access tokens + opaque server-side refresh tokens), and scalable file uploads using S3-compatible object storage.

## Layers
- Frontend: React (Next.js App Router) — server components where appropriate, client components for interactive forms and uploads.
- Backend: API route handlers (Next.js API routes or a lightweight API server) implementing auth, idea CRUD, uploads, and admin endpoints.
- Database: PostgreSQL using Prisma ORM for schema, migrations and queries.
- Storage: S3-compatible object storage for attachments (presigned URL upload flow).
- Observability: structured logging and metrics exported to the platform monitoring stack.

## High-level Flow

User (browser) ↔ Frontend (Next.js) ↔ Backend API ↔ Database (Postgres)
                                 ↘↗
                                 Object Storage (S3)

1. User interacts with UI (submit idea, upload files, evaluate).
2. Frontend calls backend APIs for data and to obtain signed upload URLs.
3. Backend persists domain objects in Postgres and issues short-lived access tokens and opaque refresh tokens (cookie).
4. Client uploads attachments directly to object storage using presigned URLs; backend stores metadata and links attachments to idea records.

## Key Design Points
- Security: rotate-on-use refresh tokens stored server-side; HttpOnly, Secure cookies for refresh tokens; CSRF mitigations for cookie-based flows.
- Scalability: heavy file uploads bypass API server (direct to S3) to reduce load; horizontal scaling of API workers behind a load balancer.
- Observability: emit auth events (login, refresh, replay-detection) and upload metrics for monitoring and alerting.

## Diagram (text)

- User -> Browser UI
- Browser UI -> API (Auth / Ideas / Uploads)
- API -> Postgres (Prisma)
- API -> S3 (pre-signed URL issuance)

For a visual diagram, see `innovate-portal/docs/architecture/diagram.svg` (add if needed).
# Architecture Overview

Purpose: High-level overview of InnovatePortal architecture, key components and where to find detailed ADRs and design docs.

Key components:
- Frontend + API: Next.js (App Router)
- Auth: JWT access tokens + rotate-on-use refresh cookies (server-side revocation)
- Database: PostgreSQL via Prisma
- Storage: S3-compatible object storage for attachments

See also: `innovate-portal/specs/adr/001-tech-stack.md`, `innovate-portal/docs/ARCHITECTURE.md`.
