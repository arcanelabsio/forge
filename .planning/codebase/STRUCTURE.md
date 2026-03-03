# FORGE Structure

## Top-Level Layout

The repository root is a standard Node.js project.

Key top-level files and directories:

- `package.json`: Main project manifest, dependencies, and scripts.
- `tsconfig.json`: TypeScript configuration.
- `src/`: TypeScript source code.
- `dist/`: Compiled JavaScript output (ignored by git).
- `.planning/`: High-level planning and architectural documentation.
- `.forge/`: Sidecar directory for FORGE metadata (when initialized).
- `.github/`: Repository automation and GitHub-specific configuration.

## Source Directory Layout (`src/`)

The `src/` directory contains the core implementation of the FORGE CLI tool:

- `src/cli.ts`: Entry point for the executable.
- `src/program.ts`: CLI structure and command definition.
- `src/commands/`: Implementation of CLI commands (handlers).
- `src/services/`: Core logic and infrastructure abstraction (Git, Metadata, etc.).
- `src/config/`: Configuration schemas (using Zod) and default values.
- `src/lib/`: Shared utilities and internal library functions.

## `src/commands/` Structure

This directory contains the action handlers for each CLI command:

- `src/commands/bootstrap.ts`: Handles the `bootstrap` command, orchestrating the initial setup of the `.forge/` sidecar.

## `src/services/` Structure

Each service is an independent unit of business logic:

- `src/services/git.ts`: Handles git repository detection and commands.
- `src/services/metadata.ts`: Manages the reading and writing of `.forge/metadata.json`.
- `src/services/sidecar.ts`: Orchestrates sidecar initialization and context derivation.

## `src/config/` Structure

Configuration and schema definitions:

- `src/config/sidecar.ts`: Constants and schemas related to the sidecar directory and metadata.

## `src/lib/` Structure

Shared utilities and foundational logic:

- `src/lib/errors.ts`: Custom error classes for user-facing and internal errors.

## Execution Surfaces

The tool is distributed as a CLI:

- **npx forge-ai-assist**: Main command executed by users.
- **npm run build**: Compiles the project from `src/` to `dist/`.
- **npm run start**: Runs the CLI using `tsx` for local development.

## Structural Integrity

The FORGE project follows a clean, service-oriented structure:

- Clear separation between the CLI interface and the implementation services.
- Centralized configuration and error handling.
- Standard Node.js conventions for packaging and distribution.
- Extensible command and service architecture.
