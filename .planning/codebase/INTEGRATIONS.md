# Integrations

## Overview

Forge is a standalone Node.js/TypeScript CLI. Its current integrations are limited to local system tools and internal service coordination.

## System Integrations

### Git (Subprocess)
- **Tool**: `git` (via `execa`).
- **Purpose**: Repository root detection, worktree validation, and repository state analysis.
- **Service**: `src/services/git.ts`.
- **Commands**: `git rev-parse --is-inside-work-tree`, `git rev-parse --show-toplevel`.

### Filesystem (Node.js `fs/promises`)
- **Purpose**: Managing the `.forge` sidecar directory and metadata persistence.
- **Service**: `src/services/sidecar.ts`, `src/services/metadata.ts`.
- **Operations**: Atomic JSON writes using temp-file and rename semantics to prevent metadata corruption.

## Library Integrations

### Commander.js
- **Purpose**: CLI argument parsing, command registration, and help generation.
- **Entrypoint**: `src/program.ts`.

### Zod
- **Purpose**: Runtime schema validation for sidecar metadata.
- **Service**: `src/services/metadata.ts`.
- **Usage**: Validating the `metadata.json` structure on read and write.

### Execa
- **Purpose**: Robust subprocess execution for Git commands.
- **Service**: `src/services/git.ts`.

## Planned Integrations (v1 Roadmap)

- **GitHub Copilot**: Integration via `/agent` entrypoints for discussion analysis and action-plan generation (Phase 3).
- **Other Assistants**: Generalizing summonable entries for Claude, Codex, and Gemini (Phase 4).
- **Assistant Runtime Locations**: Forge will automate the installation of summonable entries into specific assistant-owned directories (Phase 4).

## Explicitly Absent Integrations

Forge currently does **not** implement:
- LLM Provider SDKs (OpenAI, Anthropic, etc.).
- External APIs or Webhooks.
- Database systems.
- Cloud storage or sync services.
- Authentication or secrets management beyond local filesystem permissions.
