<!--
Sync Impact Report

- Version change: 1.2.0 → 1.3.0
- Modified / Added principles:
	- `Testing Principles` — NEW multi-section principle added covering TDD, coverage, test organization, mocking, quality gates, and tooling tailored to the project's TypeScript/Next.js stack

- Added sections:
	- `Testing Principles` (see below)

- Removed sections: none

- Templates requiring updates (status):
	- .specify/templates/spec-template.md — ⚠ pending: add explicit "Constitution Check" test requirements and test-first guidance
	- .specify/templates/plan-template.md — ⚠ pending: ensure plan template captures required test phases and Secrets & Rotation subsection
	- .specify/templates/tasks-template.md — ⚠ pending: add mandatory test tasks scaffolding and CI test script examples for TypeScript/Jest

- Follow-up TODOs:
	- TODO(RATIFICATION_DATE): confirm original adoption date (deferred)

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

## Testing Principles

This section defines mandatory testing philosophy, organization, quality gates, tooling, and execution commands for InnovatePortal projects, customized for the repository's stack: Next.js (App Router), TypeScript (strict), Prisma, PostgreSQL, JWT, bcrypt, and npm as the package manager.

### Section 1 - Testing Philosophy
- Test-Driven Development (TDD) is REQUIRED: adopt RED → GREEN → REFACTOR and author tests before implementation.
- Tests MUST be derived from specifications and acceptance criteria (spec-driven), not from implementation details.
- Tests are a design artifact: they codify expected behavior and drive clearer, testable interfaces.

### Section 2 - Coverage Requirements
- Follow the Testing Pyramid distribution: ~70% unit, ~20% integration, ~10% E2E for feature work.
- Unit tests target services, utilities, and business logic; integration tests validate API endpoints and database interactions; E2E tests validate critical user workflows only.
- Static analysis: TypeScript in `strict` mode AND ESLint configured with the project's shared ruleset MUST run in CI.
- Coverage targets (minimum): 80% line, 75% branch, and a mutation testing score of 75% (see Section 7 for gates).

### Section 3 - Test Types & Organization
- Unit tests: `tests/unit/**/*.test.ts` (mirror `src/` structure; one test file per source file is preferred for clarity).
- Integration tests: `tests/integration/**/*.test.ts` (group by feature; focus on adapter-to-domain and DB ops).
- E2E tests: `tests/e2e/**/*.spec.ts` (group by user journey; keep small and focused on critical flows).
- Keep tests close to the code they validate in logical structure (mirror `src/`), but place integration and E2E tests under `tests/` top-level to simplify CI orchestration.

### Section 4 - Naming Conventions
- Test files: `ComponentName.test.ts` for unit/integration tests.
- E2E files: `user-journey-name.spec.ts`.
- Test suites: `describe('ComponentName', () => { ... })`.
- Test cases: `it('should do X when Y', () => { ... })`.

### Section 5 - Test Anatomy
- Follow Arrange–Act–Assert (AAA) as the primary pattern.
- Use `beforeEach` for per-test setup; avoid `beforeAll` for shared mutable setup that could introduce inter-test coupling.
- Each test MUST be independent and able to run alone.
- Avoid shared global state between tests; reset any singletons, caches, or environment changes between tests.

### Section 6 - Mocking & Test Data
- Mocks: external services (email, payment, third-party APIs) MUST be mocked (e.g., `msw` for HTTP) for unit and most integration tests.
- Stubs: time-dependent functions (`Date.now()`, timers) should be stubbed using Jest fake timers when determinism is required.
- Fakes: use an in-memory or ephemeral database (SQLite in-memory via Prisma) for unit-level DB fakes where appropriate.
- Use test fixtures for complex data setups and extract helpers such as `createTestUser()` and `setupMockAPI()`.
- DO NOT mock code that you own for the sake of convenience; prefer testing observable behavior through the public API of modules.

### Section 7 - Quality Criteria (CRITICAL)
What makes a good test:
- Tests observable behavior and avoid asserting implementation details.
- Contain meaningful assertions; avoid tautological assertions (e.g., `expect(x).toBe(x)`).
- Test a single behavior (single responsibility per test).
- Performance targets: unit tests should be fast (<1s per test file on CI), integration tests should generally complete <5s per scenario where practical.
- Tests MUST be deterministic: same result every run on CI and locally when given the same environment.

Quality gates:
- Mutation score: minimum 75% (use Stryker for JavaScript/TypeScript).
- No always-true assertions; PRs should not introduce tautological tests.
- All expected values (oracles) MUST be validated by a human reviewer when the test is first added.
- Coverage minimums: 80% line, 75% branch. CI MUST enforce these thresholds for the feature branch gate.

Anti-patterns to avoid:
- Testing private methods or internal state; prefer testing the public contract.
- Interdependent tests that rely on execution order.
- Brittle tests that fail on refactorings unrelated to behavior change.
- Flaky tests; any intermittent failures MUST be investigated and fixed before merge.
- Tests without assertions or that merely exercise code paths.
- Copy-pasted test logic; extract helpers and fixtures.

Mutation testing tool:
- For this TypeScript stack use `stryker` (Stryker Mutator) with the `@stryker-mutator/jest-runner` plugin. CI should run mutation testing periodically (e.g., nightly or on main branch) and require at least 75% mutation score on main branch merges.

### Section 8 - Tools & Frameworks
Static analysis:
- Type checker: TypeScript (`tsc --noEmit`) in `strict` mode; command: `npm run typecheck` (script maps to `tsc --noEmit`).
- Linter: ESLint with the project's shared config; command: `npm run lint` (e.g., `eslint "src/**/*.ts" "tests/**/*.ts"`).

Unit/Integration testing:
- Framework: Jest 29.x (recommended) — run with `npm test`.
- Assertion: Jest `expect`.
- Mocking: `jest` builtin mocks + `msw` for HTTP mocking.

E2E testing:
- Framework: Playwright (recommended) — `npx playwright test` or `npm run test:e2e`.
- Optional: Stagehand or other AI-assisted browser automation may be added later but is not required for initial gating.

Coverage & Quality:
- Coverage tool: Jest built-in coverage via `--coverage` or `c8`/`nyc` as configured; command: `npm run coverage`.
- Mutation testing: Stryker Mutator (`npx stryker run`).

Execution commands (recommended `package.json` scripts):
- Type check: `npm run typecheck` (maps to `tsc --noEmit`).
- Lint: `npm run lint` (maps to `eslint`).
- Run all tests: `npm test` (maps to `jest --coverage` in CI policy).
- Run unit tests: `npm run test:unit` (maps to `jest --testPathPattern=tests/unit`).
- Run integration tests: `npm run test:integration` (maps to `jest --testPathPattern=tests/integration`).
- Run E2E tests: `npm run test:e2e` (maps to `npx playwright test`).
- Generate coverage: `npm run coverage` (maps to `jest --coverage --coverageDirectory=coverage`).
- Run mutation testing: `npx stryker run`.

Pre-commit hook: run `npm run typecheck && npm run lint && npm run test:unit` (use `husky` + `lint-staged` to keep hooks fast; prefer only unit tests in pre-commit).

CI/CD pipeline: All checks (typecheck, lint), full test suite (unit, integration, contract, E2E where applicable), coverage check, and secret-scan on PRs; mutation testing scheduled on `main` branch (nightly or gated for releases).

Customization summary for this repository: Next.js + TypeScript (strict) + Prisma + PostgreSQL + Jest 29.x + Playwright + ESLint + Stryker. Package manager: `npm`. File extensions and test paths use `.ts` and the `tests/` layout described above.

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

**Version**: 1.3.0 | **Ratified**: TODO(RATIFICATION_DATE): confirm original adoption date | **Last Amended**: 2026-02-24

