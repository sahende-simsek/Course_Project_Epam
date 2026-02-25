# Auth Sequence Flows

Login:
- Client submits credentials to `/api/auth/login`
- Server validates credentials, creates a refresh token record in DB, issues access token and sets `refresh` HttpOnly cookie containing the tokenId

Refresh:
- Client POSTs to `/api/auth/refresh` with `refresh` cookie
- Server verifies tokenId, rotates the DB row (create new token, mark old as rotated), sets new cookie, and returns new access token

Logout:
- Client calls `/api/auth/logout`
- Server revokes all refresh tokens for the user and clears the `refresh` cookie
