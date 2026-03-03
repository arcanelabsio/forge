# Plan 08-03: Cross-Assistant Summonability Verification - SUMMARY

**Phase:** 08-cross-assistant-forge-discussion-analyzer-summonable
**Plan:** 03
**Status:** Complete

## Overview
Verified that `forge-discussion-analyzer` is installed as a distinct summonable across assistant runtimes and that Forge can route a direct summonable invocation into the discussion-analysis backend from prepared sidecar artifacts.

## Key Changes
- **tests/smoke/cli.test.ts**: Added end-to-end verification that Copilot receives a named `forge-discussion-analyzer` asset, that the installed asset content advertises the summonable explicitly, and that Forge can execute the summonable backend from prepared sidecar analysis artifacts.
- **Installed summonable shape**: Copilot now receives a distinct `forge-discussion-analyzer.agent.md`, while Claude, Codex, and Gemini receive corresponding named Markdown summonables.
- **Invocation parity evidence**: The smoke coverage now proves the select-and-ask backend route through `--run-summonable forge-discussion-analyzer --question ...`.

## Verification Results
- [x] `npm test -- tests/smoke/cli.test.ts`
- [x] `npm test`
- [x] Installed assets expose `forge-discussion-analyzer` by name across assistant runtimes.
- [x] Forge can run the summonable backend from prepared sidecar artifacts and return a discussion digest.

## Conclusion
Wave 3 is complete. `forge-discussion-analyzer` is now a real cross-assistant summonable backed by Forge runtime behavior instead of a copied legacy prompt file.
