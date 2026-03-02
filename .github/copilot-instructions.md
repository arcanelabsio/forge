# FORGE Copilot Instructions (Lean)

Keep context light. Prefer reading code over long prompt text.

## Priority order
1. Follow inline task requirements.
2. Follow module contracts in `forge/forge/agents/base.py` and `forge/forge/core/*`.
3. Use scripts in `forge/scripts/assistant/` for repeatable context extraction.

## Working rules
- Spend tokens on analysis and code changes, not long restatements.
- Touch the smallest viable set of files.
- Preserve typed, minimal, extensible design.
- No external dependencies unless explicitly requested.

## Fast context targets
- Architecture: `forge/README.md`
- Core contracts: `forge/forge/core/`, `forge/forge/agents/base.py`
- Discussions placeholder: `forge/forge/agents/discussions/agent.py`

For deeper guidance, open `forge/docs/assistant/playbook.md` only when needed.
