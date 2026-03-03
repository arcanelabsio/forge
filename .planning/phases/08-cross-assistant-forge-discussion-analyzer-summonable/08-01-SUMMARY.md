# Plan 08-01: Named Summonable Installation - SUMMARY

**Phase:** 08-cross-assistant-forge-discussion-analyzer-summonable
**Plan:** 01
**Status:** Complete

## Overview
Extended Forge from a single generic installed agent to a named summonable model. Forge now installs both the generic Forge asset and a distinct `forge-discussion-analyzer` summonable across selected assistant runtimes.

## Key Changes
- **src/services/assistants/summonables.ts**: Added a summonable registry containing `forge-agent` and `forge-discussion-analyzer`.
- **src/services/assistants/install.ts**: Refactored installation so a selected assistant receives all default Forge summonables instead of only one generic file.
- **src/services/assistants/copilot.ts**: Changed Copilot asset paths to be entry-specific, enabling distinct installed summonables.
- **src/commands/install-assistants.ts**: Updated install output to reflect summonable installation rather than a single entrypoint.
- **tests/smoke/cli.test.ts**: Added coverage proving that `forge-discussion-analyzer` is installed alongside the generic Forge asset across assistant runtimes.

## Verification Results
- [x] `npm run build`
- [x] `npm test -- tests/smoke/cli.test.ts`
- [x] Selected assistants receive both `forge-agent` and `forge-discussion-analyzer` assets.

## Conclusion
Wave 1 is complete. Forge now has the named summonable installation model required for `forge-discussion-analyzer`.
