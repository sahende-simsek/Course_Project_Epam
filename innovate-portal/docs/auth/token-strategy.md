# Token Strategy

Decision: Use short-lived JWT access tokens plus server-stored opaque refresh tokens with rotate-on-use semantics.

Cookie: `refresh` HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age equal to refresh TTL.

Rotation: Each refresh rotates the DB record and issues a new tokenId cookie. On replay detection, revoke all tokens for the user and force logout.
