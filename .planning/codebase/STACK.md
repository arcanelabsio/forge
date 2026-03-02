# Technology Stack

## Snapshot

This codebase is a Node.js/TypeScript project. It is built as a CLI tool distributed via npm.

## Languages

- **TypeScript**: Primary language for logic and CLI.
- **Node.js**: Runtime environment (Targeting Node 22+).
- **Markdown**: Used for documentation and planning.

## Packaging And Runtime

- **Package Manager**: npm (standard `package.json` and `package-lock.json`).
- **Compiler**: `tsc` (TypeScript compiler) targeting ESM.
- **Distribution**: npm package `forge-ai-assist`.
- **Entrypoint**: `src/cli.ts` (compiled to `dist/cli.js`).

## Dependency Profile

- **Commander**: CLI framework for command routing and argument parsing.
- **Zod**: Schema validation for metadata and configuration.
- **Internal Services**:
  - `GitService`: Repository detection and Git operations.
  - `MetadataService`: Sidecar directory (`.forge/`) and metadata management.
  - `SidecarService`: High-level orchestration for repository initialization.

## Code Organization

- `src/`: TypeScript source files.
  - `src/commands/`: CLI command implementations.
  - `src/services/`: Core business logic and infrastructure services.
  - `src/config/`: Configuration schemas and defaults.
  - `src/lib/`: Shared utilities and error types.
- `dist/`: Compiled JavaScript output (ESM).

## Execution Surfaces

- `npx forge-ai-assist`: Primary user-facing execution path.
- `npm run build`: Compiles TypeScript to JavaScript.
- `npm run start`: Runs the CLI using `tsx` (for development).

## Configuration Surfaces

- `package.json`: Build scripts, dependencies, and metadata.
- `tsconfig.json`: TypeScript compiler configuration.
- `.forge/metadata.json`: Repository-specific sidecar metadata.
