---
phase: 02-repository-analysis
plan: "01"
subsystem: repository-analysis
tags: [analysis, artifacts, sidecar, metadata, schema]
requires: []
provides: [analysis-contract, analysis-persistence]
affects: [metadata-service]
tech-stack: [typescript, zod, node-fs]
key-files:
  - src/contracts/analysis.ts
  - src/services/analysis/artifacts.ts
  - src/config/analysis.ts
  - src/services/metadata.ts
decisions:
  - Use ISO timestamp as analysis run ID for natural chronological ordering.
  - Store full analysis payload in separate JSON files to keep metadata.json lightweight.
  - Duplicate latest analysis to a stable 'latest.json' path for easy retrieval without double-hop metadata lookups.
metrics:
  duration: 45m
  completed_date: 2026-03-02
---

# Phase 02 Plan 01: Analysis Contract and Persistence Summary

## Objective
Establish the artifact contract and persistence model for repository analysis.

## Key Changes
- **Repository Analysis Domain Model:** Created `AnalysisRun` contract in `src/contracts/analysis.ts` with a clear boundary between `observedFacts` (evidence) and `recommendations` (inferred guidance).
- **Artifact Persistence Service:** Implemented `src/services/analysis/artifacts.ts` for managing analysis runs, including durable historical storage and a stable `latest.json` pointer.
- **Sidecar Metadata Extension:** Updated `SidecarMetadataSchema` in `src/services/metadata.ts` to include an `analysis` history index, enabling run rediscovery without bloating the core metadata file.
- **Sidecar Config:** Added directory constants in `src/config/analysis.ts` for consistent artifact pathing.

## Verification Results
- [x] `npm run build` succeeds with the new analysis contract and persistence modules
- [x] `node -e "import('./dist/services/analysis/artifacts.js')"` loads correctly after build
- [x] Verified that `AnalysisRun` schema enforces separation of evidence and guidance
- [x] Confirmed that `persistAnalysisRun` correctly updates both the historical artifact and the metadata index

## Deviations from Plan
None - plan executed exactly as written.

## Self-Check: PASSED
- [x] All 3 tasks completed
- [x] Commits made for each task
- [x] `src/contracts/analysis.ts` exists and contains `observedFacts`
- [x] `src/services/analysis/artifacts.ts` exists and handles persistence
- [x] `src/services/metadata.ts` updated with analysis history
- [x] `npm run build` passes
