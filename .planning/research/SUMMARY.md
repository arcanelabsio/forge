# Research Summary: Forge AI Assist

Date: 2026-03-02

## Recommendation

Forge AI Assist should be built as a Node-first TypeScript CLI distributed through npm and executed via `npx forge-ai-assist@latest`. The current Python scaffold should be treated as brownfield context, not as the installer runtime for v1.

The core architectural decision is to maintain one canonical shared manifest for repository assistant policy and generate assistant-native outputs from adapter modules. This avoids duplicating configuration logic across Claude, Copilot, Codex, Gemini, and future assistants.

## Recommended Stack

- Runtime: Node.js 22+ with npm distribution
- Language: TypeScript 5.x in ESM mode
- CLI: `commander`
- Interactive prompts: `@inquirer/prompts`
- Validation/schema: `zod`
- File/process utilities: Node built-ins plus narrow `execa` usage
- Testing: `vitest`, fixture snapshots, packed-tarball smoke tests
- Release flow: `changesets` with npm trusted publishing

## Table Stakes

- Interactive `npx` installer plus non-interactive flags
- Repo inspection and safe brownfield placement logic
- Shared core definition stored in-repo as Forge's source of truth
- Native generated files for Claude, GitHub Copilot, Codex, and Gemini
- Assistant selection during install
- Idempotent reruns with explicit preview before writes
- Versioned generated output committed with the repo
- Basic verify and cleanup paths

## Differentiators

- Cross-assistant compilation from one domain model
- Capability-aware generation instead of fake parity
- Monorepo-aware scaffolding
- Adoption mode for existing assistant files
- Optional command pack generation
- Upgrade and drift-management path as assistants evolve

## Anti-Features

- Hosted registry or cloud sync in v1
- Per-assistant bespoke authoring as the main workflow
- Unsafe overwrite behavior in brownfield repos
- Heavy daemon/background requirements
- Full planning/execution workflow automation in v1
- Invasive AST/source rewrites during install

## Architecture Shape

Recommended pipeline:

1. CLI bootstrap and runtime checks
2. Repository inspection
3. Install plan generation
4. Canonical manifest creation
5. Assistant adapter selection
6. File rendering/materialization
7. Verification and next-step reporting

Key boundaries:

- CLI orchestrator
- Repository inspector
- Install planner
- Normalized project manifest
- Assistant adapter registry
- Generation engine
- Validation/doctor layer

## Key Risks

- Treating all assistants as if they share one real config model
- Getting file discovery or precedence wrong per assistant
- Overwriting existing assistant files unsafely
- Generating bloated instruction files that reduce assistant adherence
- Missing deterministic headless mode for CI/bootstrap
- Ignoring monorepo and workspace-root edge cases
- Underestimating vendor drift in file formats and behavior
- Measuring success by "files written" instead of "assistants actually load and use them"

## Build Order Implication

The research suggests a roadmap that starts by locking capability and output contracts, then safe brownfield placement, then shared-core-plus-adapter generation, then verification/smoke testing, and finally upgrade/release operations.
