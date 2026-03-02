# Forge AI Assist

## What This Is

Forge AI Assist is a tooling layer for AI coding assistants. It is a Node.js/TypeScript CLI installable through `npx forge-ai-assist@latest`. When invoked against a repository, it keeps repo-specific Forge artifacts inside a single ignorable `.forge/` directory rather than mutating user repository files directly.

The project has transitioned from a legacy Python scaffold to a modern TypeScript implementation focused on a maintainers-first install-and-summon experience: one entry command, assistant-aware task entrypoints, centralized installation into assistant runtime directories, repository analysis, and generated action plans.

## Core Value

A maintainer can run one Forge install flow, summon the right assistant entrypoint from their AI tool, and get usable repository analysis and action plans without Forge directly mutating the repository's working files.

## Requirements

### Validated

- ✓ Repository establishes a Node.js/TypeScript CLI foundation at the root — existing
- ✓ Legacy Python scaffold and associated references have been removed — clean state
- ✓ Basic sidecar directory (`.forge/`) and metadata management are implemented — existing

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

This repository is a TypeScript project with a Node.js CLI entrypoint. It implements a sidecar architecture where Forge-managed artifacts are kept inside a single `.forge/` directory within the target repository.

The desired user experience borrows GSD's summonability and command ergonomics: Forge manages assistant-specific installation targets from one source while keeping repository changes manual and reviewable.

## Constraints

- **Architecture**: All repo-specific Forge-managed artifacts MUST live inside a single ignorable `.forge/` directory.
- **Git Requirement**: If the command is not invoked from a Git repository, it MUST exit rather than scaffold or analyze anything.
- **Install UX**: The entry point MUST feel similar to GSD's `npx` flow.
- **Scope**: v1 focuses on onboarding one repository cleanly with analysis and planning capabilities.


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
