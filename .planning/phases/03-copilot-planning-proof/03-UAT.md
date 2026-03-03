# 03-UAT.md

## Overview
User Acceptance Testing for Phase 3: Copilot Planning Proof.

## Test Sessions

### Session: 2026-03-02 (Verification)
- **Tested by**: Gemini CLI
- **Status**: Passed

| ID | Description | Expected Result | Status | Notes |
|----|-------------|-----------------|--------|-------|
| T1 | Install-Copilot Help | `node dist/cli.js install-copilot --help` shows usage and options. | [x] | Passed |
| T2 | Install-Copilot Execution | `install-copilot` writes `agent.md` to the sidecar and reports success. | [x] | Passed; fixed build script to copy assets and updated adapter to use sidecar. |
| T3 | Plan Help Output | `node dist/cli.js plan --help` shows usage and options. | [x] | Passed |
| T4 | Plan Guard (No Analysis) | `plan` command fails cleanly if no repository analysis exists yet. | [x] | Passed; added `AnalysisRequiredError` for clean user-facing failure. |
| T5 | End-to-End Planning | `plan` command succeeds when repository analysis exists, creating JSON and Markdown artifacts. | [x] | Passed; grounded in analysis and correctly persisted in `.forge/planning/plans/`. |
| T6 | Plan History | Repeated `plan` runs preserve prior outputs with unique timestamp IDs. | [x] | Passed; verified multiple unique IDs in the sidecar. |
| T7 | Context Association | `plan --task "foo" --context "bar"` records the metadata in the plan artifact. | [x] | Passed; `invocation` metadata correctly populated in the JSON payload. |

## Issues Resolved
- **Asset Missing in Build**: Updated `package.json` build script to copy non-TypeScript assets to `dist/`.
- **Sidecar Violation**: Fixed `CopilotAdapter` to install the agent entrypoint into `.forge/assistants/copilot/` instead of `.github/`.
- **Messy Failure (T4)**: Implemented `AnalysisRequiredError` to avoid stack traces when analysis is missing.

## Summary
- **Total Tests**: 7
- **Passed**: 7
- **Failed**: 0
- **Remaining**: 0
