# Tradeoffs

This short document explains obvious tradeoffs made during design decisions.

## Why JWT access tokens + server refresh tokens?
- JWT access tokens (short-lived) allow stateless verification for most API calls and simplify scaling of API workers.
- Opaque server-side refresh tokens enable rotate-on-use and server-side revocation to mitigate replay attacks.

Tradeoff: slightly more complexity at login/refresh implementation vs fully stateless JWT-only approach.

## Why PostgreSQL (Prisma)?
- Relational schema fits ideas/attachments/reviews with strong consistency and transactional guarantees.
- Prisma accelerates developer productivity with typed queries and migrations.

Tradeoff: some overhead vs NoSQL (flexibility) but better constraints and queries for relational data.

## Why direct S3 uploads (pre-signed URLs)?
- Offloads large file transfer from API servers, reduces cost and improves scalability.
- Ensures object storage handles durability and access control.

Tradeoff: requires extra flow (sign -> upload -> confirm) and additional client logic.
