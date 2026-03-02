# Phase 3: Copilot Planning Proof - Research

**Researched:** 2026-03-02
**Domain:** plan generation from repository analysis, GitHub Copilot summonable entrypoints, sidecar plan history
**Confidence:** MEDIUM-HIGH

## User Constraints

No `CONTEXT.md` is present for this phase. Planning uses roadmap requirements plus the expected outputs from Phase 2.

Locked constraints from project docs:

- Must address `INVK-03`, `PLAN-01`, `PLAN-02`, `PLAN-03`, `PLAN-04`
- The first full summoned workflow should be GitHub Copilot-centric
- Generated plans must be grounded in repository analysis artifacts rather than generic templates
- Plans must stay reviewable and must not assume Forge will apply code changes automatically
- Plan outputs must preserve run history and context association for later follow-up

## Summary

Phase 3 should be treated as the first consumer of Phase 2 analysis artifacts. The planning engine should not rescan the repository directly except for sanity checks; instead it should load the latest analysis bundle, accept user/discussion context, and produce versioned plan artifacts that explicitly cite the analysis sections they depend on.

The Copilot-specific part of the phase should stay narrow. The proof needs one native GitHub Copilot summonable entrypoint, one invocation path that hands task/discussion context into Forge, and one plan output format that persists the generated results in the sidecar. Phase 4 can generalize installation and adapter layers, but Phase 3 should prove the product loop end to end with the smallest viable Copilot-native surface.

## Recommended Architecture

### Pattern 1: Plan generation engine consumes analysis artifacts, not live scans

- Load the latest analysis artifact as the primary planning input
- Accept invocation context separately: requested task, discussion reference, assistant identity
- Generate plans that cite analysis-derived facts and preserve that lineage in the stored plan metadata

### Pattern 2: Copilot adapter wraps the planning engine

- Keep GitHub Copilot specifics in an adapter/installer layer
- Do not let Copilot file layout or entrypoint mechanics leak into the generic planning engine
- This keeps Phase 4 expansion tractable because the core task model already exists

### Pattern 3: Immutable plan runs with contextual metadata

- Store each generated plan set as a historical run
- Record source analysis run ID, assistant context, invocation reference, and timestamps
- Keep prior plan runs instead of overwriting them so users can compare or revisit earlier outputs

## Pitfalls To Avoid

- Do not generate plans without a saved analysis artifact unless the command explicitly says it is doing so
- Do not let the first Copilot proof hardcode logic that Phase 4 will need to share across assistants
- Do not emit only prose; keep a structured plan artifact under the reviewable markdown/text output
- Do not assume repository mutation or direct code execution as part of plan output

## Validation Architecture

- Verify planning fails clearly when no repository analysis artifact exists yet
- Verify generated plans reference analysis-derived inputs rather than generic canned text
- Verify plan artifacts persist prior runs and record invocation context
- Verify the Copilot entrypoint triggers the same planning engine used by direct CLI invocation

## Plan Shape Recommendation

Use three plans:

1. Build the planning task model and persistent plan artifact format
2. Add a GitHub Copilot-specific entrypoint/installer around the planning engine
3. Wire end-to-end plan generation with discussion/task context and history preservation
