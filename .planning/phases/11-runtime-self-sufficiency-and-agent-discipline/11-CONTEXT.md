# Phase 11: Runtime Self-Sufficiency And Agent Discipline - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning
**Source:** User feedback log from target-system usage

<domain>
## Phase Boundary

This phase addresses post-install runtime friction observed on a target system after the new global `~/.copilot` runtime was installed.

The phase must:

- prevent the installed Forge runtime from needing follow-on `npm install` steps after `npx forge-ai-assist@latest`
- reduce approval prompts so the user grants permission once and Forge handles the rest of the request flow
- make the installed Copilot agents explicitly prefer Forge as the executor for discussion-analysis requests
- prevent the agent from falling back to direct `gh api graphql` workflows when the request is supposed to stay inside Forge

This phase is about runtime completeness and agent behavior discipline, not about broadening assistant scope or changing the global `~/.copilot` install model.
</domain>

<decisions>
## Implementation Decisions

### Locked Decisions

- The bundled runtime should resolve its own dependencies during the initial `npx forge-ai-assist@latest` install.
- The user should approve once, then the agent should move forward without repeated prompts for the same Forge-managed request.
- The agent should clearly hand the request to Forge instead of deciding to perform raw GitHub GraphQL calls on its own.
- Copilot remains the only exposed assistant target in v1.

### Claude's Discretion

- Whether dependency completeness is achieved by shipping a more complete runtime payload, pruning runtime dependencies, or both
- How to encode one-approval behavior in the installed agent instructions without misrepresenting actual sandbox limits
- The exact phrasing and guardrails needed to discourage `gh api graphql` fallback while still handling true Forge-unavailable edge cases
- Whether to add explicit troubleshooting output for runtime-missing or dependency-missing states after install
</decisions>

<specifics>
## Specific Ideas

- Install any required package metadata and node_modules content under `~/.copilot/forge` during the initial install so the runtime can execute immediately
- Tighten the Copilot agent instructions to say that Forge is the processor for GitHub Discussions requests and that direct `gh api graphql` fallback is not the default path
- Add wording that the agent should ask for tool approval once, then use the approved Forge path for fetch plus analysis rather than prompting repeatedly
- Add a verification fixture that mirrors the feedback log and checks for absence of ad hoc `npm install` and raw GraphQL fallback behavior
</specifics>

<deferred>
## Deferred Ideas

- Hosted background updates of the installed runtime under `~/.copilot`
- Richer approval-state coordination across different assistant platforms
- Non-Copilot policy tuning for the same discipline rules
</deferred>

---

*Phase: 11-runtime-self-sufficiency-and-agent-discipline*
*Context gathered: 2026-03-03 from target-system feedback and direct user guidance*
