

<!--
Sync Impact Report

- Version change: 1.1.0 → 1.2.0
- Modified / Added principles:
	- `Authentication, Secrets & Credential Management` — NEW principle added to mandate secret handling and token lifecycle
	- `Spec-Driven & Test-First (NON-NEGOTIABLE)` → clarified acceptance tests and CI gate language
	- `Developer Experience & Observability` → renamed to `Developer Experience, Observability & Type Safety` and expanded type-safety requirement
	- `Governance` section → expanded amendment procedure and migration-plan requirements
- Added sections: none (content clarified and expanded in existing sections)
- Removed sections: none
- Templates requiring updates:
	- .specify/templates/spec-template.md — ⚠ pending: enforce "Constitution Check" mandatory and add tech-stack/TDD gates
	- .specify/templates/plan-template.md — ⚠ pending: require explicit migration plan, CI gates, and constitution compliance mapping
	- .specify/templates/tasks-template.md — ⚠ pending: make test tasks mandatory for TDD compliance and update sample tasks to reflect Next.js/TypeScript stack
- Deferred TODOs:
	- TODO(RATIFICATION_DATE): confirm adoption date (left as deferred because original ratification not recorded in repo)

Assumptions:
 - Ratification date is not present in repository; preserved as TODO for maintainers to fill.
-->

# InnovatePortal Constitution

## Core Principles

### Spec-Driven & Test-First (NON-NEGOTIABLE)
All work MUST originate from a written feature spec located in `/specs/<feature>/spec.md`. Test-Driven Development (TDD) is REQUIRED: write failing tests derived from the spec, implement to make them pass, then refactor. Tests MUST be deterministic, isolated, and executed in CI on every PR.

Rationale: Ensures requirements traceability, reduces regressions, and enforces design-by-contract.

How to validate: Every PR MUST include failing tests in the feature branch history and a passing test run in CI before merge.

### Clean Architecture & Layered Separation
Code MUST follow a layered clean architecture: presentation, application, domain, and infrastructure layers with explicit boundaries and dependency inversion. Domain and business rules MUST NOT import delivery or framework code.

Rationale: Keeps business logic testable and framework-agnostic for long-term maintainability.

How to validate: Code reviews MUST verify layer separation; unit tests for domain logic MUST run without framework initialization.

### Simplicity-First MVP
Prioritize the smallest implementation that delivers validated user value. Features MUST be scoped to independent MVP slices. Avoid speculative generalization (YAGNI): any complexity must be justified in the plan and accepted in review.

Rationale: Reduces time-to-feedback and lowers long-term complexity.

How to validate: Plans MUST include an explicit MVP slice and acceptance criteria; reviewers MUST reject speculative designs without justification.

### REST API Standards & Security
APIs MUST follow RESTful semantics, use correct HTTP verbs and status codes, validate inputs, and enforce authentication and authorization controls. Sensitive values (passwords, secrets, tokens) MUST never be returned in responses or logged.

Rationale: Protects user data and provides consistent interface semantics.

How to validate: Contract tests and security scans MUST be included in the PR; endpoint specs MUST list response shapes and redacted fields.

### Developer Experience, Observability & Type Safety
Developer experience (clear errors, discoverable APIs), structured logging, and observable metrics are REQUIRED. Type safety is REQUIRED: TypeScript strict mode MUST be enabled across the codebase, and all runtime inputs MUST be validated.

Rationale: Strong typing prevents class of runtime bugs and observability ensures operability in production.

How to validate: CI MUST run TypeScript strict checks, linting, and tests; PRs MUST include logging and metrics changes where applicable.

### Authentication, Secrets & Credential Management
Authentication, secrets, and credential lifecycle management are MANDATORY project concerns. Secrets (JWT secret, DB credentials, API keys) MUST be stored in a secrets manager or provided via environment variables at deploy time; secrets MUST NOT be checked into source control. JWT secrets MUST be rotated with a documented migration plan. Tokens MUST use reasonable expirations (e.g., 1h) and token rotation/revocation strategies MUST be documented for features requiring high assurance.

Rationale: Proper secret management reduces the blast radius of credential leaks and enables safe incident response.

How to validate: Any PR that adds or changes authentication, tokens, or secret handling MUST include a `Secrets & Rotation` subsection in the plan describing storage, rotation, and rollback. CI pre-merge checks SHOULD scan diffs for secrets and fail if secret patterns are detected.

## Additional Constraints

Mandatory tech stack: Next.js (App Router), TypeScript (strict), Prisma ORM, PostgreSQL, JWT for authentication, and bcrypt for password hashing. All services MUST use environment-based configuration and secret management. Security requirements include input validation, parameterized queries, salt+hash password storage, JWT expiration and rotation policies, and least-privilege database roles.

Rationale: A consistent, audited stack reduces integration friction and security surface area.

How to validate: New services or modules MUST include a short tech-stack justification; CI MUST run Prisma migrations and database schema checks in integration tests where applicable.

## Development Workflow

1. Create a spec in `/specs/<feature>/spec.md` using the Spec template and include a `Constitution Check` section mapping requirements to principles.
2. Author tests per spec (unit, contract, integration) and ensure they FAIL initially (TDD).
3. Implement code to satisfy tests; run CI to verify passing and type-check success.
4. Open a PR with changelog, migration steps, testing evidence, and a migration plan for data/schema changes. Non-trivial changes MUST include a rollback plan.
5. Merge only when CI, security scans, and constitution checks pass and at least one reviewer approves; governance updates require two maintainer approvals.

## Governance

Amendment procedure:
- Propose changes via a PR that updates `.specify/memory/constitution.md` and includes:
	- Clear rationale and summary of changes.
	- A concrete migration plan for teams (code, tests, CI, and data/schema migrations if relevant).
	- Updated automated checks or tests that reflect the amendment (or a plan to add them).
- The PR MUST include a risk assessment and rollback strategy for any operational impact.
- Governance amendment approvals: at least two maintainers MUST approve for amendments; semantic/operational breaking changes require an explicit migration timeline.

Versioning policy:
- MAJOR version bump: removal or redefinition of existing principles or other backward-incompatible governance changes.
- MINOR version bump: addition of a principle or material expansion of guidance (this update).
- PATCH version bump: non-semantic clarifications, typos, or phrasing fixes.

Compliance review expectations:
- All plans and feature PRs MUST include a `Constitution Check` section demonstrating how the change meets mandatory principles and listing any deviations with justification.
- CI MUST include a constitution compliance check (lightweight script) that verifies presence of spec, tests, and TypeScript strict success before merge.
- Periodic compliance review: the maintainers SHALL schedule a governance compliance review at least quarterly; findings and required remediations MUST be recorded in the project board.

**Version**: 1.2.0 | **Ratified**: TODO(RATIFICATION_DATE): confirm original adoption date | **Last Amended**: 2026-02-24

