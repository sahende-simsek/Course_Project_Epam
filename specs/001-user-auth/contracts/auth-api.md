# contracts/auth-api.md

## API Contracts — Auth

All endpoints return JSON errors in the shape: `{ "error": { "code": "string", "message": "string", "fields"?: { "field": "reason" } } }`.

- POST /api/auth/register
  - Request: `{ "email": "string", "password": "string" }`
  - Success: `201` body `{ "id": "uuid", "email": "user@example.com", "createdAt": "ISO8601" }`
  - Errors: `400` validation, `409` duplicate, `500` unexpected

- POST /api/auth/login
  - Request: `{ "email": "string", "password": "string" }`
  - Success: `200` body `{ "accessToken": "jwt", "expiresIn": 3600 }`
    - Sets cookie: `Set-Cookie: refresh=<token>; HttpOnly; Secure; SameSite=Lax; Path=/; Expires=<date>`
  - Errors: `401` invalid credentials, `403` locked/disabled, `400` validation

- POST /api/auth/logout
  - Headers: `Authorization: Bearer <accessToken>` or rely on cookie
  - Success: `204` and `Set-Cookie` to clear the refresh cookie
  - Errors: `401` missing/invalid token

- POST /api/auth/refresh
  - Request: no JSON body; reads refresh cookie
  - Success: `200` body `{ "accessToken": "jwt", "expiresIn": 3600 }` and sets rotated refresh cookie
  - Errors: `401` invalid/expired token, `403` replay detected (optionally escalate)

Cookie rules (contract): server MUST set `HttpOnly` and `Secure`. `SameSite` default Lax; document deployment options.
