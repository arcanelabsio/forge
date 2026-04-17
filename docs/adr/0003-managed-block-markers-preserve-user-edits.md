---
id: ADR-0003
title: Installs use managed-block markers to preserve user customizations on reinstall
status: Accepted
date: 2026-04-17
---

## Context

Forge installs prompt files into each assistant's config directory (e.g. `~/.claude/commands/`, Copilot skill directories, etc.). Users often customize these files — tweak tone, add repo-specific notes, rename commands — between Forge releases. On reinstall, Forge must replace what it manages without clobbering what the user has added.

The default of "overwrite the whole file" is hostile to power users. The default of "refuse to touch an existing file" stales the plugin.

## Options Considered

### Option A: Overwrite wholesale
- **Pro:** simplest install logic.
- **Con:** user customizations disappear on every upgrade; upgrades feel dangerous.

### Option B: Refuse to overwrite if file exists
- **Pro:** safe for user edits.
- **Con:** plugin improvements never reach users who installed once; a stale file that the user forgot about silently blocks every future fix.

### Option C: Managed-block markers (chosen)
Installed files carry explicit `<!-- forge:managed:begin ... -->` / `<!-- forge:managed:end ... -->` markers. Forge only replaces content inside the markers on reinstall. Anything the user wrote outside is preserved verbatim.
- **Pro:** upgrade-safe and customization-safe.
- **Pro:** the boundary between "Forge owns this" and "user owns this" is visible in the file itself.
- **Con:** users editing inside the block lose edits on upgrade. This is stated in the plugin docs.
- **Con:** the install step has to parse and splice files, not just write them.

## Decision

**Option C.** Every Forge-installed file uses a named managed block. The install service reads existing files, replaces the named block with the current managed content, and writes. Files without a block are treated as legacy and replaced — with a log line noting the replacement. The boundary is intentional: the block is Forge's; everything outside it is the user's.

Associated rule: reinstalls also remove the legacy runtime artifacts listed in ADR-0002 (`forge/bin`, `forge/dist`, etc.) so a user upgrading from a bundled-runtime version gets a clean state.

## Consequences

### Positive
- Users can confidently upgrade; their customizations survive.
- The expected edit surface is explicit in the file — no hidden "don't touch this line or else."
- Enables iterative plugin improvements to ship to existing users without asking them to uninstall and reinstall.

### Negative
- Install logic is more involved than a simple write; bugs in the splicer can corrupt user files.
- Managed block contents are opaque to the user; they must trust Forge to keep them in sync with the declared capability.

### Risks
- **Marker-format drift.** If the marker syntax changes between releases, old installs won't be recognized. Mitigated by treating the current format as a long-term stable contract; any change ships with a backward-compatible read path.
- **Assistants that don't allow HTML comments.** Some native formats (e.g. TOML) need an alternate marker convention. Each adapter owns the marker format appropriate to its target.
