# Standard Stack

## Recommendation

Build Forge AI Assist as a Node-first TypeScript CLI published to npm and executed via `npx forge-ai-assist@latest`. Keep the existing Python scaffold as legacy material, not the v1 installer runtime.

**Prescriptive default stack**

| Area | Use | Why | Confidence |
|---|---|---|---|
| Runtime | Node.js 22 LTS minimum, validate on Node 22 and Node 24 | `npx` distribution is npm-native, Node 22+ gives modern `fs`, `glob`, and ESM behavior without polyfill-heavy baggage | High |
| Language | TypeScript 5.x in ESM mode (`module: NodeNext`) | Best fit for npm CLI packaging, strong typing for manifest and adapter generation, easy contributor onboarding | High |
| Package manager for development | `pnpm` workspace | Fast installs, good workspace ergonomics, standard for TS monorepos; publish package itself to npm | High |
| Published package shape | Single public package: `forge-ai-assist` with a `bin` entry | Keeps `npx forge-ai-assist@latest` simple and stable | High |
| CLI framework | `commander` | Mature, stable, predictable help/flags/subcommands, low abstraction cost | High |
| Interactive prompts | `@inquirer/prompts` | Stable prompt primitives without betting v1 on newer prompt stacks | Medium |
| Validation | `zod` for all installer input and manifest validation | Typed runtime validation and JSON Schema export from one source of truth | High |
| File ops | Node built-ins (`fs/promises`, `fs.cp`, `path`, native `glob`) plus `execa` only for controlled git/npm calls | Reduce dependency surface; only use subprocess wrapper where it adds real value | High |
| Generation model | Canonical manifest + adapter generators + versioned templates | Centralizes product logic and avoids hand-maintaining assistant-specific file trees | High |
| Templates | Plain text template files plus small transformer functions; avoid JSX/template DSLs | Easier diffing, testing, and assistant-specific overrides | High |
| Tests | `vitest` + fixture/snapshot tests + end-to-end `npm pack` smoke tests in temp dirs | Fast unit coverage plus real packaged-installer verification | High |
| Lint/format | `eslint` + `@typescript-eslint` + `prettier` | Boring and standard; optimize for maintainer familiarity | High |
| Release management | `changesets` + npm trusted publishing | Standard npm release flow, changelog/version automation, no long-lived publish tokens | High |
| CI | GitHub Actions matrix on Node 22 and 24 | Matches supported runtime contract and npm publish path | High |

## Packaging And Runtime Choices

Use a normal npm CLI package, not a Python wrapper and not a shell bootstrap. The installer product is fundamentally npm-distributed, so the implementation should live where package install, auth, cache, and `bin` resolution already work.

Use ESM-first TypeScript and compile to `dist/` for publish. Do not ship raw TypeScript to users. For v1, publish one executable command:

- `forge-ai-assist init`
- optional alias: `forge-ai-assist doctor`
- optional alias later: `forge-ai-assist migrate`

Do not split v1 into many publishable packages. If internal separation helps, keep it as a workspace with private packages:

- `packages/cli`
- `packages/core`
- `packages/adapters`
- `packages/templates`

But publish only `forge-ai-assist` until the public API and adapter boundaries settle.

## CLI Approach

Use `commander` with explicit subcommands, typed option parsing, and a thin command layer:

- `init` for interactive and non-interactive install
- `doctor` for validation, drift checks, and upgrade hints
- `--assistants claude,codex,copilot,gemini`
- `--yes`
- `--dry-run`
- `--cwd <path>`
- `--format json` for automation output
- `--core-only` only if real users ask for it

Use `@inquirer/prompts` only for interactive questions. Keep business logic out of prompts. The CLI should produce an install plan object first, then either print it, apply it, or write it in dry-run mode.

## Manifest And Generation Approach

Do not model the product as "copy one folder per assistant." Model it as:

1. Canonical repository manifest
2. Normalized install plan
3. Assistant adapter generators
4. File writer with merge/update rules

**Canonical manifest**

Use a single typed manifest that describes:

- repository basics
- selected assistants
- command aliases
- shared policies/instructions
- optional tools/skills/features
- file placement rules
- version stamp for future migrations

Define the manifest in `zod`. Export JSON Schema from the same source for documentation, tests, and editor tooling.

**Generation**

Generate a shared core first, then emit assistant-specific files from adapter modules. Each adapter should own:

- `supports(manifest)`
- `plan(manifest, repoState)`
- `render(plan)`
- `mergeStrategy`

Keep templates mostly static and push conditional logic into adapter code. That keeps generated files readable and reduces template sprawl.

**Writes and updates**

Implement write modes explicitly:

- `create` for new files
- `merge` for structured files you own
- `patch` only for narrow, deterministic edits
- `skip` when existing user-owned content is ambiguous

Default to safe, additive writes. When a file cannot be updated confidently, write a sibling `*.forge-ai-assist.patch` or emit a manual action note instead of guessing.

## Suggested Internal Layout

```text
packages/
  cli/
    src/
      bin.ts
      commands/
      ui/
  core/
    src/
      manifest/
      planning/
      generation/
      repo/
      writes/
  adapters/
    src/
      claude/
      codex/
      copilot/
      gemini/
      shared/
  templates/
    src/
      shared/
      claude/
      codex/
      copilot/
      gemini/
```

For this brownfield repo, add the Node workspace at the repository root and leave the current Python package in place until migration is complete. Do not try to make Python and Node co-own the installer path.

## Testing And Tooling

Use three test layers:

1. Unit tests for manifest parsing, assistant selection rules, merge logic, and repo detection
2. Fixture tests that snapshot generated output for representative repos
3. End-to-end smoke tests that run the packed npm tarball in temp repositories

Key test cases:

- empty repo
- existing `.github/`
- existing assistant config files
- repeated runs are idempotent
- `--dry-run` matches actual write plan
- partial assistant selection
- upgrade from prior manifest version

Prefer golden-file fixtures over mocking file systems deeply. The product is about file generation; test the files.

Use:

- `vitest` for unit and fixture tests
- `tsx` for local script execution in development
- `changesets` for versioning/changelog
- `publint` before publish if packaging issues start appearing

## Release And Distribution

Publish to npm with trusted publishing from GitHub Actions. Use provenance-capable publish flow and avoid manual npm tokens for routine releases.

Recommended release flow:

1. merge changeset PRs
2. version with Changesets
3. run full matrix tests
4. `npm publish` from CI
5. validate `npx forge-ai-assist@latest --help`

## What Not To Use Yet

Do not use these in v1:

- Bun as the required runtime. It narrows adoption and complicates the `npx` story.
- Deno as the primary implementation runtime. Same reason.
- Yeoman. Too heavyweight for the product shape.
- AST-heavy codemods for broad config editing. Use deterministic structured edits only where the target format is well-bounded.
- A hosted template registry or remote generation service. Versioned local templates are simpler, safer, and easier to debug.
- A plugin marketplace. Adapter extension points can stay internal until the core manifest stabilizes.
- Multiple public npm packages for each assistant. Premature surface area.
- Prompt/UI frameworks that are still effectively in flux. v1 should optimize for operational stability.
- Reusing the current Python scaffold as the installer runtime. It fights the distribution channel.

## Brownfield Migration Advice

Treat the current Python scaffold as reference material, not the product foundation. The fastest credible path is:

1. add Node workspace and npm package at repo root
2. implement installer core and one end-to-end command path
3. scaffold adapters for Claude, Codex, Copilot, and Gemini from one manifest
4. keep Python examples/docs only where they still provide product context
5. delete or archive Python installer paths only after Node installer parity is real

This avoids a confusing hybrid runtime and keeps the repo pivot legible.

## Confidence Notes

- **High confidence:** Node + TypeScript + npm package + `commander` + `zod` + `vitest` + `changesets` is the right v1 baseline. It matches the distribution channel and today’s stable tooling.
- **Medium confidence:** `@inquirer/prompts` is the right prompt layer. It is a pragmatic stability choice; if the team strongly prefers a different prompt UX, this is the easiest area to swap.
- **Medium confidence:** native Node file utilities should cover most needs. If cross-platform edge cases accumulate, add a narrowly-scoped helper library later rather than preloading one now.
- **High confidence:** the canonical-manifest-plus-adapters architecture is the critical product decision. It is what prevents assistant support from becoming duplicated template sprawl.

## Sources

- npm package `bin`: https://docs.npmjs.com/cli/v11/configuring-npm/package-json
- npm exec / `npx`: https://docs.npmjs.com/cli/v11/commands/npm-exec
- Node.js packages and ESM: https://nodejs.org/api/packages.html
- Node.js fs and glob APIs: https://nodejs.org/api/fs.html
- TypeScript module resolution for Node: https://www.typescriptlang.org/docs/handbook/modules/reference.html
- pnpm workspaces: https://pnpm.io/workspaces
- Commander: https://github.com/tj/commander.js
- Inquirer prompts: https://github.com/SBoudrias/Inquirer.js
- Zod JSON Schema: https://zod.dev/json-schema
- Vitest: https://vitest.dev/
- Changesets: https://github.com/changesets/changesets
- npm trusted publishing and OIDC: https://docs.npmjs.com/trusted-publishers
