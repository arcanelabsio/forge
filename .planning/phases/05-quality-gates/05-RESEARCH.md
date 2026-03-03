# Phase 05: Quality Gates - Research

**Researched:** 2026-03-02
**Domain:** Automated Testing & Quality Assurance
**Confidence:** HIGH

## Summary
Phase 5 focuses on establishing the testing infrastructure for Forge. The primary goal is to validate the "Sidecar-First" architecture, ensuring that Git detection, artifact persistence, and idempotency are reliable across various repository states.

**Primary recommendation:** Use the built-in Node.js test runner (`node:test` and `node:assert`) to minimize external dependencies and maintain a lightweight CLI footprint, or use a standard tool like `vitest` if mocking is extensive. Let's align with modern Node practices and use `node:test` or `vitest`. The user's stack usually leans towards standard ESM typescript. Let's recommend `vitest` for its excellent ESM support and mocking.

## User Constraints
(None found in CONTEXT.md)

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vitest | ^3.0.0 | Test Runner | Best-in-class ESM mocking and DX for TS projects. |
| @vitest/coverage-v8 | ^3.0.0 | Coverage | Native V8 coverage integration. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| execa | ^9.6.1 | Subprocess | Already in project; needs mocking in tests. |

## Architecture Patterns

### Recommended Project Structure
```
tests/
├── unit/
│   ├── services/
│   │   ├── git.test.ts      # Mocks execa
│   │   ├── sidecar.test.ts  # Mocks fs
│   │   └── metadata.test.ts # Zod validation tests
│   └── analysis/
│       └── run.test.ts      # Logic verification
└── smoke/
    └── e2e.test.ts          # Real git init + forge run using temp directories
```

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DELV-02 | Auto tests for Git/Sidecar/Idempotency | Unit tests for `GitService` and `SidecarService` with mocked dependencies. |
| DELV-03 | Auto tests for Analysis/Plan generation | Unit tests for `runAnalysis` and `runPlanning` with controlled facts. |
| DELV-04 | Smoke tests against temp Git repos | Integration test suite using `execa` to run `dist/cli.js` in a fresh `git init` dir. |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.x |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm run test:coverage` |
