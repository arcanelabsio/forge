# Phase 11: Runtime Self-Sufficiency And Agent Discipline - Research

**Researched:** 2026-03-03
**Domain:** bundled runtime completeness, assistant execution prompts, Copilot agent fallback control
**Confidence:** MEDIUM-HIGH

## User Constraints

Using phase context from: `.planning/phases/11-runtime-self-sufficiency-and-agent-discipline/11-CONTEXT.md`

Locked constraints from the feedback:

- `npx forge-ai-assist@latest` should bake in dependency resolution so later runtime commands do not trigger manual installs
- approval should happen once, then the agent should proceed without repeated prompting for the same Forge-managed request
- the agent should clearly let Forge process the request instead of defaulting to direct `gh api graphql`

## Summary

The feedback log shows three distinct failures in the current design:

1. The bundled runtime under `~/.copilot/forge` is not actually dependency-complete
2. The Copilot agent is not disciplined enough about sticking to Forge once the user asks for the Forge analyzer
3. The approval model is too chatty because the agent treats each recovery step as a new action instead of one Forge-managed workflow

The runtime problem is the most concrete. Phase 10 copied `dist/` plus a tiny package manifest, but did not ensure the runtime's Node dependencies were present in `~/.copilot/forge`. That left the installed runtime looking self-contained while still failing at execution time. The fix likely requires one of these paths:

- copy a production `node_modules` payload into `~/.copilot/forge`
- bundle the CLI/runtime more aggressively so dependencies are compiled into fewer files
- or reduce runtime dependencies until the copied payload is sufficient

The agent-discipline problem is separate. Even after the user explicitly told Copilot to stick to `forge-discussion-analyzer`, the agent improvised direct `gh api graphql` behavior and repeated install attempts. The installed instructions need stronger routing:

- Forge is the processor for discussion-analysis requests
- direct GraphQL calls are fallback only when Forge is genuinely unavailable
- dependency repair is not something the agent should improvise after install unless explicitly asked

## Recommended Architecture

### Pattern 1: Truly self-sufficient bundled runtime

- Treat the `~/.copilot/forge` install as a runnable application, not just copied JS files
- Ensure runtime dependencies are available immediately after install
- Prefer install-time resolution over lazy repair during analysis

### Pattern 2: Single approval, then Forge owns the workflow

- The installed agent should request approval once for the Forge command path
- After approval, it should run the Forge fetch and analysis workflow without re-asking for every sub-step
- The instructions should frame fetch plus analysis as one Forge-owned action

### Pattern 3: Explicit anti-fallback guidance

- State that if the user selected `forge-discussion-analyzer`, the agent should not substitute direct `gh api graphql`
- Allow fallback only if Forge is unavailable after a clear, user-visible explanation
- Keep the agent from silently switching execution models mid-task

## Pitfalls To Avoid

- Do not leave runtime dependency completeness to a later repair step after install
- Do not tell the agent to never use approval prompts if the platform still requires one initial approval
- Do not allow "Forge failed once" to become justification for a totally different raw API workflow
- Do not make the feedback fix depend on project-local `npm install` or runtime mutation outside the Forge-owned subtree

## Validation Architecture

- Verify the installed runtime can execute a Forge command without any post-install `npm install`
- Verify the installed Copilot agent instructions reference Forge as the processor for discussion-analysis requests
- Verify the feedback scenario no longer produces raw `gh api graphql` fallback when Forge is available
- Verify one initial approval is enough for the intended Forge-managed command path

## Plan Shape Recommendation

Use three plans:

1. Make the bundled runtime dependency-complete at install time
2. Tighten Copilot agent instructions and one-approval flow
3. Reproduce the feedback scenario in verification and document the support model

## Source Notes

- Feedback log shows repeated `npm install` attempts under `~/.copilot/forge` and `~/.copilot/forge/dist`
- Feedback log also shows Copilot falling back to raw `gh api graphql` despite the user explicitly wanting `forge-discussion-analyzer`
