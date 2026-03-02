# FORGE Copilot Instructions (Lean)

Keep context light. Prefer reading code over long prompt text.

## Priority order
1. Follow inline task requirements.

## Working rules
- Spend tokens on analysis and code changes, not long restatements.
- Touch the smallest viable set of files.
- Preserve typed, minimal, extensible design.
- No external dependencies unless explicitly requested.

## Fast context targets
- CLI entrypoint: `src/cli.ts`
- Sidecar service: `src/services/sidecar.ts`
- Metadata service: `src/services/metadata.ts`
- Git service: `src/services/git.ts`
