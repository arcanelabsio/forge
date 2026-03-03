# Phase 4: Assistant Runtime Expansion - Research

**Researched:** 2026-03-02
**Domain:** shared assistant task model, multi-assistant installation/update flows, safe unsupported-context handling
**Confidence:** MEDIUM-HIGH

## User Constraints

No `CONTEXT.md` is present for this phase.

Locked constraints from project docs:

- Must address `INVK-02`, `ASST-01`, `ASST-02`, `ASST-03`, `ASST-04`, `ASST-05`
- Supported assistant contexts are Claude, GitHub Copilot, Codex, and Gemini
- Forge should manage assistant-owned summonable entries from one shared source of truth
- The shared internal task model should remain consistent while presentation adapts per assistant
- Unsupported or unavailable assistant contexts must no-op safely without damaging existing installation state

## Summary

Phase 4 should generalize the Phase 3 Copilot proof into a registry-driven runtime layer. The right architecture is one assistant capability registry, one shared internal task/entry model, and one install/update service that delegates adapter-specific rendering and destination logic per assistant. That keeps content and task semantics shared while allowing each assistant to receive the native format it expects.

The risk in this phase is overfitting the assistant abstraction too early. The shared model should stay focused on summonable entries, prompt/task content, install targets, and availability checks. It does not need to solve every future assistant behavior. A narrow, registry-backed model is enough to unify installation/update behavior and safe no-op handling across the four assistants required for v1.

## Recommended Architecture

### Pattern 1: Registry of assistant adapters

- Define a canonical assistant registry keyed by assistant ID
- Each adapter declares support status, install target rules, renderers, and availability checks
- The shared install/update command operates on the registry instead of hardcoding per-assistant branches inline

### Pattern 2: Shared internal summonable-entry model

- Represent the Forge workflow entry as one internal task/prompt model
- Have adapters render that model into assistant-native file or prompt formats
- Keep source-of-truth content centralized so updates remain consistent across assistants

### Pattern 3: Safe no-op semantics

- Availability checks should decide whether an assistant can be installed on the current machine/context
- Unsupported or unavailable assistants should return an explicit no-op result with a stable reason
- Do not delete or rewrite prior assistant installs when current validation fails

## Pitfalls To Avoid

- Do not copy the Copilot proof into four separate implementations
- Do not make assistant adapters responsible for core planning logic
- Do not treat unsupported assistants as hard command failures when the requirement is safe no-op behavior
- Do not require users to manually copy shared prompt files into multiple runtime locations

## Validation Architecture

- Verify one shared entry definition can render to all supported assistant targets
- Verify install/update commands can process all supported assistants from one source of truth
- Verify unavailable assistants produce explicit no-op results without damaging existing installs
- Verify the Copilot proof still works through the generalized adapter layer

## Plan Shape Recommendation

Use three plans:

1. Build the assistant registry and shared summonable-entry model
2. Implement adapters/installers for Claude, Copilot, Codex, and Gemini
3. Add a generalized install/update command with safe no-op handling and shared reporting
