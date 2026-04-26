# AGENTS.md — Forge

> Authoritative guide for AI coding assistants (Claude Code, Codex, Copilot, Gemini) working in this repo. `CLAUDE.md` imports this file via `@AGENTS.md`; edit here, not there.

## Purpose

Forge is a single CLI that installs read-only GitHub workflow plugins into multiple AI assistants from one plugin definition. The repo's job is to produce, validate, and ship those plugin definitions; the assistants execute `gh` and `git` at query time — Forge itself never runs an assistant-side runtime or proxies data.

## Key Rules

- **Define once, render to many.** Plugins are authored as a single assistant-agnostic `ForgePlugin` definition (`src/contracts/forge-plugin.ts`). Each assistant has an `AssistantAdapter` that renders that definition into its native format. When adding a capability, extend the shared definition first; never hand-author assistant-specific files.
- **Strictly read-only.** Installed assets must not create, update, close, comment on, or otherwise mutate any GitHub resource. Live-fetch only; no caching stale answers.
- **Direct `gh` execution.** The installed assets instruct the host assistant to use read-only `gh` commands directly. Do not reintroduce an assistant-side Node runtime, bundled binary, or `forge/dist` tree.
- **Managed blocks preserve user customizations.** Installed files use Forge-managed markers so a reinstall replaces only the managed block and leaves user edits around it intact. Never regenerate a whole file without respecting the marker format.
- **Follow the skill/agent addition checklist.** `docs/adding-skill-agent-template.md` is the required implementation checklist for any new summonable/skill/agent across assistant systems.
- **Conventional Commits.** `feat|fix|chore|docs|refactor|test|ci(<scope>): <subject>`. No co-author trailers.

## Invariants that must not be broken

1. **No bundled runtime.** `forge/bin`, `forge/dist`, `forge/node_modules`, `forge/VERSION`, `forge/package.json`, `forge-file-manifest.json` — all legacy artifacts are removed on install and must never return. If a capability seems to need one, rethink the plugin shape.
2. **All plugin IDs prefixed `forge-`.** The first segment is the Claude/Gemini namespace. Example: `forge-discussion-analyzer` → `forge:discussion-analyzer`.
3. **One source of truth per capability.** If two assistants appear to need different prose, the difference belongs in the adapter, not in diverging plugin definitions.
4. **CI-green before publish.** `npm run build && npm test` and `npx forge-ai-assist --assistants all --plugins all` (non-interactive install) must both succeed.

## Where to find the contract

- **Plugin contract:** `src/contracts/forge-plugin.ts`
- **Plugin definitions (single source of truth):** `src/services/assistants/summonables.ts`
- **Adapters:** `src/services/assistants/{claude,codex,copilot,gemini}.ts`
- **Adapter interface & registry:** `src/services/assistants/registry.ts`
- **Native renderers:** `src/services/assistants/runtime-rendering.ts`
- **Install service:** `src/services/assistants/install.ts`
- **Architecture doc:** `docs/plugin-architecture.md`
- **Adding a new plugin:** `docs/adding-skill-agent-template.md`
- **ADRs:** `docs/adr/` — read these before proposing architectural changes
- **Release process:** `docs/releasing.md`

## Commands an agent will typically run

```bash
npm install                  # once
npm run build                # tsc
npm test                     # vitest
npx forge-ai-assist@latest status   # sanity check of a local install
```
