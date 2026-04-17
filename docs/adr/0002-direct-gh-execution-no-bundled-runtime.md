---
id: ADR-0002
title: Installed assets call `gh` directly; Forge ships no assistant-side runtime
status: Accepted
date: 2026-04-17
---

## Context

An earlier Forge release shipped a bundled assistant-side Node runtime (`forge/bin`, `forge/dist`, `forge/node_modules`, `forge/VERSION`, `forge/package.json`, `forge-file-manifest.json`). The assistant would invoke Forge-provided binaries, which in turn called `gh` and transformed results before returning them to the assistant.

Why we moved off that:

- **Supply chain surface.** Every bundled runtime is code the user didn't audit, installed into their assistant's working directory. Legitimate complaints in the security model.
- **Version skew.** The bundled runtime could drift from the user's system `gh`, producing results different from what the user would get at the terminal.
- **Startup tax.** Loading a Node runtime per-invocation adds latency that matters on an interactive assistant prompt.
- **Debug opacity.** If the assistant's answer was wrong, was it the prompt? The runtime? The `gh` call? Three layers to triage.

## Options Considered

### Option A: Keep the bundled runtime
- **Pro:** tight control over output shape.
- **Con:** all the problems above; plus a Node version we now have to maintain in user environments.

### Option B: Direct `gh` and `git` execution from the assistant (chosen)
Installed assets instruct the host assistant to call read-only `gh` / `git` commands directly in the user's current repo. Forge ships no runtime. The assistant reads the `gh` output and interprets it using the prompt.
- **Pro:** zero supply chain beyond what the user already trusts (`gh`, `git`).
- **Pro:** results match what the user would see at the terminal; no version skew.
- **Pro:** debugging is one layer — the `gh` command the assistant ran is visible in its tool-use log.
- **Pro:** fully read-only at the tool layer; no mutation path exists.
- **Con:** we cannot pre-process or cache; every answer is a live fetch.
- **Con:** shared post-processing logic across plugins would have to live in the prompt itself.

### Option C: Server-side proxy
Forge runs a proxy the assistant queries over HTTP.
- **Pro:** central processing; cacheable.
- **Con:** violates the local-first, BYO-AI posture. Not considered beyond naming it.

## Decision

**Option B.** The assistant calls `gh api`, `gh issue view`, `gh pr list`, etc. directly. Forge's install step places prompt files that teach the assistant which commands to run and how to interpret the JSON. No Forge binary executes at query time.

Reinstalls must clean up the legacy runtime artifacts (`forge/bin`, `forge/dist`, `forge/node_modules`, `forge/VERSION`, `forge/package.json`, `forge-file-manifest.json`) so upgraded users don't keep a dormant runtime around.

## Consequences

### Positive
- Zero new supply chain installed into the assistant environment.
- Answers are live-fetched; staleness is impossible.
- The entire query path is auditable with the assistant's own tool-use log.
- Install size drops dramatically.

### Negative
- No caching. High-frequency queries repeat `gh` calls; rate-limiting is a real concern for heavy users.
- Cross-plugin shared logic has to be expressed in the prompt (or re-stated per plugin).

### Risks
- **`gh` CLI incompatibility.** A breaking change in `gh` flags propagates directly. Mitigated by pinning documented flags in the plugin prompts and CI-smoking against a recent `gh`.
- **Prompt-only enforcement of read-only.** Nothing technically stops an assistant from running a mutating `gh` command; we rely on prompt discipline. Mitigated by listing only read-only commands in each plugin's instructions and by the AGENTS.md invariant forbidding writes.
