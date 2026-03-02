# FORGE Architecture

## Overview

The FORGE project is a CLI tool built with TypeScript and Node.js. It is designed to provide repository-sidecar management and AI assistance.

The architecture is service-oriented, with a clear separation between the CLI entry point, command handlers, and business logic services.

## Core Components

- **CLI Layer**: Built using the `commander` library. It handles argument parsing, command routing, and help generation.
- **Command Layer**: Discrete functions that map CLI inputs to service calls.
- **Service Layer**: Independent services that handle specific domain logic (Git operations, metadata management, sidecar orchestration).
- **Configuration**: Zod-based schema validation for configuration and metadata.

## Entry Points

### CLI entry point

`src/cli.ts` is the main entry point for the executable. It:
1. Initializes the CLI program.
2. Parses process arguments.
3. Handles global error reporting (using `UserFacingError`).

### Program Factory

`src/program.ts` defines the CLI structure. It:
1. Loads the `package.json` to get version and name information.
2. Defines all available commands and their descriptions.
3. Configures help and error output behavior.

## Layers

### Layer 1: CLI & Routing

Defined in `src/program.ts` and `src/commands/`.
- Uses `commander` to define the command-line interface.
- Maps user commands (e.g., `bootstrap`) to their respective handlers.

### Layer 2: Command Handlers

Found in `src/commands/`.
- Orchestrates high-level workflows by calling into multiple services.
- Provides user-facing feedback (console logs).
- Example: `bootstrapCommand` in `src/commands/bootstrap.ts`.

### Layer 3: Services

Found in `src/services/`.
- **GitService**: Interfaces with the local git repository (e.g., finding repo root).
- **MetadataService**: Manages the reading and writing of `.forge/metadata.json`.
- **SidecarService**: High-level service that ensures the `.forge` directory and its metadata are correctly initialized.

### Layer 4: Library & Helpers

Found in `src/lib/`.
- Shared utilities and custom error classes like `UserFacingError`.

## Data Flow

1. User executes a command (e.g., `npx forge-ai-assist bootstrap`).
2. `src/cli.ts` calls `createProgram()` and starts parsing.
3. `commander` routes the execution to `src/commands/bootstrap.ts`.
4. `bootstrapCommand` calls `GitService` to find the repository root.
5. `bootstrapCommand` calls `SidecarService` to initialize the sidecar.
6. `SidecarService` uses `MetadataService` to check/create `metadata.json`.
7. Success is reported back to the console.

## Control Flow

`cli.ts` -> `program.ts` -> `commands/*.ts` -> `services/*.ts`

Error handling is centralized in `cli.ts`, which catches `UserFacingError` to display friendly error messages, while re-throwing unexpected errors.

## Sidecar Pattern

The FORGE CLI follows a "sidecar" pattern:
- It maintains its state within a `.forge/` directory in the target repository.
- It respects the repository boundary, only modifying files inside `.forge/` unless explicitly instructed otherwise.
- It uses a `metadata.json` file for versioned repository configuration.

## Architectural Assessment

The current architecture is modular and extensible:
- Service-oriented design allows for easy addition of new capabilities.
- Strong typing with TypeScript and schema validation with Zod ensures data integrity.
- Centralized command routing makes the CLI surface area easy to manage.
- Separation of concerns between the CLI interface and the business logic facilitates future expansion.
