# Plan 05-03: E2E Smoke Tests - SUMMARY

**Phase:** 05-quality-gates
**Plan:** 03
**Status:** Complete

## Overview
Implemented an end-to-end smoke testing suite using `vitest` and `execa` to validate the CLI flow in temporary Git repositories. This ensures that Sidecar behaviors, Git detection, and artifact generations function correctly across different repository states.

## Key Changes
- **package.json**: Added `test:smoke` script to run vitest on the `tests/smoke` directory.
- **tests/smoke/cli.test.ts**: Added a full suite of end-to-end tests that bootstrap an empty Git repo, run `forge bootstrap`, `forge analyze`, and `forge plan`, and check for idempotency on multiple runs.

## Verification Results
- [x] Test infrastructure successfully provisions temp directories and initializes `git`.
- [x] Smoke tests validate failure handling for missing Git repos.
- [x] E2E runs of `bootstrap`, `analyze`, and `plan` all pass.
- [x] Idempotency assertions correctly handle `metadata.json` timestamps and arrays.
- [x] `npm run test:smoke` executes successfully.

## Conclusion
Wave 3 is complete. Forge's core commands are fully validated through E2E smoke testing, fulfilling requirement `DELV-04` and successfully concluding Phase 5: Quality Gates.
