# Phase 1: Bootstrap CLI - Research

**Researched:** 2026-03-02
**Domain:** npm-distributed Node.js CLI bootstrap, Git repository guardrails, repo-local sidecar lifecycle
**Confidence:** HIGH

## User Constraints

No `CONTEXT.md` is present for this phase.

Locked constraints from roadmap, requirements, and prompt:

- Phase description: Establish the packaged entrypoint, repository guardrails, and sidecar lifecycle needed for every later flow.
- Must address: `INVK-01`, `INVK-04`, `SIDE-01`, `SIDE-02`, `SIDE-03`, `SIDE-04`, `DELV-01`
- Required invocation target: `npx forge-ai-assist@latest`
- Bootstrap must exit cleanly with an explicit user-facing message when invoked outside a Git repository
- Forge must create and reuse exactly one repo-local sidecar directory for all managed artifacts
- Re-runs must not duplicate artifact trees or corrupt metadata
- No v1 bootstrap flow may write to repository source files outside the Forge sidecar directory
- Project context: current repo has no root `package.json`, no TypeScript workspace, and only a nested Python scaffold under `forge/`

## Summary

Phase 1 should be planned as the point where this repository establishes its real product boundary: a root-level Node.js package published to npm with a single CLI binary, while the existing nested Python scaffold remains brownfield context rather than the runtime base. The current repo has no Node packaging at all, so this phase is not a small wrapper; it is the runtime and delivery pivot that later phases depend on.

The safest bootstrap shape is a thin CLI entrypoint that parses arguments, resolves repository context immediately, and then delegates sidecar creation and metadata handling to a dedicated service. Repository detection should rely on `git rev-parse`, not path heuristics. Sidecar writes should use one canonical directory plus atomic metadata replacement, because Node’s `writeFile()` docs explicitly warn against overlapping writes to the same file.

**Primary recommendation:** Make the repository root the canonical npm package root, publish one `forge-ai-assist` CLI binary from a root `package.json`, gate all repository flows with `git rev-parse`, and centralize all writes in one sidecar manager that performs atomic metadata updates.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js | 22.x LTS | Runtime for the published CLI | Matches the project research summary and provides stable modern ESM/fs/process APIs |
| TypeScript | 5.x | Source language for the CLI and internal services | Standard typed Node CLI stack; aligns with the project research summary |
| `commander` | current 2026 major | CLI parsing, help, version handling, subcommands | Mature, widely used Node CLI parser with strict parsing and strong help/version support |
| `zod` | current 2026 major | Validation for CLI options and sidecar metadata payloads | Standard TS runtime validation library; avoids hand-written metadata parsing |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `execa` | 9.x | Run Git commands with better cross-platform errors and process handling | Use for `git rev-parse` and later Git-backed repository operations |
| `vitest` | current 2026 major | Fast unit/smoke testing for Node CLI code | Use once Phase 5 adds automated coverage; do not block Phase 1 on full test infrastructure |
| Node built-ins (`node:fs/promises`, `node:path`) | Node 22 | Sidecar directory creation, atomic temp-file writes, path resolution | Default choice for filesystem work; no extra dependency needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `commander` | `yargs` | `yargs` is capable, but `commander` is simpler for a thin bootstrap CLI with strict parsing and conventional help/version output |
| `execa` | `node:child_process` directly | Built-ins work, but `execa` removes common quoting/error-handling friction for Git subprocesses |
| Root npm package | Nested package under `forge/` | Nested packaging preserves old structure but keeps the current cognitive split; root packaging is cleaner for `npx forge-ai-assist@latest` |

**Installation:**
```bash
npm install commander zod execa
npm install -D typescript @types/node vitest
```

## Architecture Patterns

### Recommended Project Structure
```text
/
├── package.json            # Published npm package boundary
├── tsconfig.json           # Strict TS config for the CLI/runtime
├── src/
│   ├── cli.ts              # Shebang entrypoint, parse args, print user-facing errors
│   ├── commands/           # Thin command handlers
│   ├── services/
│   │   ├── git.ts          # Git repo detection/root resolution
│   │   ├── sidecar.ts      # Sidecar pathing, creation, reuse, metadata lifecycle
│   │   └── metadata.ts     # Zod schemas and read/write helpers
│   └── types/
├── dist/                   # Built JS published to npm
├── forge/                  # Existing Python scaffold kept as brownfield context
└── .planning/
```

### Pattern 1: Thin Published Entrypoint
**What:** Keep the `bin` target minimal: parse CLI args, call one command handler, map expected errors to clear exit messages.
**When to use:** Always. The entrypoint should not own repository logic or sidecar persistence.
**Example:**
```json
// Source: https://docs.npmjs.com/cli/v11/configuring-npm/package-json
{
  "name": "forge-ai-assist",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "forge-ai-assist": "./dist/cli.js"
  },
  "files": [
    "dist"
  ]
}
```

### Pattern 2: Guard Repository Context Before Any Side Effects
**What:** Resolve repository root first with Git, and fail before creating sidecar state if the current command requires a repository.
**When to use:** For every repository-analysis or planning flow.
**Example:**
```ts
// Source: https://git-scm.com/docs/git-rev-parse/2.23.0
import { execa } from "execa";

export async function resolveRepoRoot(cwd: string): Promise<string> {
  const inside = await execa("git", ["rev-parse", "--is-inside-work-tree"], { cwd });
  if (inside.stdout.trim() !== "true") {
    throw new Error("Forge requires a Git repository for this command.");
  }

  const root = await execa("git", ["rev-parse", "--show-toplevel"], { cwd });
  return root.stdout.trim();
}
```

### Pattern 3: Single Sidecar Directory With Atomic Metadata Writes
**What:** Create one canonical sidecar directory under the repo root and update metadata through temp-file + rename replacement.
**When to use:** Any time Forge records run history, manifest state, or generated output indexes.
**Example:**
```ts
// Source: https://nodejs.org/download/release/v22.10.0/docs/api/fs.html
import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export async function writeJsonAtomic(filePath: string, data: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.tmp`;
  await writeFile(tempPath, data, "utf8");
  await rename(tempPath, filePath);
}
```

### Anti-Patterns to Avoid

- **Mixing bootstrap and business logic:** Do not let `cli.ts` discover repos, compute sidecar paths, and manage metadata directly.
- **Path-based Git guessing:** Do not infer a repo by looking for `.git` directories manually; use Git itself.
- **Editing `.gitignore` in v1 bootstrap:** Requirement `SIDE-02` and the roadmap success criteria make repo-file edits out of scope for this phase.
- **Multiple sidecar roots:** Do not create per-command or per-run directories at the top level; Phase 1 must establish exactly one canonical root.
- **In-place metadata overwrite with concurrent callers:** Avoid naive repeated `writeFile()` to the same metadata file.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CLI argument parsing/help | Custom `process.argv` parser | `commander` | Help/version/error behavior is already solved well |
| Runtime payload validation | Manual object shape checks | `zod` | Metadata and CLI option schemas will grow; runtime validation must stay explicit |
| Git repo detection | Directory walking for `.git` | `git rev-parse` via `execa` | Correct for subdirectories and worktrees; avoids false positives |
| Package publish contents | Ad hoc publish assumptions | `package.json#files` plus `npm pack` verification | npm has specific include/exclude rules; verify the actual tarball |

**Key insight:** The risky work in this phase is not business logic. It is getting packaging, repository detection, and idempotent state writes correct across reruns and environments. Use ecosystem primitives for those concerns.

## Common Pitfalls

### Pitfall 1: `npx` Cannot Infer the Right Binary
**What goes wrong:** `npx forge-ai-assist@latest` fails or launches the wrong executable.
**Why it happens:** npm infers the binary from `package.json#bin`; multi-bin packages have extra inference rules.
**How to avoid:** Publish exactly one primary `bin` entry matching the package name, or one unambiguous bin mapping.
**Warning signs:** Local `npm pack` works, but `npx ./package.tgz --help` or installed-bin tests fail.

### Pitfall 2: False “Not a Git Repo” Results
**What goes wrong:** Running from a nested directory or worktree incorrectly fails the repo guard.
**Why it happens:** Manual `.git` checks do not cover worktrees and subdirectory invocation.
**How to avoid:** Use `git rev-parse --is-inside-work-tree` and `--show-toplevel`.
**Warning signs:** Root invocation works, subdirectory invocation fails.

### Pitfall 3: Sidecar Metadata Corruption On Rerun
**What goes wrong:** Repeated runs leave partial JSON or duplicated state.
**Why it happens:** Multiple writes target the same file directly; write operations overlap or crash mid-write.
**How to avoid:** Use temp-file writes plus atomic rename; keep one metadata schema and version field.
**Warning signs:** Zero-byte metadata files, malformed JSON, per-run directories multiplying unexpectedly.

### Pitfall 4: Accidental Repository Mutation
**What goes wrong:** Bootstrap touches `.gitignore`, assistant config, or source files outside the sidecar.
**Why it happens:** “Helpful” install behavior expands past the v1 boundary.
**How to avoid:** Treat the sidecar as the only writable surface in Phase 1; emit guidance instead of editing user files.
**Warning signs:** Any planned task requires writes outside the sidecar before Phase 4.

### Pitfall 5: Keeping The Old Nested Package Boundary
**What goes wrong:** The repo ends up with two competing runtime roots: the old nested Python package and the new CLI package.
**Why it happens:** Planning optimizes for minimum edits instead of clean product boundaries.
**How to avoid:** Make the repo root the npm package boundary now; leave the nested `forge/` directory as legacy content until a later cleanup phase.
**Warning signs:** Build scripts run from `forge/`, publish config points into nested paths, or README commands require `cd` gymnastics.

## Code Examples

Verified patterns from official sources:

### Package Binary Mapping
```json
// Source: https://docs.npmjs.com/cli/v11/configuring-npm/package-json
{
  "bin": {
    "forge-ai-assist": "./dist/cli.js"
  }
}
```

### Shebang CLI Entrypoint
```ts
#!/usr/bin/env node
// Source: https://docs.npmjs.com/cli/v11/configuring-npm/package-json
import { Command } from "commander";

const program = new Command();

program
  .name("forge-ai-assist")
  .description("Forge AI Assist CLI")
  .version("0.1.0");

await program.parseAsync();
```

### Strict Local Command Object
```ts
// Source: https://github.com/tj/commander.js
import { Command } from "commander";

export function buildProgram(): Command {
  return new Command("forge-ai-assist");
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Repository-local scripts or examples as the only entrypoint | Published npm package with explicit `bin` consumed via `npx` | Standard npm CLI practice; current npm v11 docs | Phase 1 must ship a real package boundary, not another local script |
| Manual repo-root/path heuristics | Git-native repo detection with `rev-parse` | Long-standing Git standard, still current in docs | More reliable handling for nested invocation and worktrees |
| Direct overwrite of JSON state files | Atomic temp-file + rename replacement | Current Node fs docs emphasize write concurrency hazards | Prevents sidecar metadata corruption on rerun/crash |
| Ad hoc package publish assumptions | `files` allowlist plus `npm pack` validation | Current npm docs | Planner should include tarball verification before claiming `npx` readiness |

**Deprecated/outdated:**

- Treating the nested Python scaffold as the natural packaging root for the product: outdated for the v1 roadmap, which explicitly requires an npm CLI.
- Planning bootstrap tasks around editing host-repo files like `.gitignore`: incompatible with the Phase 1 success criteria and `SIDE-02`.

## Open Questions

1. **Is `forge-ai-assist` available as an npm package name?**
   - What we know: The requirement hard-codes `npx forge-ai-assist@latest`, but this research did not find an authoritative npm package page for that exact name.
   - What's unclear: Whether the unscoped package name is available to publish.
   - Recommendation: Validate package-name availability before implementation starts; if unavailable, resolve the naming/product requirement conflict immediately.

2. **What is the canonical sidecar directory name?**
   - What we know: Requirements demand exactly one Forge-owned ignorable directory, but no name is locked in planning docs.
   - What's unclear: Whether to use `.forge`, `.forge-ai-assist`, or another name.
   - Recommendation: Decide the name during planning and treat it as a stable public contract for later phases.

3. **How much of the current Python scaffold remains in the short term?**
   - What we know: The nested `forge/` project is the only implemented runtime today, but it does not satisfy the v1 npm delivery model.
   - What's unclear: Whether Phase 1 should merely add the Node CLI or also begin de-emphasizing the Python scaffold in docs and packaging.
   - Recommendation: Plan Phase 1 to establish the Node root package first; any Python cleanup can be follow-on work unless it blocks publishability or user clarity.

## Sources

### Primary (HIGH confidence)
- https://docs.npmjs.com/cli/v11/configuring-npm/package-json - checked `bin`, `files`, and publish inclusion behavior
- https://docs.npmjs.com/creating-a-package-json-file/ - checked required package metadata fields for publishable npm packages
- https://docs.npmjs.com/cli/v7/commands/npx/ - checked how `npx` infers which package binary to run
- https://git-scm.com/docs/git-rev-parse/2.23.0 - checked `--is-inside-work-tree` and `--show-toplevel`
- https://nodejs.org/download/release/v22.10.0/docs/api/fs.html - checked `fsPromises.writeFile()` caveats and filesystem API behavior
- https://github.com/tj/commander.js - checked current CLI parser patterns, local `Command` usage, help/version conventions
- https://zod.dev/ - checked current runtime validation guidance for TypeScript projects
- https://github.com/sindresorhus/execa - checked current process-execution capabilities and current maintained major version

### Secondary (MEDIUM confidence)
- Local project planning/codebase documents listed in the prompt - used to align recommendations to current repo shape and roadmap constraints

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - npm/Git/Node docs and current project research summary agree on the stack direction
- Architecture: HIGH - strongly constrained by roadmap requirements and by the current absence of any Node package boundary
- Pitfalls: HIGH - directly grounded in official npm/Git/Node docs plus concrete repo shape risks

**Research date:** 2026-03-02
**Valid until:** 2026-04-01
