# 11-02 Summary

Wave 2 tightened the installed Copilot guidance so Forge remains the processor for discussion analysis.

- `src/services/assistants/summonables.ts` now installs only `forge-discussion-analyzer` for Copilot.
- The installed analyzer instructions now explicitly require one approval for the Forge-managed command path, forbid runtime repair steps such as `npm install`, and forbid raw `gh api graphql` fallback unless Forge is truly unavailable and the user explicitly chooses that fallback.
- `tests/smoke/cli.test.ts` now asserts those guardrails are present in the generated `.agent.md` file.

Verification:

- `npm run build`
- `npm test -- tests/smoke/cli.test.ts`
