# Phase 7: Installer Simplification And GitHub Discussions Ingest - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning
**Source:** User direction in planning request

<domain>
## Phase Boundary

This phase revises Forge's current invocation and assistant-entry assumptions after the original v1 milestone closed.

The phase must:

- keep the npm package name as `forge-ai-assist`
- publish and present the runnable binary as `forge`
- make `npx forge-ai-assist@latest` immediately enter an interactive assistant-selection install flow
- remove the current user-facing command surface (`bootstrap`, `analyze`, `plan`, and install aliases) from the primary UX
- introduce a summonable skill or agent that fetches GitHub Discussions for the current repository remote and stores fetched artifacts under the Forge sidecar for later analysis prompts

The phase does not need to implement the downstream discussion-analysis logic yet. That prompt logic will be refined in a later phase.
</domain>

<decisions>
## Implementation Decisions

### Locked Decisions

- The package name remains `forge-ai-assist`.
- The binary invoked by npm/npx should be `forge`, not `forge-ai-assist`.
- The default `npx forge-ai-assist@latest` experience should be an interactive install prompt that lets the user choose assistants from a list.
- Existing explicit CLI commands are no longer required as part of the user-facing product surface.
- Bootstrap is no longer a required product concept.
- Forge is intended to be called through assistant environments such as Copilot, Codex, Claude, and Gemini.
- A new assistant-facing fetcher should retrieve GitHub Discussions from the repository's current Git remote and write them into the `.forge` sidecar directory.
- The fetched discussions are inputs for later assistant analysis, not the final user-facing output of this phase.
- The discussions workflow must check `GH_TOKEN` and `GITHUB_TOKEN` before calling GitHub.
- If both token variables are missing, Forge should tell the user to set one in their shell rather than attempting the fetch.
- The discussions workflow should support user-provided filters such as `today`, `yesterday`, `last week`, `after <date>`, `before <date>`, and category selection.

### Claude's Discretion

- Whether the default installer offers multi-select, single-select, or preset bundles as long as it is interactive and assistant-oriented
- Whether GitHub authentication is sourced from `gh`, `GITHUB_TOKEN`, or a layered fallback, as long as failure handling is explicit and sidecar-safe
- The exact sidecar artifact structure for discussions runs, as long as it supports reruns and later analysis
- Whether the GitHub Discussions fetch capability is installed for every assistant or a supported subset, as long as the supported behavior is explicit
- The exact filter grammar and normalization rules, as long as the supported relative and explicit date filters map deterministically into GitHub fetch bounds
</decisions>

<specifics>
## Specific Ideas

- The installer prompt should feel like the only public CLI entrypoint.
- The fetcher should resolve the repository identity from the current repo's `origin` remote instead of asking users to type `owner/repo`.
- The sidecar should retain fetched discussions as durable artifacts that a later analysis phase can consume without re-fetching.
- Missing-token handling should be explicit and actionable: tell the user to export `GH_TOKEN` or `GITHUB_TOKEN` in their shell.
- Filter support should include both natural shortcuts and explicit bounds so assistants can ask for "today", "yesterday", or exact date windows.
</specifics>

<deferred>
## Deferred Ideas

- Discussion summarization, prioritization, or plan generation from fetched threads
- Additional repository-hosting providers beyond GitHub
- Background syncing or continuous polling of discussions
</deferred>

---

*Phase: 07-installer-simplification-and-github-discussions-ingest*
*Context gathered: 2026-03-03 via direct user requirements*
