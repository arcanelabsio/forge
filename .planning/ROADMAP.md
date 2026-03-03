# Roadmap: Forge AI Assist

**Created:** 2026-03-02
**Scope:** v1
**Planning basis:** `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/research/SUMMARY.md`, `.planning/config.json`

## Roadmap Principles

- Keep repo-specific outputs inside one ignorable Forge sidecar directory
- Treat v1 as analysis and action-planning only, not automatic repository modification
- Prove the product end to end first through GitHub Copilot discussion analysis
- Expand assistant coverage only after the first summoned workflow is real and reviewable
- Preserve exact one-phase coverage for every v1 requirement

## Phase 1: Bootstrap CLI (Complete)

Establish the packaged entrypoint, repository guardrails, and sidecar lifecycle needed for every later flow.

**Goal:** Establish the packaged entrypoint, repository guardrails, and sidecar lifecycle needed for every later flow.
**Requirements:** INVK-01, INVK-04, SIDE-01, SIDE-02, SIDE-03, SIDE-04, DELV-01

**Success criteria:**

- Running `npx forge-ai-assist@latest` starts the Forge CLI through the published npm package entrypoint
- Invoking a repository-analysis flow outside a Git repository exits cleanly with an explicit user-facing message
- Forge creates and reuses exactly one repo-local sidecar directory for all managed artifacts
- Re-running Forge in the same repository updates or reuses sidecar contents without duplicate artifact trees or corrupted metadata
- No v1 bootstrap flow writes to repository source files outside the Forge sidecar directory

## Phase 2: Repository Analysis (Complete)

Build the sidecar-first analysis engine that inspects a Git repository, records observed facts, and produces reviewable analysis artifacts.

**Goal:** Build the sidecar-first analysis engine that inspects a Git repository, records observed facts, and produces reviewable analysis artifacts.
**Requirements:** ANLY-01, ANLY-02, ANLY-03, ANLY-04

**Success criteria:**

- Forge detects the active Git repository root and scopes analysis to that root consistently
- Analysis artifacts capture repository stack, structure, and assistant-relevant context needed for planning
- Output clearly separates observed repository facts from inferred recommendations
- Analysis results are written to durable sidecar artifacts that remain available across reruns

## Phase 3: Copilot Planning Proof (Complete)

Deliver the first full summoned workflow by exposing a GitHub Copilot discussion entrypoint that turns repository analysis into reviewable action plans.

**Goal:** Deliver the first full summoned workflow by exposing a GitHub Copilot discussion entrypoint that turns repository analysis into reviewable action plans.
**Requirements:** INVK-03, PLAN-01, PLAN-02, PLAN-03, PLAN-04

**Success criteria:**

- A GitHub Copilot `/agent` entrypoint can invoke the first end-to-end Forge workflow
- The workflow produces action plans grounded in repository analysis rather than generic templates
- Plans are explicit, reviewable, and do not assume Forge will apply code changes automatically
- Generated plans are associated with the invoked discussion, task, or workflow context in sidecar metadata
- Repeated planning runs preserve prior plan outputs for later comparison or follow-up

## Phase 4: Assistant Runtime Expansion (Complete)

Generalize install and summon flows from the Copilot proof into a shared model that supports the broader assistant set from one managed source.

**Goal:** Generalize install and summon flows from the Copilot proof into a shared model that supports the broader assistant set from one managed source.
**Requirements:** INVK-02, ASST-01, ASST-02, ASST-03, ASST-04, ASST-05

**Success criteria:**

- Forge installs or updates assistant-owned summonable entries from one managed source of truth
- Supported assistant contexts include Claude, GitHub Copilot, Codex, and Gemini
- Each supported assistant receives the appropriate summonable skill, agent, or task entrypoint for its native conventions
- Forge uses one shared internal task model while adapting presentation per assistant
- Unsupported or unavailable assistant contexts no-op safely without damaging prior installation state

## Phase 5: Quality Gates (Complete)

Lock in sidecar safety and planning reliability with automated test coverage and smoke validation against temporary Git repositories.

**Goal:** Lock in sidecar safety and planning reliability with automated test coverage and smoke validation against temporary Git repositories.
**Requirements:** DELV-02, DELV-03, DELV-04

**Success criteria:**

- Automated tests cover Git-repo detection, sidecar writes, and rerun idempotency
- Automated tests cover analysis artifact generation and action-plan generation
- Smoke tests validate sidecar-only behavior against temporary Git repositories

## Phase 6: Milestone Audit Closure (Complete)

Close the auditability gap left after bootstrap by producing milestone-grade verification artifacts and restoring traceable evidence for the implemented Phase 1 requirements.

**Goal:** Close the auditability gap left after bootstrap by producing milestone-grade verification artifacts and restoring traceable evidence for the implemented Phase 1 requirements.
**Requirements:** INVK-01, INVK-04, SIDE-01, SIDE-02, SIDE-03, SIDE-04, DELV-01
**Gap Closure:** Closes gaps from audit

**Success criteria:**

- Phase 1 has a verification artifact that explicitly covers its implemented requirements
- Phase 1 summaries or equivalent audit inputs record requirements-completed evidence compatible with milestone auditing
- The milestone audit can mark the implemented bootstrap requirements as satisfied instead of failing on missing verification metadata
- No product behavior changes are required outside the evidence and verification work needed to close the audit gap

## Traceability Coverage

| Phase | Requirement Count | Requirements | Status |
|-------|-------------------|--------------|--------|
| Phase 1 | 7 | INVK-01, INVK-04, SIDE-01, SIDE-02, SIDE-03, SIDE-04, DELV-01 | Complete |
| Phase 2 | 4 | ANLY-01, ANLY-02, ANLY-03, ANLY-04 | Complete |
| Phase 3 | 5 | INVK-03, PLAN-01, PLAN-02, PLAN-03, PLAN-04 | Complete |
| Phase 4 | 6 | INVK-02, ASST-01, ASST-02, ASST-03, ASST-04, ASST-05 | Complete |
| Phase 5 | 3 | DELV-02, DELV-03, DELV-04 | Complete |
| Phase 6 | 7 | INVK-01, INVK-04, SIDE-01, SIDE-02, SIDE-03, SIDE-04, DELV-01 | Complete |

**Coverage validation:**

- v1 requirements: 25
- Phase-mapped requirements: 25
- Unmapped requirements: 0
- Multi-mapped requirements: 0

**Gap-closure note:**

- Phase 6 exists to close milestone-audit evidence gaps for already-implemented Phase 1 requirements; the authoritative requirement-to-phase assignment lives in `.planning/REQUIREMENTS.md`

## Notes

- The roadmap deliberately prioritizes sidecar-safe analysis before broad assistant expansion because v1 value is repository understanding and planning, not repo mutation
- Research recommendations that imply writing generated outputs into the target repository are deferred or narrowed to assistant-owned runtime locations plus the ignorable Forge sidecar
- GitHub Copilot discussion analysis is the first end-to-end proof; broader multi-assistant parity follows after that proof works
