---
status: testing
phase: 08-cross-assistant-forge-discussion-analyzer-summonable
source: 08-01-SUMMARY.md, 08-02-SUMMARY.md, 08-03-SUMMARY.md
started: 2026-03-03T10:00:00Z
updated: 2026-03-03T10:08:00Z
---

## Current Test

number: 2
name: Copilot Asset Naming
expected: |
  The installed Copilot `forge-discussion-analyzer` asset is explicitly named and recognizable as the discussion analyzer summonable rather than a generic Forge agent file. Its content should make it clear that the summonable is `forge-discussion-analyzer`.
awaiting: user response

## Tests

### 1. Install Named Summonables
expected: Running `forge --assistants copilot,gemini` installs both the generic Forge asset and a distinct `forge-discussion-analyzer` asset for each selected assistant. For Copilot, you should see separate installed agent files for `forge-agent` and `forge-discussion-analyzer` under `.forge/assistants/copilot/`. For Gemini, you should see both `.gemini/forge-agent.md` and `.gemini/forge-discussion-analyzer.md`.
result: issue
reported: "For GitHub Copilot, the file should go to .copilot/agents/ with file name .agent.md, for example .copilot/agents/forge-discussion-analyzer.agent.md, to show up in agent command."
severity: major

### 2. Copilot Asset Naming
expected: The installed Copilot `forge-discussion-analyzer` asset is explicitly named and recognizable as the discussion analyzer summonable rather than a generic Forge agent file. Its content should make it clear that the summonable is `forge-discussion-analyzer`.
result: pending

### 3. Direct Summonable Backend Run
expected: Running `forge --run-summonable forge-discussion-analyzer --question "What recurring patterns are visible in support discussions?"` against prepared discussion artifacts returns a GitHub Discussions digest with a summary table and detailed summaries, instead of a raw error or generic fallback message.
result: pending

### 4. Pattern Analysis Response
expected: When the question asks about patterns or themes, the discussion analyzer includes a pattern-oriented section or clearly surfaces recurring themes from the prepared discussion artifacts rather than only listing raw records.
result: pending

### 5. Missing Discussion Artifacts Guardrail
expected: If `forge-discussion-analyzer` is run before discussions are fetched or prepared, Forge fails with a clear message telling you to fetch discussions first instead of crashing or producing misleading output.
result: pending

## Summary

total: 5
passed: 0
issues: 1
pending: 4
skipped: 0

## Gaps

- truth: "Copilot summonables install to a path and filename shape that shows up in the /agent command"
  status: failed
  reason: "User reported: For GitHub Copilot, the file should go to .copilot/agents/ with file name .agent.md, for example .copilot/agents/forge-discussion-analyzer.agent.md, to show up in agent command."
  severity: major
  test: 1
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
