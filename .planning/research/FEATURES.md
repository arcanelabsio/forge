# Expected Feature Set for `npx forge-ai-assist@latest`

_Research date: 2026-03-02_

## Framing

The expected v1 product is a repo-local installer/scaffolder for AI coding assistants, not a hosted control plane. The market baseline is now clear across official assistant surfaces:

- Claude Code supports repo-scoped `CLAUDE.md`, slash commands, hooks, settings, and MCP configuration.
- GitHub Copilot supports repository custom instructions and prompt files, with coding-agent customization expanding the same pattern.
- Codex supports repo-local `AGENTS.md` instructions and CLI/config-driven local behavior.
- Gemini CLI supports repo-local `GEMINI.md`, settings, and MCP/server-oriented extension points.

That means users will expect `forge-ai-assist` to generate portable repository guidance plus assistant-native adapter files, while avoiding lock-in to any one runtime.

## Recommendation Summary

Bias v1 toward a layered generation model:

1. Generate one shared project definition as the source of truth.
2. Compile that definition into assistant-native files.
3. Keep outputs human-readable and safely versioned in-repo.
4. Add optional integrations only where the target assistant has a stable local surface.

## Table Stakes

| Feature | Why it is expected | Complexity | Dependencies / Notes |
|---|---|---:|---|
| Interactive installer via `npx forge-ai-assist@latest` | This is the explicit product entrypoint and matches the expectation set by modern repo bootstrap tools. | Medium | Node-based CLI packaging, prompt library, filesystem writer, idempotent reruns. |
| Non-interactive flags for CI/bootstrap automation | Maintainers expect automation after the first interactive run. | Medium | CLI arg parsing, defaults, `--yes`, `--assistants`, `--path`, `--dry-run`, `--force` style semantics. |
| Repo detection and safe install modes | Brownfield repos need detection of Git root, existing assistant files, monorepo layout, and overwrite policy. | Medium | Git/worktree detection, path probing, conflict prompts, backup or merge strategy. |
| Shared core definition as source of truth | Without a canonical core, every assistant config becomes duplicated drift. | High | Internal schema, versioning, renderer pipeline, migration support. |
| Generation of native instruction files for major assistants | Users will expect first-run support for `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, and Copilot prompt/instruction files. | High | Per-assistant renderers; output locations must follow each assistant’s current conventions. |
| Idempotent re-run / update behavior | Installers are judged heavily on whether they can be rerun without trashing local edits. | High | File fingerprinting, ownership markers, merge boundaries, explicit “managed vs user-owned” regions. |
| Clear preview before write | Maintainership workflows expect a diff or plan before mutation. | Medium | Dry-run renderer, change summary, exit codes. |
| Versioned generated output | Repos need stable committed artifacts, not ephemeral per-user state. | Low | `.gitignore` guidance, deterministic rendering, newline/format consistency. |
| Assistant selection matrix | Not every repo wants every assistant; selective install is mandatory. | Low | Prompt flow and CLI flags; optional future presets by team profile. |
| Portable defaults for prompts/instructions | The installer should ship useful defaults immediately, even before deep customization. | Medium | Curated templates, concise best-practice instruction packs, language/framework conditional blocks. |
| Basic uninstall or cleanup path | Scaffolding tools are expected to reverse managed artifacts. | Medium | Managed-file registry or markers, conservative deletion rules. |

## Differentiators

| Feature | Why it matters | Complexity | Dependencies / Notes |
|---|---|---:|---|
| Cross-assistant compilation from one domain model | This is the strongest strategic differentiator: one repo policy rendered into multiple assistant-native formats. | High | Carefully designed intermediate schema; renderer contract tests. |
| Capability-aware generation | Different assistants support different concepts. Compile only what each runtime can express rather than forcing lowest-common-denominator output. | High | Feature matrix per assistant: instructions, commands, hooks, MCP, prompt files, settings. |
| Monorepo-aware scaffolding | Large brownfield repos often need root-level and package-level guidance with inheritance or path scoping. | High | Workspace detection for npm/pnpm/turbo, Python, mixed repos; path targeting rules. |
| Existing-file adoption mode | Strong UX win if the installer can detect current `CLAUDE.md`/`AGENTS.md`/etc. and import or wrap them instead of replacing them. | High | Parsers or boundary markers; human-review-first merge behavior. |
| Optional command pack generation | Claude slash commands and similar assistant task presets are an obvious productivity layer beyond plain instructions. | Medium | Assistant-specific template libraries; command naming conventions. |
| Optional MCP bootstrap | Users increasingly expect AI repo tooling to help wire MCP servers where supported. | High | Stable per-assistant MCP surface, local config templates, security-sensitive defaults. |
| Language/framework presets | Expected by maintainers who want “Python library”, “Next.js app”, or “polyrepo backend” presets instead of blank templates. | Medium | Detect stack or let user choose; preset library maintenance. |
| Policy tiers | Teams want strict, balanced, or lightweight instruction profiles rather than editing long files manually. | Medium | Template inheritance and config flags. |
| Verification command | A `forge-ai-assist verify` that checks required files, malformed configs, and assistant support status reduces support cost. | Medium | Schema validation, file presence checks, version markers. |
| Upgrade/migration engine | As assistant surfaces evolve, migrations become a differentiator over one-shot generators. | High | Generator version stamps, migration framework, changelog-aware transforms. |
| Extensible adapter architecture for “similar assistants” | Future-proofing matters because assistant surfaces are changing rapidly. | High | Plugin contract, test fixtures, stable core schema. |

## Anti-Features

| Anti-feature | Why to avoid it | Complexity avoided | Dependencies / Notes |
|---|---|---:|---|
| Full hosted registry or cloud sync in v1 | Not required to prove installer value; adds infrastructure and account complexity too early. | Very High | Keep templates local/package-bundled first. |
| Per-assistant bespoke authoring as the primary UX | This recreates the fragmentation the product is supposed to remove. | High | Native escape hatches are fine; core-first authoring should remain default. |
| Aggressive auto-overwrite of existing repo files | High trust risk in brownfield repos. | Medium | Prefer preview, merge boundaries, or write-to-new-file review flows. |
| Mandatory background telemetry | Likely to create adoption friction for maintainers evaluating a repo tool. | Medium | If analytics exist later, keep opt-in and minimal. |
| Heavy daemon/background service requirement | Installer/scaffolder value should not depend on a long-running local process. | High | Favor static generated artifacts plus optional commands. |
| Overpromising parity across all assistants | The surfaces are genuinely different; promising identical behavior will fail. | Medium | Be explicit about capability differences. |
| Embedding secrets or auth bootstrap into generated files | Repo-local scaffolding should never normalize unsafe secret handling. | Medium | Generate placeholders and docs only. |
| Runtime-specific workflow engines in v1 | Planning/execution orchestration is outside the milestone and would blur the product. | High | Stay focused on install, scaffold, verify, update. |
| Deep AST codemods of application code during install | Repo owners expect config scaffolding, not invasive source rewrites. | High | Limit to support files and opt-in lightweight docs/config updates. |

## Practical v1 Scope

The smallest credible v1 is:

1. `npx` installer with interactive and non-interactive modes.
2. Shared core definition stored in-repo.
3. Generated adapters for Claude, Copilot, Codex, and Gemini.
4. Safe rerun/update behavior with preview.
5. Basic verify/uninstall commands.

Everything else should be judged by whether it strengthens the core promise of one setup flow producing immediately usable repo-local assistant support.

## Dependency Notes

- Node/TypeScript CLI is the practical distribution layer because the entrypoint is `npx`.
- A renderer architecture is required early; hardcoding file generation directly into prompts will not scale.
- Per-assistant fixture tests are necessary because the highest product risk is silent drift in native file formats and locations.
- MCP should stay optional until each assistant target has a stable enough local configuration surface to justify first-class generation.

## Sources

- Anthropic Claude Code docs: https://docs.anthropic.com/en/docs/claude-code
- Anthropic Claude Code settings: https://docs.anthropic.com/en/docs/claude-code/settings
- Anthropic Claude Code memory / `CLAUDE.md`: https://docs.anthropic.com/en/docs/claude-code/memory
- Anthropic Claude Code slash commands: https://docs.anthropic.com/en/docs/claude-code/slash-commands
- GitHub Copilot custom repository instructions: https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot
- GitHub Copilot prompt files: https://docs.github.com/en/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot#creating-prompt-files
- GitHub Copilot coding agent customization: https://docs.github.com/en/copilot/customizing-copilot/customizing-github-copilot-coding-agent
- OpenAI Codex CLI repository: https://github.com/openai/codex
- Gemini CLI repository: https://github.com/google-gemini/gemini-cli
