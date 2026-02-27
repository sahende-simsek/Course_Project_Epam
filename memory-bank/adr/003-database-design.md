# ADR 003 — Database Design: Relational (PostgreSQL) vs NoSQL and Schema Decisions

## Status
Accepted

## Context

The product requires structured data with relationships (users, ideas, attachments, evaluations), transactional guarantees for status transitions, and constraints for ownership and uniqueness. We must choose between relational and NoSQL approaches for the MVP and make initial schema decisions.

## Decision

Use PostgreSQL (relational) with Prisma ORM for the MVP. Design normalized schemas with explicit foreign keys and transactional updates for operations that require atomicity (e.g., creating an Evaluation and updating Idea.status).

## Rationale

- The domain has strongly relational data and business rules (author → idea, idea → attachments, evaluations referencing ideas and users). Relational DBs provide clear support for joins, transactions, foreign keys, and constraints.
- Transactions and constraints are critical for correctness in concurrent operations (concurrent evaluation finalisation, single-attachment enforcement). Implementing these guarantees in NoSQL would add complexity.
- Prisma offers good DX, type-safety, and migration tooling which speeds MVP development.

## Schema decisions (starting point)

- `User` table: `id (uuid)`, `email (unique)`, `passwordHash`, `role (enum)`, `status`, `createdAt`, `updatedAt`, `lastLoginAt`.
- `Idea` table: `id (uuid)`, `title`, `description`, `category`, `status (enum)`, `authorId -> User.id`, `createdAt`, `updatedAt`.
- `Attachment` table: `id (uuid)`, `ideaId -> Idea.id`, `filename`, `url`, `mimetype`, `size`, `createdAt`. If single-attachment policy enforced, add unique constraint on `ideaId`.
- `Evaluation` table: `id (uuid)`, `ideaId -> Idea.id`, `evaluatorId -> User.id`, `decision (enum)`, `comments`, `createdAt`.
- `RefreshToken` table: `id (uuid)`, `jti (string)`, `userId -> User.id`, `parentTokenId -> RefreshToken.id (nullable)`, `issuedAt`, `lastUsedAt`, `expiresAt`, `revoked (boolean)`, `metadata (json?)`.

## Transactions and concurrency

- Use DB transactions for multi-step operations: creating Evaluation + updating Idea.status atomically; attaching files with ownership checks + possible replacement logic.
- Use optimistic concurrency (version/timestamp) or DB-level unique constraints + transactions to prevent race conditions.

## When to consider NoSQL

- If the product requirements later include high-volume unstructured data (large media metadata, event streams with high write rates), decouple those concerns to a NoSQL store or object storage while keeping core relational data in PostgreSQL.

## Follow-ups

- Implement initial Prisma models and migration scaffold (T002/T004).
- Add DB-level unique constraints and indexes (email unique, `ideaId` unique if single-attachment enforced).
