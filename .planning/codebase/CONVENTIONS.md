# Code Conventions

## Scope

Forge is a Node.js/TypeScript CLI project. These conventions reflect the established patterns as of Phase 1 (Bootstrap CLI).

## Language & Runtime

- **Runtime**: Node.js 22.x+
- **Language**: TypeScript with ESM (`"type": "module"` in `package.json`).
- **Module Resolution**: `NodeNext` for compatibility with modern Node.js ESM.
- **Transpilation**: TypeScript (`tsc`) targets ES2022.

## Naming & Layout

- **Source Code**: All source lives in `src/`.
- **Entrypoints**:
  - `src/cli.ts`: Shebang entrypoint for the CLI.
  - `src/program.ts`: Commander.js program definition and command registration.
- **Services**: Business logic is encapsulated in `src/services/` (e.g., `git.ts`, `sidecar.ts`, `metadata.ts`).
- **Commands**: Command handlers live in `src/commands/` (e.g., `bootstrap.ts`).
- **Library**: Shared utilities and error types live in `src/lib/` (e.g., `errors.ts`).
- **Configuration**: Static configuration and constants live in `src/config/`.
- **Filenames**: Use `kebab-case.ts` for all source files.
- **Exports**: Prefer named exports over default exports for better discoverability and refactoring.

## Coding Style

- **Strictness**: `strict: true` in `tsconfig.json` is mandatory.
- **Async/Await**: Use async/await for all asynchronous operations.
- **Error Handling**: 
  - Use typed errors from `src/lib/errors.ts` for user-facing failures.
  - The CLI entrypoint (`src/cli.ts`) is responsible for catching `UserFacingError` and formatting them for stderr.
- **Dependencies**: Keep dependencies minimal. Currently uses `commander`, `zod`, and `execa`.
- **Imports**: Always use `.js` extensions in imports to satisfy ESM requirements (e.g., `import { x } from './y.js'`).

## Architecture Patterns

- **Service-Oriented**: Logic for Git operations, sidecar management, and metadata persistence is isolated into stateless services.
- **Atomic Operations**: File writes (especially metadata) must be atomic using temp-file and rename semantics (`src/services/metadata.ts`).
- **Guardrails**: Commands that require a repository context must use the Git service to assert they are running inside a valid Git worktree.
- **Sidecar Isolation**: All Forge-managed repository artifacts must stay within the `.forge/` directory.

## Documentation

- Use TSDoc/JSDoc comments for all public-facing functions, interfaces, and classes.
- Keep comments concise and focused on intent and edge cases.
