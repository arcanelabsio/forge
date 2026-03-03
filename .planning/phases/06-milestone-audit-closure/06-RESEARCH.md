# Phase 6: Milestone Audit Closure - Research

**Researched:** 2026-03-02
**Domain:** Software quality assurance, traceability, requirement verification, npm packaging
**Confidence:** HIGH

## Summary

This phase focuses on closing the traceability gap identified in the v1.0 Milestone Audit. The primary objective is to produce definitive verification evidence for the foundational requirements originally associated with Phase 1 (Bootstrap CLI) but deferred for formal audit closure. Research confirms that the technical implementation of these requirements (CLI invocation, repository guards, sidecar lifecycle) exists in the codebase and is supported by existing smoke tests, but lacks the formal documentation required by the project's audit protocol.

The core of this phase will be the creation of a `01-VERIFICATION.md` artifact that maps existing tests and code behaviors to requirements `INVK-01`, `INVK-04`, `SIDE-01`, `SIDE-02`, `SIDE-03`, `SIDE-04`, and `DELV-01`. Additionally, this phase will establish the final Milestone Audit report as a "Pass" by reconciling these findings.

**Primary recommendation:** Use the existing `tests/smoke/cli.test.ts` as the primary source of truth for automated verification, supplemented by a focused "Delivery Verification" plan for npm packaging.

## User Constraints

No `CONTEXT.md` was found for Phase 6.

### Locked Decisions
- Phase must address requirements: `INVK-01`, `INVK-04`, `SIDE-01`, `SIDE-02`, `SIDE-03`, `SIDE-04`, `DELV-01`.
- Goal: Produce `VERIFICATION.md` for Phase 1 and the final milestone audit closure.

### Claude's Discretion
- Format and structure of the verification artifacts.
- Methods for demonstrating requirement satisfaction where automated tests are insufficient (e.g., `DELV-01`).

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INVK-01 | User can run Forge through `npx forge-ai-assist@latest` | `package.json` defines `bin` entry. Research confirms `npx` behavior. |
| INVK-04 | Forge exits with a clear message outside a Git repo | `GitService.assertInRepo` throws `RepositoryRequiredError`, caught in `cli.ts`. |
| SIDE-01 | Single Forge-owned directory (`.forge`) | `SIDECAR_DIR_NAME` in `config/sidecar.ts` is fixed. |
| SIDE-02 | No modification of user source files | Code audit of `services/` shows only `.forge` writes. |
| SIDE-03 | Rerun idempotency without corruption | `metadata.ts` uses atomic temp-file + rename writes. |
| SIDE-04 | Metadata records enough history | `SidecarMetadataSchema` includes bootstrap, analysis, and planning history. |
| DELV-01 | Ships as npm package with CLI | `package.json` structure and `dist/` inclusion confirmed. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vitest | ^4.0.18 | Test runner | Already established in project for smoke/unit tests. |
| Execa | ^9.6.1 | CLI execution | Used for smoke testing the compiled binary. |

## Architecture Patterns

### Verification Artifact Pattern
Follow the standard project pattern for `VERIFICATION.md`:
- **Summary:** High-level status.
- **Requirement Map:** Table linking ID to Evidence (Test Case or Code Path).
- **Manual Verification steps:** For requirements like `DELV-01`.
- **Evidence Logs:** Sample outputs from successful test runs.

### Anti-Patterns to Avoid
- **Verification by assumption:** Claiming a requirement is met because "it's simple" without citing a test or code block.
- **Stale Evidence:** Using evidence from previous phases without re-running against the current `main` branch.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Verification Tracking | Custom spreadsheet | `VERIFICATION.md` in phase dir | Keeps evidence close to code and follows project convention. |
| Package Validation | Custom script | `npm pack --dry-run` | Standard tool for inspecting what will be published. |

## Common Pitfalls

### Pitfall 1: Ghost Requirements
**What goes wrong:** Requirements marked as "Complete" in `REQUIREMENTS.md` but "Orphaned" in Audit.
**Why it happens:** Missing `requirements-completed` frontmatter in implementation summaries.
**How to avoid:** Ensure the Phase 6 closure tasks include updating Phase 1 summary files or providing a consolidated verification report that the Auditor can parse.

### Pitfall 2: Local-Only Success
**What goes wrong:** `npx` works locally but fails after real publication.
**Why it happens:** Missing files in `package.json#files` or incorrect `bin` path.
**How to avoid:** Use `npm pack` to generate a tarball and test `npx` against the tarball path.

## Code Examples

### Requirement Mapping Example
```markdown
### INVK-04: Git Repository Guard
- **Status:** PASS
- **Evidence:** `tests/smoke/cli.test.ts` line 52 ("exits with error outside a git repo")
- **Mechanism:** `GitService.assertInRepo()` throws `RepositoryRequiredError` which maps to exit code 1 and a stderr message.
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.0.18 |
| Config file | `vitest.config.ts` |
| Quick run command | `npm run test:smoke` |
| Full suite command | `npm run test:coverage` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INVK-04 | Exit error outside repo | Smoke | `npm run test:smoke` | ✅ |
| SIDE-01 | Sidecar creation | Smoke | `npm run test:smoke` | ✅ |
| SIDE-03 | Idempotency | Smoke | `npm run test:smoke` | ✅ |
| SIDE-04 | Metadata tracking | Smoke | `npm run test:smoke` | ✅ |
| DELV-01 | Package readiness | Manual | `npm pack && npx ./package.tgz --help` | N/A (Manual) |

### Wave 0 Gaps
- None — Existing smoke tests in `tests/smoke/cli.test.ts` cover the technical aspects of the Phase 1 requirements. The primary task is documentation and formalization.

## Sources

### Primary (HIGH confidence)
- `tests/smoke/cli.test.ts`: Verified existing test coverage for bootstrap/idempotency.
- `src/services/metadata.ts`: Confirmed atomic write implementation.
- `package.json`: Confirmed `bin` and `files` configuration.
- `.planning/v1.0-v1.0-MILESTONE-AUDIT.md`: Current gap analysis.

## Metadata
**Confidence breakdown:**
- Standard stack: HIGH
- Architecture: HIGH
- Pitfalls: HIGH

**Research date:** 2026-03-02
**Valid until:** 2026-04-01
