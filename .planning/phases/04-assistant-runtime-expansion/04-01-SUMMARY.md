# Plan 04-01: Shared Runtime Model and Registry - SUMMARY

**Phase:** 04-assistant-runtime-expansion
**Plan:** 01
**Status:** Complete

## Overview
Defined the shared assistant runtime model and adapter registry. This established the unified foundation for multi-assistant support (Claude, GitHub Copilot, Codex, and Gemini).

## Key Changes
- **src/contracts/assistants.ts**: Defined supported assistant identifiers (`claude`, `copilot`, `codex`, `gemini`) and capability contracts.
- **src/contracts/summonable-entry.ts**: Created a shared internal model for assistant entries, metadata, and task identity.
- **src/services/assistants/registry.ts**: Implemented a registry to map assistants to their respective adapters and handle availability checks.
- **src/services/assistants/render-entry.ts**: Added a standardized Markdown renderer for summonable assistant entries.

## Verification Results
- [x] `npm run build` succeeds with the new contracts and services.
- [x] Support for Claude, GitHub Copilot, Codex, and Gemini is explicitly defined.
- [x] Assistant-agnostic entry rendering is functional via `renderSummonableEntry`.
- [x] Registry loads correctly as a module.

## Conclusion
Forge now has a shared, extensible runtime model that allows it to manage multiple AI assistant entrypoints from a single source of truth.
