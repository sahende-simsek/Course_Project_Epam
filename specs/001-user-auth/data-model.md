## data-model.md

## Entities

- **User**
  - `id: string (uuid)` — primary key
  - `email: string` — unique, normalized to lowercase
  - `passwordHash: string` — bcrypt hash
  - `status: 'active' | 'disabled'`
  - `createdAt: DateTime`
  - `updatedAt: DateTime`
  - `lastLoginAt: DateTime?`

- **RefreshToken**
  - `id: string (uuid)` — primary key
  - `tokenId: string` — JWT jti or opaque identifier, unique
  - `userId: string` — FK to `User`
  - `parentTokenId: string?` — pointer to previous token in rotation
  - `issuedAt: DateTime`
  - `lastUsedAt: DateTime?`
  - `expiresAt: DateTime` — TTL default 7 days
  - `revoked: boolean` — indicates token invalidation
  - `ip: string?` — optional for audit
  - `userAgent: string?` — optional for audit

- **AuthEvent (AuditEvent)**
  - `id: string (uuid)`
  - `eventType: string` — register/login_success/login_failure/logout/refresh/replay_detected
  - `userId: string?`
  - `ip: string?`
  - `userAgent: string?`
  - `metadata: JSON?` — optional contextual data (e.g., tokenId)
  - `timestamp: DateTime`

## Relationships

- `User 1..* RefreshToken` (one user can have multiple refresh records over time)
- `AuthEvent` optionally references `User`.

## Validation rules

- `email` must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` and be normalized to lowercase before uniqueness check.
- `password` min length 8, max 128; additional complexity optional and configurable.

## Indexing & cleanup

- Index `RefreshToken.tokenId` (unique), `RefreshToken.userId` and `RefreshToken.expiresAt` for efficient lookup and cleanup.  
- Periodic cleanup job: remove revoked/expired tokens older than 30 days.
