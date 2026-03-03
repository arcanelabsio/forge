# Phase 8: Cross-Assistant Forge Discussion Analyzer Summonable - Research

**Researched:** 2026-03-03
**Domain:** named summonable installation, assistant-native invocation parity, Forge-managed preprocessing, compact discussion-analysis context
**Confidence:** MEDIUM-HIGH

## User Constraints

Using phase context from: `.planning/phases/08-cross-assistant-forge-discussion-analyzer-summonable/08-CONTEXT.md`

Locked constraints from the request and attached agent file:

- Install a summonable named `forge-discussion-analyzer`
- Preserve the user-facing selection model of "select the analyzer, then ask a question"
- Support all currently targeted code assistant runtimes, not only Copilot
- Move heavy logic, scripts, downloads, and operational context out of the installed assistant asset and into Forge
- Minimize prompt context without degrading discussion analysis quality
- Preserve the behavioral intent of the attached `gh-discussion-analyzer.agent.md`

## Summary

The current Forge runtime can only install one generic summonable entry per assistant. That is not enough for this feature, because `forge-discussion-analyzer` must become a distinct installed capability with its own name, invocation examples, and runtime contract. The right architectural move is to evolve the install model from "one generic entry" to a small registry of named summonables that share a common Forge backend.

The attached `.agent.md` is also doing too much in prompt space. It mixes persona, tool requirements, authentication checks, GitHub API usage, batching strategy, noise filtering, categorization, and output format into one large agent definition. Forge should absorb the operational pieces into code: repository detection, discussions fetching, filtering, preprocessing, artifact hydration, and report scaffolding. The installed assistant file should mainly explain when to invoke Forge, what question shapes are supported, and which sidecar artifacts to rely on.

That means Phase 8 should produce two layers:

1. A cross-assistant named summonable installation layer for `forge-discussion-analyzer`
2. A Forge-managed analysis runtime that turns raw `.forge/discussions` data into compact, question-ready artifacts or execution steps

## Recommended Architecture

### Pattern 1: Multiple named summonables, one Forge installer

- Extend the internal summonable model so Forge can install more than one named entry
- Keep assistant adapters generic, but let them materialize multiple installed assets when multiple summonables are selected or bundled
- Preserve a stable canonical identifier like `forge-discussion-analyzer` across assistants where possible

### Pattern 2: Thin assistant asset, heavy Forge backend

- Keep assistant-installed files short and native to the target platform
- Move GitHub CLI, token checks, batching, jq-style preprocessing, and report generation into Forge runtime code
- Use assistant assets to invoke or instruct the Forge backend rather than restating all operational logic inline

### Pattern 3: Compact sidecar analysis context

- Treat `.forge/discussions/latest.json` as raw input, not final model context
- Add a second-stage Forge preprocessing step that produces compact analysis-ready artifacts: normalized summaries, extracted facts, category/status indexes, and optionally question-specific slices
- Feed assistants the prepared artifact path and a small execution contract instead of the full raw discussion dump plus long instructions

### Pattern 4: Assistant-native parity with explicit degradation rules

- Copilot can most closely mirror `/agent` selection by installing a distinct named agent asset
- Claude, Codex, and Gemini should get the closest native summonable surface their runtime supports
- Where a runtime cannot mirror Copilot exactly, Forge should install a clearly named equivalent and document the invocation path rather than pretending parity exists

## Pitfalls To Avoid

- Do not keep all of the legacy `.agent.md` operational detail inside each installed assistant asset
- Do not build a Copilot-only solution when the stated goal is cross-assistant parity
- Do not let the analysis runtime depend on re-fetching everything when `.forge/discussions` artifacts already exist
- Do not collapse raw discussions and analysis-ready digests into one opaque file; Forge needs a reviewable transformation path
- Do not make assistant wrappers inconsistent enough that `forge-discussion-analyzer` means different things on different platforms

## Validation Architecture

- Verify Forge can install a distinct `forge-discussion-analyzer` summonable alongside or in addition to the generic Forge entry
- Verify each supported assistant receives a native asset whose installed name and invocation path are explicit
- Verify the Forge-managed analysis runtime can answer discussion-analysis questions from compact sidecar artifacts instead of requiring the full legacy `.agent.md` context
- Verify raw discussions, compact digests, and final generated reports remain traceable and sidecar-safe

## Plan Shape Recommendation

Use three plans:

1. Extend Forge from a single generic summonable to named multi-entry installation, including `forge-discussion-analyzer`
2. Build the discussion-analysis runtime and compact context preparation layer inside Forge
3. Wire assistant-native invocation flows, end-to-end verification, and documentation of any platform-specific degradation

## Source Notes

- Behavioral source: `/Users/ajitg/Downloads/gh-discussion-analyzer.agent.md`
- Existing Forge baseline: Phase 7 discussion fetch and filter pipeline under `.forge/discussions`
