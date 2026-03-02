# Architecture: Forge AI Assist

## Overview

Forge AI Assist is a Node.js/TypeScript CLI designed to manage repository-specific artifacts for AI coding assistants. It follows a "Sidecar Architecture," keeping all managed state within a single, ignorable `.forge/` directory.

## Core Principles

- **Sidecar-First**: The target repository is the source of truth for code, but Forge is the source of truth for assistant-related metadata. This state must be isolated to `.forge/`.
- **Command-Driven**: Functionality is exposed through a CLI entrypoint (`src/cli.ts`) for both human maintainers and automated assistant calls.
- **Service-Oriented**: Logic for Git operations, sidecar management, and metadata persistence is encapsulated in stateless services.
- **Non-Intrusive**: Forge should never modify the target repository's working files (outside `.forge/`) unless explicitly commanded to do so.

## Component Breakdown

### 1. CLI Entrypoint (`src/cli.ts`, `src/program.ts`)
- Uses `commander` to define subcommands and parse arguments.
- Handles top-level error mapping to provide clean, user-facing stderr output.

### 2. Command Handlers (`src/commands/`)
- Implements the specific logic for each CLI command.
- `bootstrap.ts`: Orchestrates the initial setup or reuse of the `.forge/` sidecar.

### 3. Services (`src/services/`)
- **GitService (`git.ts`)**: Wraps Git subprocess calls to resolve the repository root and validate worktree state.
- **SidecarService (`sidecar.ts`)**: Manages the lifecycle of the `.forge/` directory.
- **MetadataService (`metadata.ts`)**: Handles atomic JSON persistence for `metadata.json` using Zod for runtime schema validation.

### 4. Library (`src/lib/`)
- **Errors (`errors.ts`)**: Defines a hierarchy of typed, user-facing errors (e.g., `RepositoryRequiredError`).

## Data Flow: Bootstrap Example

1. **User** runs `npx forge-ai-assist bootstrap`.
2. **CLI Entrypoint** invokes the bootstrap command handler.
3. **Bootstrap Command** calls `GitService.getRepoRoot()`.
4. **GitService** executes `git rev-parse --show-toplevel` and returns the path.
5. **Bootstrap Command** calls `SidecarService.initializeSidecar(repoRoot)`.
6. **SidecarService** ensures `.forge/` exists and calls `MetadataService.readMetadata()`.
7. **MetadataService** reads, parses, and validates `metadata.json` using Zod.
8. **SidecarService** returns the current metadata (creating new default state if it was missing).
9. **Bootstrap Command** prints a success summary to the user.

## Future Expansion

### Analysis Engine (Phase 2)
- Will add an `AnalysisService` to inspect the repository and generate facts.
- Facts will be stored in sidecar artifacts (e.g., `.forge/analysis.json`).

### Planning Engine (Phase 3)
- Will add a `PlanningService` to turn analysis facts into reviewable action plans.
- Plans will be stored as markdown or JSON in the sidecar.

### Assistant Adapters (Phase 4)
- Will add adapters to translate internal plans into assistant-specific formats (e.g., Claude skills, Copilot instructions).
- Will manage the installation of these entries into assistant-native runtime locations.
