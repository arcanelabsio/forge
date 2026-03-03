# Codebase Concerns

## Overall Assessment

Forge is currently in an early bootstrap phase (Phase 1). The core repository guardrails and sidecar management are implemented and verified. The main risk is the transition from a minimal CLI to a functional analysis and planning engine.

## Technical Debt & Fragility

### Minimal Command Set
- Only the `bootstrap` command is implemented. The core value of Forge (analysis and planning) is still in the roadmap.
- The CLI structure is designed for expansion but has not yet been stressed by complex, multi-step workflows.

### Dependency on Subprocesses
- `GitService` relies heavily on `execa` to call the `git` binary. While robust, it introduces a runtime dependency on the system's `git` version and configuration.
- Error handling for git-specific failures (e.g., locked index, corrupted repo) is currently basic and may need more granular mapping as analysis grows more complex.

### Metadata Schema Evolution
- The `SidecarMetadata` schema is versioned but simple. As more features (analysis, planning, assistant installation) are added, the schema will need careful migration strategies to avoid breaking existing `.forge` directories.

## Missing Pieces

### Automated Testing
- Formal automated unit and integration tests are missing (scheduled for Phase 5).
- Current verification relies on manual scripts and developer discipline, which is a risk for long-term stability.

### Analysis Engine
- The core logic for repository analysis and fact extraction is not yet implemented (scheduled for Phase 2).
- The "Sidecar-First" promise depends on this engine being reliable and non-intrusive.

### Assistant Integrations
- Integration with GitHub Copilot and other assistants is currently only in the roadmap (Phases 3 and 4).
- The project has not yet proven its ability to correctly target assistant-owned runtime directories across different operating systems.

## Security & Performance

### Filesystem Access
- Forge currently requires write access to the `.forge` directory within the target repository. While it aims to be "sidecar-only," incorrect path resolution could lead to accidental writes elsewhere in the repository.
- `GitService` resolves the repository root, but there are no explicit "sandbox" checks to prevent Forge from traversing outside the repository boundary.

### Performance of Analysis
- As the analysis engine is built, performance will become a concern for large repositories with deep histories or many thousands of files. Node.js's single-threaded nature may require worker threads or highly optimized subprocess orchestration.

## Onboarding Risks

### Developer Experience (DX)
- There is currently no formal contributor guide or automated local development setup beyond `npm install` and `npm run build`.
- New contributors must rely on the `.planning/` documents to understand the architectural intent.

### "Brownfield" Cleanup
- The legacy Python scaffold was recently removed. Some documentation or mental models may still refer to the old structure, leading to confusion during onboarding.

## Most Likely Failure Modes

1. **Schema Mismatch**: Updating the CLI without a proper metadata migration path could corrupt existing `.forge` sidecars.
2. **Analysis Bloat**: The analysis process becomes too slow or resource-intensive for large production repositories.
3. **Integration Friction**: Changes in assistant runtime locations (e.g., a new VS Code or Copilot update) break Forge's automated installation flow.
