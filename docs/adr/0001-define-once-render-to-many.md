---
id: ADR-0001
title: Plugin definitions are assistant-agnostic; adapters render per assistant
status: Accepted
date: 2026-04-17
---

## Context

Forge installs the same capability (e.g. a discussion analyzer) into four AI assistants with different native formats: Claude Code (Markdown commands + agents), GitHub Copilot (Markdown agents + skills), Gemini CLI (TOML commands + agents + workflows), and Codex (Markdown skill + agent MD/TOML + workflow). Every assistant keeps evolving its format, and we want one authored artifact per plugin, not four.

The forces:

- **Maintenance cost scales with N×M** (plugins × assistants) if every combination is hand-authored. Four assistants × seven plugins ≈ 28 artifacts to keep in sync.
- **Assistants evolve independently.** Copilot changing its skill format should not require rewriting discussion-analyzer content; only the renderer.
- **Capabilities must stay conceptually identical across assistants.** If "discussion-analyzer" means slightly different things in Claude vs. Codex, users get confused and bug reports are ambiguous.

## Options Considered

### Option A: Hand-author per assistant
Write Claude files, Copilot files, Gemini files, Codex files directly in the repo.
- **Pro:** trivially explicit; each file is what ships.
- **Con:** 4× edits for every prompt tweak; drift between assistants is inevitable.
- **Con:** format changes by any assistant trigger a sweep across all plugin copies.

### Option B: Shared plugin definition with per-assistant adapters (chosen)
Author each plugin once as a `ForgePlugin` in `src/contracts/forge-plugin.ts`. Each assistant has an `AssistantAdapter` that renders the definition into that assistant's native format at install time.
- **Pro:** single source of truth; prompt changes touch one file.
- **Pro:** assistant format changes are localized to one adapter.
- **Pro:** new assistants become a new adapter, not an N-plugin port.
- **Con:** adapters can diverge in subtle ways; requires end-to-end tests per assistant.

### Option C: Single universal prompt format
Pick a common denominator (e.g. plain Markdown) and write it once; let each assistant consume it as-is.
- **Pro:** no rendering step.
- **Con:** assistants want assistant-specific frontmatter, filename conventions, and directory layouts. A common denominator loses fidelity everywhere.

## Decision

**Option B.** Plugins are defined in `src/contracts/forge-plugin.ts` as an assistant-agnostic shape. `AssistantAdapter` implementations render that shape into the native format for each target.

Adding a new plugin means editing one definition. Adding a new assistant means writing one adapter. These two axes never multiply.

## Consequences

### Positive
- Prompt and capability changes converge to one file; no fan-out edits.
- Claude, Copilot, Gemini, and Codex all start from the same intent, so the user experience stays consistent.
- Onboarding a new assistant is bounded: implement one adapter; all plugins become available.

### Negative
- There is a rendering step to reason about when debugging assistant behavior.
- The shared definition must stay expressive enough to cover every assistant's needs without leaking assistant-specific concepts into the shared type.

### Risks
- **Lowest-common-denominator creep.** If the `ForgePlugin` contract is too narrow, an assistant's best rendering is compromised. Mitigate by extending the contract when a real capability needs it, rather than working around it in an adapter.
- **Silent drift between adapters.** Mitigated by install-time smoke tests (`npx forge-ai-assist --assistants all --plugins all`) and vitest coverage on each adapter.
