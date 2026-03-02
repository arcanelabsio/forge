# Forge AI Assist

## What This Is

Forge AI Assist is a tooling layer for AI coding assistants. It should be installable through a command like `npx forge-ai-assist@latest`, install or update summonable assistant entries in assistant-owned locations such as Copilot agent directories or Codex skill directories, and when invoked against a repository, keep repo-specific Forge artifacts inside a single ignorable Forge-owned directory rather than mutating user repository files directly.

The current repository already contains an early Python framework scaffold, but this project direction pivots the next milestone toward a maintainers-first install-and-summon experience modeled after GSD's ergonomics: one entry command, assistant-aware task entrypoints, centralized installation into assistant runtime directories, repository analysis, and generated action plans that users or maintainers can execute themselves.

## Core Value

A maintainer can run one Forge install flow, summon the right assistant entrypoint from their AI tool, and get usable repository analysis and action plans without Forge directly mutating the repository's working files.

## Requirements

### Validated

- ✓ Repository contains a Python package scaffold with a minimal orchestrator/agent architecture — existing
- ✓ Repository already includes assistant-oriented documentation and helper scripts as a starting point — existing
- ✓ Brownfield codebase map exists under `.planning/codebase/` to inform future planning — existing

### Active

- [ ] Provide an install-and-update experience callable via `npx forge-ai-assist@latest`
- [ ] Install summonable assistant entries into assistant-owned runtime locations from one managed source
- [ ] Keep repo-specific Forge-managed artifacts inside one ignorable sidecar directory
- [ ] Support summonable assistant tasks across major assistants without mutating repository-native working files
- [ ] Analyze a Git repository and generate action plans for users or maintainers to execute

### Out of Scope

- Full automated repository modification or execution workflow automation — deferred because v1 is focused on analysis and planning
- Cloud sync or hosted template registry — not required to prove repo onboarding value in v1
- Writing assistant-specific runtime files by hand into multiple user directories — Forge should automate this centrally

## Context

This repository is currently a brownfield Python codebase with a nested package layout under `forge/`, no declared third-party runtime dependencies, and a minimal framework scaffold rather than a production-ready sidecar tool. The codebase map shows a substantial gap between the current implementation and the new product goal.

The desired user experience borrows GSD's summonability and command ergonomics, but splits concerns clearly: Forge should install assistant-specific summonable entries into assistant runtime locations, and those entries should analyze a Git repository while writing repo-specific Forge artifacts only into one ignorable directory.

The main pain point is ecosystem fragmentation and manual copying. Each assistant expects different invocation patterns, skills, and install locations. Forge should reduce that fragmentation by managing those assistant-specific installation targets from one source while keeping repository changes manual and reviewable in v1.

## Constraints

- **Brownfield**: Must evolve from the existing Python scaffold rather than assuming a blank repo — current codebase and packaging shape already exist
- **Install UX**: Entry should feel similar to GSD's `npx` flow, while handling assistant-specific installation targets automatically
- **Scope**: v1 must onboard one repository cleanly before optimizing for broader platform ambitions — keeps early roadmap focused
- **Assistant Coverage**: Support should target all major AI coding assistants called out during questioning — avoids shipping a narrow single-assistant tool first
- **Runtime Split**: Assistant summonable files may live in assistant-owned global/runtime directories, while repo-specific Forge outputs must live in one ignorable Forge-owned directory
- **Git Requirement**: If the command is not invoked from a Git repository, it should exit rather than scaffold or analyze anything

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Model invocation UX after GSD's `npx` pattern | The reference pattern matches the desired single-command entry experience | — Pending |
| Target repo maintainers as the primary v1 user | They are the people adding assistant support to repositories and deciding what gets versioned | — Pending |
| Automate installation into assistant-owned runtime directories | This removes the current manual copying work across Copilot, Codex, and similar tools | — Pending |
| Keep all generated output inside one ignorable sidecar directory | Forge must not interfere with the target repository in v1 | — Pending |
| Make analysis and action-plan generation the primary v1 capability | First delivery is for repository understanding and planning, not direct code changes | — Pending |
| Require Git repository context before running | Prevents meaningless execution outside a repository and sharpens product scope | — Pending |

---
*Last updated: 2026-03-02 after initialization*
