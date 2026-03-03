# Phase 11 UAT

## Scenario

Validate the feedback reported on March 3, 2026:

- `npx forge-ai-assist@latest` should install a ready-to-run runtime under `~/.copilot`
- Copilot should only discover `forge-discussion-analyzer`
- the installed runtime should not require manual `npm install`
- the installed agent should route analysis through Forge and not default to raw `gh api graphql`

## Checks

1. Run `npx forge-ai-assist@latest` on a machine with no existing `~/.copilot/agents` directory.
2. Confirm `~/.copilot/agents/forge-discussion-analyzer.agent.md` exists.
3. Confirm `~/.copilot/agents/forge-agent.agent.md` does not exist after install or reinstall.
4. Confirm `~/.copilot/forge/node_modules` exists.
5. Run `node "$HOME/.copilot/forge/bin/forge.mjs" --help` and verify it succeeds without any dependency repair step.
6. Open Copilot, select `/agent`, choose `forge-discussion-analyzer`, and ask a GitHub Discussions question.
7. Verify Copilot asks for the Forge command path once, then continues through Forge instead of proposing `npm install` or `gh api graphql`.

## Expected Result

The installed runtime is self-sufficient immediately after install, the only public Copilot agent is `forge-discussion-analyzer`, and Copilot stays inside the Forge-managed workflow for discussion analysis.
