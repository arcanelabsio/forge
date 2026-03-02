# Research Summary: Forge AI Assist

## Recommendation

Forge AI Assist should be built as a Node-first TypeScript CLI distributed through npm and executed via `npx forge-ai-assist@latest`. The repository has been fully transitioned from a legacy Python scaffold to a modern Node.js/TypeScript foundation.

## Problem Statement

AI coding assistants currently lack a unified way to manage repository-specific context, analyze codebase state, and generate action plans without directly mutating the repository's working files. Maintainers are forced to manually coordinate assistant-specific configurations across multiple tools.

## Proposed Solution

A standalone CLI tool that provides:
1. **Sidecar Management**: Isolated repository state in a single, ignorable `.forge/` directory.
2. **Repository Guardrails**: Ensuring commands only run in valid Git contexts to prevent accidental misconfiguration.
3. **Analysis & Planning Engine**: Inspecting the repository to produce reviewable action plans (v1 core capability).
4. **Assistant Orchestration**: Automating the installation of summonable entries for Claude, Copilot, Codex, and Gemini.

## Architectural Foundation (Phase 1 Complete)

The current implementation establishes the following foundation:
- **CLI Bootstrapping**: A shebang entrypoint and Commander-based program definition.
- **Git Context Awareness**: Subprocess-based repository root resolution and worktree validation.
- **Sidecar Lifecycle**: Atomic metadata persistence with Zod schema enforcement for the `.forge` directory.
- **User-Facing Error Design**: A typed error hierarchy that provides clean, subprocess-safe feedback to users.

## Next Steps

- **Phase 2: Repository Analysis**: Implementing the engine that extracts repository facts into sidecar artifacts.
- **Phase 3: Copilot Planning Proof**: Building the first end-to-end workflow for GitHub Copilot discussion analysis.
- **Phase 4: Assistant Runtime Expansion**: Generalizing the orchestration model to support the broader assistant ecosystem.
- **Phase 5: Quality Gates**: Locking in the system's reliability with automated test coverage and CI integration.

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Node.js / TypeScript | Matches the `npx` distribution channel and provides a stable, modern development environment. |
| Sidecar Architecture | Keeps Forge-managed data isolated from user-managed source code, ensuring a non-intrusive experience. |
| Git-First Guardrails | Sharpens the tool's focus and prevents execution in ambiguous or non-repository contexts. |
| Atomic Persistence | Prevents metadata corruption during repeated or interrupted CLI runs. |
