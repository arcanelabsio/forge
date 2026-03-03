# Plan 07-01: Default Interactive Installer - SUMMARY

**Phase:** 07-installer-simplification-and-github-discussions-ingest
**Plan:** 01
**Status:** Complete

## Overview
Reworked Forge from a multi-command CLI into an install-first entrypoint. The published package now exposes the `forge` executable while keeping the npm package name `forge-ai-assist`, and default execution immediately routes into assistant selection and installation.

## Key Changes
- **package.json**: Renamed the published binary from `forge-ai-assist` to `forge` and updated the smoke script to use the install-first flow.
- **src/program.ts**: Removed the legacy `bootstrap`, `analyze`, `plan`, and install alias command registry. Added a single default action with `--assistants` and `--yes` internal flags plus an interactive assistant picker.
- **src/commands/install-assistants.ts**: Refactored installation output around selected assistant IDs instead of always installing the full registry.
- **src/services/assistants/install.ts**: Added targeted assistant installation support while preserving the existing full-install path.
- **tests/smoke/cli.test.ts**: Replaced the old bootstrap/analyze/plan smoke coverage with install-first CLI tests for interactive selection, non-interactive flags, help output, and package metadata.

## Verification Results
- [x] `npm run build`
- [x] `npm test`
- [x] `node dist/cli.js --help` shows `forge` as an install-first CLI with no legacy subcommands.
- [x] Default execution installs selected assistant runtimes through the interactive picker.

## Conclusion
Wave 1 is complete. Forge now behaves like a single-entry interactive installer and preserves a small non-interactive flag surface for tests and automation.
