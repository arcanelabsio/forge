# FORGE Assistant Playbook

This playbook keeps assistant configuration small while preserving execution quality.

## Goal
Optimize for **analysis tokens**, not configuration tokens.

## Approach
- Keep base instructions concise.
- Move repeatable logic into scripts.
- Load only relevant files for the active task.

## Suggested workflow
1. Read task request.
2. Read only directly relevant module(s).
3. If broader repository context is needed, run:
   - `python forge/scripts/assistant/collect_context.py --topic core`
   - `python forge/scripts/assistant/collect_context.py --topic discussions`
4. Implement minimal, typed change.
5. Validate with targeted execution.

## Context budgets (guideline)
- Small bug fix: 2-4 files.
- Feature increment: 4-8 files.
- Architecture update: focused read + script-assisted map.

## Anti-patterns
- Large static instruction blocks duplicated across tools.
- Reading full repository trees by default.
- Repeating architecture text in every prompt.
