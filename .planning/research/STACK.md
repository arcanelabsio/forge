# Standard Stack

## Recommendation

Build Forge AI Assist as a Node-first TypeScript CLI published to npm and executed via `npx forge-ai-assist@latest`. The legacy Python scaffold has been removed, and the repository is now a dedicated Node.js/TypeScript project.

**Prescriptive default stack**

| Area | Use | Why | Confidence |
|---|---|---|---|
| Runtime | Node.js 22 LTS minimum, validate on Node 22 and Node 24 | `npx` distribution is npm-native, Node 22+ gives modern `fs`, `glob`, and ESM behavior without polyfill-heavy baggage | High |
| Language | TypeScript 5.x in ESM mode (`module: NodeNext`) | Best fit for npm CLI packaging, strong typing for manifest and adapter generation, easy contributor onboarding | High |
| Package manager for development | npm | Standard for Node.js projects; publish package itself to npm | High |
| Published package shape | Single public package: `forge-ai-assist` with a `bin` entry | Keeps `npx forge-ai-assist@latest` simple and stable | High |
| CLI framework | `commander` | Mature, stable, predictable help/flags/subcommands, low abstraction cost | High |
| Interactive prompts | `@inquirer/prompts` | Stable prompt primitives without betting v1 on newer prompt stacks | Medium |
| Validation | `zod` for all installer input and manifest validation | Typed runtime validation and JSON Schema export from one source of truth | High |
| File ops | Node built-ins (`fs/promises`, `fs.cp`, `path`, native `glob`) plus `execa` only for controlled git/npm calls | Reduce dependency surface; only use subprocess wrapper where it adds real value | High |
| Generation model | Canonical manifest + adapter generators + versioned templates | Centralizes product logic and avoids hand-maintaining assistant-specific file trees | High |
| Templates | Plain text template files plus small transformer functions; avoid JSX/template DSLs | Easier diffing, testing, and assistant-specific overrides | High |
| Tests | Node.js native `test` runner or Vitest | Fast unit coverage plus real packaged-installer verification | High |
| Lint/format | `eslint` + `@typescript-eslint` + `prettier` | Boring and standard; optimize for maintainer familiarity | High |
| Release management | `changesets` + npm trusted publishing | Standard npm release flow, changelog/version automation, no long-lived publish tokens | High |
| CI | GitHub Actions matrix on Node 22 and 24 | Matches supported runtime contract and npm publish path | High |

## Packaging And Runtime Choices

Use a normal npm CLI package. The product is fundamentally npm-distributed, so the implementation lives where package install, auth, cache, and `bin` resolution already work.

Use ESM-first TypeScript and compile to `dist/` for publish. Do not ship raw TypeScript to users.

## CLI Approach

Use `commander` with explicit subcommands, typed option parsing, and a thin command layer:

- `bootstrap` for initial repository setup
- `init` (planned) for interactive and non-interactive install
- `doctor` (planned) for validation, drift checks, and upgrade hints

## Manifest And Generation Approach (Planned)

Do not model the product as "copy one folder per assistant." Model it as:

1. Canonical repository manifest
2. Normalized install plan
3. Assistant adapter generators
4. File writer with merge/update rules

## Suggested Internal Layout

```text
src/
  commands/
  services/
  lib/
  config/
dist/
.forge/
```

## Testing And Tooling

Use three test layers:

1. Unit tests for manifest parsing, assistant selection rules, merge logic, and repo detection
2. Fixture tests that snapshot generated output for representative repos
3. End-to-end smoke tests that run the packed npm tarball in temp repositories

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

## Brownfield Migration Progress

The transition from the legacy Python scaffold to the Node.js/TypeScript foundation is complete:

1. Node workspace and npm package established at repo root.
2. Installer core and initial `bootstrap` command implemented.
3. Legacy Python scaffold and associated references removed.
4. Repositories documents updated to reflect the new TypeScript-first reality.

## Sources

- npm package `bin`: https://docs.npmjs.com/cli/v11/configuring-npm/package-json
- npm exec / `npx`: https://docs.npmjs.com/cli/v11/commands/npm-exec
- Node.js packages and ESM: https://nodejs.org/api/packages.html
- Node.js fs and glob APIs: https://nodejs.org/api/fs.html
- TypeScript module resolution for Node: https://www.typescriptlang.org/docs/handbook/modules/reference.html
- Commander: https://github.com/tj/commander.js
- Inquirer prompts: https://github.com/SBoudrias/Inquirer.js
- Zod JSON Schema: https://zod.dev/json-schema
- Changesets: https://github.com/changesets/changesets
- npm trusted publishing and OIDC: https://docs.npmjs.com/trusted-publishers
