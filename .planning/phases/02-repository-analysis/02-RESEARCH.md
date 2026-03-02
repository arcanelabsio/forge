# Phase 2: Repository Analysis - Research

**Researched:** 2026-03-02
**Domain:** sidecar-scoped repository analysis, durable artifact generation, observed-vs-inferred output boundaries
**Confidence:** HIGH

## User Constraints

No `CONTEXT.md` is present for this phase. Planning uses the roadmap, requirements, existing Phase 1 implementation, and codebase docs.

Locked constraints from project docs:

- Must address `ANLY-01`, `ANLY-02`, `ANLY-03`, `ANLY-04`
- Analysis must start from the active Git repository root, not the current shell subdirectory
- Artifacts must stay in the Forge sidecar and remain available across reruns
- Output must distinguish observed repository facts from inferred recommendations
- The current implementation already provides Git root detection and sidecar metadata services, but no repository analysis commands or artifact model yet

## Summary

Phase 2 should add a dedicated repository-analysis pipeline on top of the Phase 1 bootstrap foundation rather than folding analysis logic into the bootstrap command. The clean shape is: resolve repo root, initialize/reuse the sidecar, collect observed facts through focused analyzers, derive recommendations in a separate pass, then persist a versioned analysis bundle plus a run index inside `.forge`.

The most important design choice is to treat analysis output as structured data first and markdown second. A structured artifact contract makes reruns diffable, enables later planning phases to consume repository analysis programmatically, and gives the CLI a stable place to separate `observed` from `inferred` content. The markdown summary can then be generated from the same structured payload for human review.

## Recommended Architecture

### Pattern 1: Structured analysis bundle with explicit evidence boundaries

- Use one machine-readable JSON artifact as the source of truth for each run
- Store sections like `repository`, `stack`, `structure`, `assistantContext`, `observedFacts`, and `recommendations`
- Keep `observedFacts` limited to facts traceable to the filesystem or checked-in config
- Keep `recommendations` in a separate collection so later phases never confuse inference with evidence

### Pattern 2: Analyzer-per-domain services

- Create small analyzers for stack, structure, and assistant-relevant context instead of one large scanner
- Each analyzer should accept the resolved repo root and return typed output plus evidence notes
- This keeps later planning work composable because Phase 3 can consume only the pieces it needs

### Pattern 3: Sidecar run index plus stable latest pointers

- Persist each analysis run under a timestamped or ID-based directory inside `.forge`
- Also write a stable `latest` manifest/index so later commands do not need to discover runs heuristically
- Reuse sidecar metadata to record analysis runs, but keep large analysis payloads in dedicated artifact files rather than bloating `metadata.json`

## Pitfalls To Avoid

- Do not scan from `process.cwd()` once the repo root is known
- Do not mix observed facts and recommendations in the same unordered markdown list
- Do not only emit human-readable markdown; Phase 3 needs structured analysis input
- Do not rewrite or delete prior analysis outputs on each run; preserve history for comparison
- Do not analyze ignored build output by default unless a future rule explicitly opts in

## Validation Architecture

- Verify typed artifacts are written to `.forge` and can be reloaded independently of console output
- Verify analysis from a nested directory still scopes to the same repo root
- Verify `observedFacts` sections contain direct evidence and `recommendations` remain separate
- Verify reruns preserve previous analysis artifacts while updating a stable latest pointer/index

## Plan Shape Recommendation

Use three plans:

1. Define the analysis artifact contract and persistence layer
2. Implement repository analyzers for stack, structure, and assistant context
3. Wire an `analyze` command that executes the pipeline and writes durable sidecar outputs

## Open Questions

1. Which assistant-related repository signals matter most in v1: prompt files, workflow/task configs, or all assistant-native folders?
2. Should the first artifact set be JSON plus markdown, or JSON only with CLI pretty-printing?
3. How aggressively should Forge inspect dependency lockfiles in this phase versus later quality/performance work?
