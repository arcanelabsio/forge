# Pitfalls For `npx forge-ai-assist@latest`

Date: 2026-03-02
Context: brownfield repository pivoting toward a project-local multi-assistant installer/scaffolder.

## Recommended Roadmap Phases

### Phase 1: Capability Matrix And Output Contract
Lock down which assistants, file formats, precedence rules, and install targets are actually supported in v1.

### Phase 2: Brownfield Detection And Safe Placement
Detect existing repo state, avoid destructive writes, and choose file locations that work in real repositories.

### Phase 3: Shared Core And Adapter Generation
Generate one canonical project definition, then emit assistant-specific files with explicit lossy mappings.

### Phase 4: Validation Harness And CI Smoke Tests
Prove generated files are discovered by each assistant path, do not conflict, and survive non-interactive automation.

### Phase 5: Upgrade, Drift, And Release Operations
Handle `@latest` churn, assistant ecosystem changes, migration prompts, and release discipline.

## Pitfalls

### 1. Pretending The Ecosystem Has One True Config Format

Warning signs:
- Early designs assume `AGENTS.md` can fully replace `CLAUDE.md`, `GEMINI.md`, and `.github/copilot-instructions.md`.
- Adapter generation is treated as file renaming instead of semantic translation.
- Users report that one assistant works while another ignores equivalent guidance.

Prevention strategy:
- Maintain an explicit capability matrix per assistant: supported file names, load scope, precedence, path sensitivity, and assistant-only features.
- Define a shared core schema with adapter-specific escape hatches instead of forcing a lowest-common-denominator format.
- Mark lossy conversions in generated output and in install summaries so maintainers know when one assistant needs native-only instructions.

Roadmap phase: Phase 1

### 2. Getting Instruction Discovery And Precedence Wrong

Warning signs:
- Generated files are placed in the repo root without validating whether that assistant actually reads them there.
- Nested workspaces, monorepos, or subdirectory launches produce inconsistent assistant behavior.
- Support requests mention "file exists but assistant did not load it."

Prevention strategy:
- Encode assistant-specific lookup rules in the installer and generator tests.
- Prefer placements backed by current docs, not community folklore.
- Print a post-install verification checklist that tells maintainers where each assistant should discover instructions from.
- Add a dry-run resolver that shows the expected load path for a given working directory.

Roadmap phase: Phase 2

### 3. Creating Conflicting Instruction Layers

Warning signs:
- The installer emits root instructions, nested instructions, and assistant-specific overrides without a clear precedence story.
- Copilot path-specific instructions and repo-wide instructions say different things.
- Generated files accumulate duplicate rules after repeated installs or upgrades.

Prevention strategy:
- Separate shared policy, path-scoped policy, and assistant-local notes into distinct generation stages.
- Run a conflict linter during install and upgrade to catch duplicate commands, contradictory coding rules, or overlapping scopes.
- Make regeneration idempotent and add ownership markers so the installer can update only what it owns.

Roadmap phase: Phase 3

### 4. Shipping Bloated Context Files That Reduce Adherence

Warning signs:
- Generated instruction files become mini-handbooks with setup prose, architecture essays, and repeated command lists.
- Maintainers start pasting large README sections into every assistant file.
- Users say assistants "know less" or follow instructions less reliably after regeneration.

Prevention strategy:
- Keep generated root instruction files short and task-oriented.
- Move detailed material into referenced docs where the assistant supports imports or on-demand reads.
- Add size budgets and warnings during generation, especially for assistants that treat instruction files as ordinary context rather than enforced config.

Roadmap phase: Phase 3

### 5. Leaking Secrets Or Personal Preferences Into Versioned Project Files

Warning signs:
- Install prompts ask for tokens, local URLs, or developer-specific paths and write them into tracked files.
- The scaffolder mixes team guidance with user-local preferences.
- Generated examples include `.env` contents, internal hosts, or sandbox endpoints.

Prevention strategy:
- Keep the project-local scaffold strictly team-safe and versionable by default.
- Route secrets, tokens, and personal preferences into local-only guidance, ignored files, or explicit "bring your own secret" placeholders.
- Add a secret scan and path sanity check before writing any generated file.

Roadmap phase: Phase 2

### 6. Assuming Interactive `npx` Flow Covers CI And Automation

Warning signs:
- Installer UX is polished for prompts, but flags for non-interactive setup are incomplete or ambiguous.
- Generated output differs between interactive and headless runs.
- Teams cannot reproduce installs in CI, devcontainers, or bootstrap scripts.

Prevention strategy:
- Treat non-interactive mode as a first-class interface from the start.
- Support deterministic flags, machine-readable summaries, exit codes, and lockable defaults.
- Add snapshot tests for the same install scenario run both interactively and non-interactively.

Roadmap phase: Phase 4

### 7. Breaking Brownfield Repositories With Unsafe Writes

Warning signs:
- The installer assumes empty directories or blindly creates `.github`, `.claude`, or root-level files.
- Existing assistant files are overwritten without merge previews.
- Re-running the installer creates churn in unrelated repo areas.

Prevention strategy:
- Detect pre-existing assistant artifacts and classify them as managed, user-authored, or ambiguous.
- Default to merge previews, backups, and explicit confirmation when the installer would touch non-owned files.
- Keep writes narrowly scoped and reversible, with a manifest of generated assets.

Roadmap phase: Phase 2

### 8. Ignoring Workspace-Root, Symlink, And Monorepo Edge Cases

Warning signs:
- Validation only covers a single-package repo opened at the root.
- Generated instructions rely on nested `AGENTS.md` or imported files without checking workspace-root limitations.
- Users in monorepos report that assistants read the wrong team instructions.

Prevention strategy:
- Test root repo, package subdir, nested workspace, and monorepo launch points.
- Avoid depending on discovery behaviors that are disabled by default in common tools.
- Offer explicit monorepo modes: single-root scaffold, per-package scaffold, or hybrid with declared boundaries.

Roadmap phase: Phase 4

### 9. Treating Security And Tool Permissions As Afterthoughts

Warning signs:
- Generated configs encourage broad shell access or internet access without explanation.
- MCP/tooling examples are copied into every assistant without threat modeling.
- Enterprise maintainers ask how to disable risky capabilities and the installer has no policy layer.

Prevention strategy:
- Make capability exposure explicit: shell, web, MCP, network, and write permissions should be opt-in where possible.
- Provide safe defaults and policy presets for personal, team, and enterprise usage.
- Document which parts of the scaffold are instructions only versus which ones enable real tool execution.

Roadmap phase: Phase 1

### 10. Underestimating Fast-Moving Vendor Drift

Warning signs:
- The design depends on undocumented behavior or preview-only features.
- `@latest` installs change generated output unexpectedly from week to week.
- Support volume rises after vendor docs, file names, or precedence behavior changes.

Prevention strategy:
- Back the scaffold with a versioned capability registry updated independently of installer code where practical.
- Track doc-backed assumptions with source links and a last-verified date.
- Add release gates that rerun compatibility fixtures against supported assistants before publishing a new `latest`.

Roadmap phase: Phase 5

### 11. Failing To Prove The Scaffold Actually Works End-To-End

Warning signs:
- Success is measured by files written, not by assistants loading and using them.
- There is no smoke test that launches each supported assistant against a fixture repo.
- Bug reports keep surfacing as "installer succeeded, assistant ignored the scaffold."

Prevention strategy:
- Define acceptance tests around observable behavior: discovery, precedence, no-conflict composition, and upgrade safety.
- Maintain fixture repos that cover empty repo, brownfield repo, monorepo, and partial-assistant installs.
- Add human-readable verification commands to the post-install summary so maintainers can confirm behavior immediately.

Roadmap phase: Phase 4

## Source Notes

- Anthropic Claude Code memory docs describe multiple `CLAUDE.md` locations, precedence, imports, subdirectory loading, and the fact that `CLAUDE.md` is context rather than strict enforcement: https://docs.anthropic.com/en/docs/claude-code/memory
- GitHub Copilot custom instruction docs describe repository-wide instructions, path-specific `.instructions.md`, nearest-`AGENTS.md` precedence, and VS Code workspace-root limitations: https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions
- OpenAI's Codex launch materials and the `AGENTS.md` spec reinforce that agent guidance works best with clear docs, reliable environments, and predictable project instructions: https://openai.com/index/introducing-codex/ and https://github.com/openai/agents.md
- Gemini CLI docs and repo materials confirm project context via `GEMINI.md`, automation use cases, and folder/security policy surfaces such as trusted folders and sandboxing: https://github.com/google-gemini/gemini-cli

## Implication For Forge

The installer should be treated less like a file copier and more like a compatibility layer with a testable contract. The main failure mode is not "can we write files," but "can we generate the smallest correct set of files that each assistant actually discovers, applies, and keeps safe in a brownfield repo."
