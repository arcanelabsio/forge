# Forge AI Assist

## What This Is

Forge AI Assist is a repo bootstrapper for AI coding assistant support. It should be installable through a command like `npx forge-ai-assist@latest` and scaffold project-local scripts, shared core definitions, and assistant-specific adapter files so a repository can support Claude, GitHub Copilot, Codex, Gemini, and related runtimes from one setup flow.

The current repository already contains an early Python framework scaffold, but this project direction pivots the next milestone toward a maintainers-first installation experience modeled after GSD: one entry command, runtime selection, location-aware install behavior, and generated assistant config packs that make a repo immediately usable with selected assistants.

## Core Value

A maintainer can run one installer flow and end up with a repository that cleanly supports their chosen AI code assistants without hand-building each runtime's setup.

## Requirements

### Validated

- ✓ Repository contains a Python package scaffold with a minimal orchestrator/agent architecture — existing
- ✓ Repository already includes assistant-oriented documentation and helper scripts as a starting point — existing
- ✓ Brownfield codebase map exists under `.planning/codebase/` to inform future planning — existing

### Active

- [ ] Provide an install experience comparable to GSD via `npx forge-ai-assist@latest`
- [ ] Scaffold project-local assistant config packs for all major supported assistants
- [ ] Generate a shared core definition plus assistant-specific adapter files from the same install flow
- [ ] Make one repository onboarding flow work cleanly for maintainers with minimal manual edits

### Out of Scope

- Full planning and execution workflow automation — deferred because v1 is focused on install and scaffolding
- Cloud sync or hosted template registry — not required to prove repo onboarding value in v1
- Assistant-by-assistant bespoke authoring as the primary workflow — avoid per-runtime duplication in favor of shared core generation

## Context

This repository is currently a brownfield Python codebase with a nested package layout under `forge/`, no declared third-party runtime dependencies, and a minimal framework scaffold rather than a production-ready assistant installer. The codebase map shows a substantial gap between the current implementation and the new product goal.

The desired user experience is explicitly modeled after the GSD installer pattern: a single `npx` entrypoint, interactive selection of runtimes, non-interactive flags for automation, and generated files that let users start immediately. The primary audience is repository maintainers who need to support multiple AI coding assistants without repeating fragmented setup work across runtimes.

The main pain point is ecosystem fragmentation. Each assistant expects different config formats, prompts, skills, commands, and install locations. This project should reduce that fragmentation by generating a common core with assistant-specific adapters, with project-local output as the default behavior.

## Constraints

- **Brownfield**: Must evolve from the existing Python scaffold rather than assuming a blank repo — current codebase and packaging shape already exist
- **Install UX**: Installer should feel similar to GSD's `npx` flow — the requested interaction model is already anchored by the reference README
- **Scope**: v1 must onboard one repository cleanly before optimizing for broader platform ambitions — keeps early roadmap focused
- **Assistant Coverage**: Support should target all major AI coding assistants called out during questioning — avoids shipping a narrow single-assistant tool first
- **Generation Model**: Shared core plus assistant-specific adapters — prevents duplicating the entire setup definition per runtime

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Model installer UX after GSD's `npx` pattern | The reference pattern already matches the desired single-command onboarding experience | — Pending |
| Target repo maintainers as the primary v1 user | They are the people adding assistant support to repositories and deciding what gets versioned | — Pending |
| Default generated output to project-local files | Repository-level onboarding is the main success criterion for v1 | — Pending |
| Generate a shared core plus assistant-specific adapters | Reduces fragmentation while still producing native runtime artifacts | — Pending |
| Keep full execution/planning workflows out of v1 | The first release needs to prove install and scaffolding value before broader workflow automation | — Pending |

---
*Last updated: 2026-03-02 after initialization*
