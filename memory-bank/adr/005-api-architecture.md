# ADR 005 — API Architecture: REST vs GraphQL

## Status
Proposed

## Context

The product exposes backend services for frontend UIs and potential third-party integrations. We must choose an API style that balances simplicity for quick MVP delivery, ease of testing, and the ability to evolve the API without excessive breakage.

## Decision

Adopt RESTful JSON APIs for the MVP, implemented as Next.js App Router handlers. Revisit GraphQL if the API surface grows complex and clients require flexible queries across deeply nested relations.

## Rationale

- REST is simple to implement, easy to test, and fits well with existing contract tests and CI tooling. It maps naturally to resources in the domain (`/api/auth/*`, `/api/ideas`, `/api/evaluations`).
- REST endpoints are straightforward for contract tests and browser clients; they avoid early coupling to a GraphQL schema.
- GraphQL adds power for flexible queries but increases complexity (schema design, caching, query cost controls, authorization complexity) which is undesirable during an accelerated MVP.

## Implementation Notes

- Design resource-oriented endpoints with clear status codes and consistent error shapes (use the project's global error contract).
- Use pagination and filtering for listing endpoints (`GET /api/ideas?page&limit&category`).
- For complex UI needs, consider adding specialised endpoints rather than moving to GraphQL immediately.
- If GraphQL is later adopted, provide a migration plan and consider running GraphQL alongside REST for gradual adoption.

## Consequences

- Pros: Rapid development, testability, and compatibility with existing frontend code and contract tests.
- Cons: Clients may need multiple round-trips for nested data; may add tailored endpoints to avoid chatty patterns.

## Follow-ups

- Create API contract docs for the auth and ideas endpoints and add contract tests (T027).
- Re-evaluate GraphQL if several clients request flexible querying across nested relations.
