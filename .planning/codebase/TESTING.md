# Testing Strategy

## Overview

Forge uses a combination of manual verification scripts and automated smoke tests to ensure reliability. The current focus is on Git repository detection, sidecar management, and CLI correctness.

## Manual Verification

During Phase 1 (Bootstrap CLI), verification was performed using the following manual methods:

- **Build Check**: `npm run build` from the repository root to ensure TypeScript compilation.
- **Help Output Check**: `node dist/cli.js --help` to confirm command registration and CLI bootstrap.
- **Repository Guard Check**: Running `node dist/cli.js bootstrap` inside and outside of a Git repository to verify guardrail behavior and clean error reporting.
- **Sidecar Idempotency Check**: Initializing the sidecar multiple times in a temporary repository to confirm that it reuses the `.forge` directory and metadata correctly.
- **Packaging Check**: Using `npm pack` and installing the resulting tarball into a temporary directory to verify `npx` execution semantics and distribution.

## Automated Testing (Planned)

Phase 5 (Quality Gates) will introduce formal automated tests:

### Unit Tests
- **Services**: Mocking `execa` and `fs/promises` to test `GitService`, `SidecarService`, and `MetadataService` in isolation.
- **Library**: Testing `UserFacingError` and utility functions.
- **Metadata Validation**: Testing Zod schema enforcement for various metadata scenarios.

### Integration Tests
- **CLI Workflows**: Testing the `bootstrap` and future analysis commands end-to-end against temporary, real Git repositories.
- **Idempotency**: Automating the sidecar reuse tests.
- **Error Mapping**: Verifying that subprocess failures or validation errors are correctly mapped to user-friendly messages.

## Tooling (Proposed)

- **Test Runner**: Node.js native `test` runner or Vitest for its speed and developer experience.
- **Mocks/Spies**: Using the native Node.js test runner's mocking capabilities or `sinon` for subprocess and filesystem isolation.

## CI Integration

Automated tests will eventually be integrated into GitHub Actions to run on every pull request, ensuring that no regressions are introduced to the core repository guardrails or sidecar lifecycle.
