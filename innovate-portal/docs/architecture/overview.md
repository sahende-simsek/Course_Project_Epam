# Architecture Overview

Purpose: High-level overview of InnovatePortal architecture, key components and where to find detailed ADRs and design docs.

Key components:
- Frontend + API: Next.js (App Router)
- Auth: JWT access tokens + rotate-on-use refresh cookies (server-side revocation)
- Database: PostgreSQL via Prisma
- Storage: S3-compatible object storage for attachments

See also: `innovate-portal/specs/adr/001-tech-stack.md`, `innovate-portal/docs/ARCHITECTURE.md`.
