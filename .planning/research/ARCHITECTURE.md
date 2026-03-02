# Architecture Research: Project-Local Multi-Assistant Installer

Date: 2026-03-02
Context: Brownfield repo pivoting from a Python framework scaffold toward an `npx forge-ai-assist@latest` installer/scaffolder.

## Recommendation

The standard architecture for this product is a thin Node-distributed installer CLI that resolves repository context, collects install intent, builds a normalized project manifest, and then runs assistant-specific generators that emit native project files. The CLI should own orchestration and file generation. Any existing Python logic should be treated as source material or a future runtime integration, not as the installer runtime.

This matches the established `create-*` pattern in npm, where `npm init <name>` maps to `npx create-<name>` / `npm exec create-<name>` and the package's executable performs initialization work in the target repo, usually through prompts plus optional flags rather than through a long-running service layer ([npm docs](https://docs.npmjs.com/cli/v10/commands/npm-init/), [Next.js create-next-app](https://nextjs.org/docs/app/api-reference/cli/create-next-app), [Vite scaffolding guide](https://v6.vite.dev/guide/)).

## Standard Pattern

The common scaffolder shape is:

1. `npx` downloads and runs a versioned CLI package.
2. The CLI inspects the current directory or a target directory.
3. The CLI gathers choices from prompts and flags.
4. The CLI converts those choices into one internal configuration object.
5. Generators render files from templates into the repo.
6. The CLI optionally installs dependencies, writes git-safe local config, and prints next steps.

`forge-ai-assist` should follow that same pattern, but the generated artifacts are assistant config packs rather than app source code.

## Component Boundaries

### 1. Distribution Layer

Responsibility:
- Publish the package for `npx forge-ai-assist@latest`.
- Expose one executable entrypoint.
- Enforce Node version and platform support before any work starts.

Suggested shape:
- `packages/create-forge-ai-assist` or repo-root `create-*` package.
- Small executable bootstrap that delegates immediately into library code.

Reason:
- The npm `create-*` convention is the native fit for `npx`-driven scaffolding ([npm docs](https://docs.npmjs.com/cli/v10/commands/npm-init/)).

### 2. CLI Orchestrator

Responsibility:
- Parse flags.
- Decide interactive vs non-interactive mode.
- Coordinate all subsequent stages.
- Handle dry-run, overwrite policy, and exit codes.

This layer should not know assistant file details. It should call downstream services through typed contracts.

### 3. Repository Inspector

Responsibility:
- Detect repo root, git state, package manager, monorepo markers, existing assistant files, and writeable targets.
- Infer safe defaults from existing files.

Outputs:
- `RepoFacts`
- `ExistingInstallState`
- `ConflictReport`

This is where the brownfield requirement belongs. Do not mix repo detection into template emitters.

### 4. Install Planner

Responsibility:
- Merge CLI flags, prompt answers, and detected defaults.
- Produce one normalized install plan.
- Decide which assistants, file sets, and optional integrations are in scope.

Core output:

```ts
type InstallPlan = {
  targetRoot: string
  mode: "interactive" | "headless"
  assistants: AssistantId[]
  packageManager: "npm" | "pnpm" | "yarn" | "bun" | "unknown"
  overwritePolicy: "fail" | "prompt" | "merge"
  features: {
    sharedCore: boolean
    mcp: boolean
    commands: boolean
    skills: boolean
  }
  project: NormalizedProjectManifest
}
```

This is the architectural seam that prevents prompt logic from leaking into generation logic.

### 5. Normalized Project Manifest

Responsibility:
- Store the shared assistant-agnostic definition of the repo.
- Capture canonical instructions, commands, paths, constraints, and optional capability declarations.

This is the most important boundary in the system.

Recommended contents:
- project summary
- setup/build/test/dev commands
- repo layout hints
- coding conventions
- allowed tools and permissions hints
- optional MCP/tool integrations
- assistant selection metadata

This manifest should be the sole source of truth for generation. Adapters consume it and render native files.

### 6. Assistant Adapter Registry

Responsibility:
- Register assistant-specific emitters behind one common interface.
- Encode file paths, precedence rules, and capability differences.

Recommended interface:

```ts
type AssistantAdapter = {
  id: AssistantId
  detect(repo: RepoFacts): DetectionResult
  validate(plan: InstallPlan): ValidationResult[]
  files(plan: InstallPlan): OutputFile[]
  postWrite?(plan: InstallPlan): PostWriteAction[]
}
```

Keep adapters declarative where possible. The adapter should mostly map normalized manifest fields into native file structures.

### 7. Generation Engine

Responsibility:
- Render templates.
- Merge or preserve existing files.
- Write outputs transactionally.
- Produce a machine-readable change summary.

Sub-parts:
- template loader
- renderer
- diff/conflict engine
- file writer
- rollback or partial-failure reporting

This layer should be generic and reusable by every adapter.

### 8. Validation and Doctor Layer

Responsibility:
- Confirm required files were written.
- Warn when assistant-specific prerequisites are missing.
- Print exact next steps.

This should be a first-class phase, not just console logging. Scaffolding tools like `create-next-app` and `create-vite` treat the install flow as complete only after prompts resolve into a usable project shape ([Next.js](https://nextjs.org/docs/app/api-reference/cli/create-next-app), [Vite](https://v6.vite.dev/guide/)).

## Data Flow

Recommended end-to-end flow:

1. User runs `npx forge-ai-assist@latest` in an existing repo or target directory.
2. Bootstrap checks Node/runtime compatibility and resolves working directory.
3. Repository inspector builds `RepoFacts` from on-disk state.
4. CLI gathers missing intent through prompts unless `--yes` or full flags were supplied.
5. Install planner merges inputs into `InstallPlan`.
6. Planner materializes `NormalizedProjectManifest`.
7. Adapter registry selects enabled assistants.
8. Each adapter converts the manifest into `OutputFile[]`.
9. Generation engine diffs, writes, and records results.
10. Validator checks install completeness and prints follow-up commands.

The internal contract should be:

`CLI input -> RepoFacts -> InstallPlan -> NormalizedProjectManifest -> Adapter outputs -> File writes -> Verification report`

That is the cleanest architecture for keeping assistant proliferation under control.

## Generation Pipeline

Use a staged pipeline rather than direct prompt-to-file generation.

### Stage A: Intake

Inputs:
- CLI args
- environment
- current repo state

Outputs:
- `RepoFacts`
- partial user intent

### Stage B: Planning

Inputs:
- `RepoFacts`
- user intent

Outputs:
- `InstallPlan`
- conflict list

### Stage C: Canonicalization

Inputs:
- `InstallPlan`

Outputs:
- `NormalizedProjectManifest`

This stage is where you normalize commands, paths, assistant selections, and policy defaults.

### Stage D: Emission

Inputs:
- manifest
- adapter registry

Outputs:
- proposed file graph

### Stage E: Materialization

Inputs:
- proposed file graph
- overwrite policy

Outputs:
- written files
- skipped files
- merge warnings

### Stage F: Verification

Inputs:
- materialized outputs

Outputs:
- human summary
- machine summary
- next steps

Do not collapse stages C through E. The normalized manifest is the leverage point for maintainability, tests, and future assistant support.

## Adapter Model

The adapter model should treat each assistant as a native output target, not as a parallel top-level workflow.

### Shared Core

Generate one internal shared core, for example:

- `.forge-ai-assist/core.json` or `.forge-ai-assist/manifest.json`
- optional `.forge-ai-assist/templates/`
- optional `.forge-ai-assist/install-report.json`

This file is for Forge's own regeneration and diff logic. It is not a substitute for native assistant files.

### Native Outputs Per Assistant

Recommended v1 targets based on current documented patterns:

- Copilot:
  - `.github/copilot-instructions.md`
  - optional `.github/instructions/*.instructions.md`
  - optional `AGENTS.md` for agent flows
  - GitHub documents repository-wide instructions, path-specific instructions, and nearest `AGENTS.md` precedence ([GitHub Docs](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions))

- Claude Code:
  - `CLAUDE.md` or `.claude/CLAUDE.md`
  - `.claude/settings.json`
  - optional `.mcp.json`
  - Anthropic documents project-local `CLAUDE.md`, hierarchical precedence, `.claude/settings.json`, and project-local MCP config ([Claude memory](https://code.claude.com/docs/en/memory), [Claude settings](https://code.claude.com/docs/en/settings))

- Codex / AGENTS consumers:
  - `AGENTS.md`
  - optional tool-specific companion files later
  - `AGENTS.md` is emerging as the common cross-agent instruction surface ([agents.md](https://github.com/agentsmd/agents.md))

- Gemini CLI:
  - `GEMINI.md`
  - optional `.gemini/settings.json` if project-local support is desired later
  - Gemini CLI documents `GEMINI.md` project context files and `~/.gemini/settings.json` for MCP/tool extension on the user side ([Gemini CLI repo](https://github.com/google-gemini/gemini-cli))

### Adapter Rules

Each adapter should declare:
- native file paths
- whether files are team-shared or local-only
- precedence and merge behavior
- supported capabilities
- unsupported manifest fields that require warning output

Example:
- Claude can express checked-in settings and local settings separately.
- Copilot distinguishes repo-wide vs path-scoped instructions.
- Gemini and AGENTS consumers are more markdown-centric.

That means the adapter boundary is not just templating. It is capability negotiation.

## What Should Not Be Hand-Rolled

Do not invent a custom prompt DSL in v1.
Do not invent a full template language if string templates plus frontmatter are enough.
Do not make Python the first-hop installer runtime when the distribution requirement is `npx`.
Do not make assistant adapters call the filesystem directly; route all writes through one generation engine.
Do not let adapters parse the repo independently; share `RepoFacts`.

## Brownfield Implications For This Repo

The existing Python scaffold should be preserved as one of:
- future runtime logic to scaffold into generated repos
- a reference implementation for agent abstractions
- install-time sample assets

It should not define the installer package boundary. The installer should live in a Node/TypeScript package with its own tests and templates. If the project later needs Python-authored assets, those should be consumed as templates or copied resources, not as the CLI execution engine.

## Suggested Build Order

1. Create the Node/TypeScript `create-*` CLI package and make `npx forge-ai-assist@latest` work with `--help`, `--yes`, and `--dry-run`.
2. Implement repository inspection and a typed `RepoFacts` model for brownfield detection.
3. Implement the `InstallPlan` builder and normalized manifest schema.
4. Build the generic generation engine with diffing, overwrite policy, and deterministic writes.
5. Ship one shared-core internal manifest format used for regeneration and tests.
6. Implement the first adapter pair:
   Copilot plus `AGENTS.md`.
   Reason: these are simple markdown-first outputs and establish the shared-core-to-native-file pattern quickly.
7. Add Claude adapter with `CLAUDE.md` and `.claude/settings.json`.
8. Add Gemini adapter with `GEMINI.md`; defer project-local settings if runtime support is still evolving.
9. Add validator/doctor output and snapshot tests for every adapter.
10. Add regeneration and upgrade flow so rerunning the installer updates outputs without clobbering user edits blindly.

## Practical V1 Test Matrix

Minimum cases:
- empty repo
- existing git repo
- monorepo root
- nested package directory
- pre-existing `AGENTS.md`
- pre-existing `CLAUDE.md`
- pre-existing `.github/copilot-instructions.md`
- non-interactive CI mode
- dry-run mode
- rerun-after-install merge mode

## Conclusion

The standard architecture is a create-style Node CLI with a strict separation between discovery, planning, canonical manifest generation, and assistant-native emission. The normalized manifest plus adapter registry is the key design choice. If that seam is correct, adding assistants becomes incremental. If that seam is missing, the product turns into duplicated per-assistant scaffolding logic almost immediately.

## Sources

- npm CLI `npm init`: https://docs.npmjs.com/cli/v10/commands/npm-init/
- Next.js `create-next-app`: https://nextjs.org/docs/app/api-reference/cli/create-next-app
- Vite scaffolding guide: https://v6.vite.dev/guide/
- GitHub Copilot repository instructions: https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions
- Claude Code memory: https://code.claude.com/docs/en/memory
- Claude Code settings: https://code.claude.com/docs/en/settings
- AGENTS.md specification repo: https://github.com/agentsmd/agents.md
- Gemini CLI repository/docs entrypoint: https://github.com/google-gemini/gemini-cli
