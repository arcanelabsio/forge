# Phase 7: Installer Simplification And GitHub Discussions Ingest - Research

**Researched:** 2026-03-03
**Domain:** npm binary presentation, default interactive install UX, assistant runtime reuse, GitHub Discussions acquisition and sidecar persistence
**Confidence:** MEDIUM-HIGH

## User Constraints

Using phase context from: `.planning/phases/07-installer-simplification-and-github-discussions-ingest/07-CONTEXT.md`

Locked constraints from user direction:

- Keep the package name as `forge-ai-assist`
- Publish and present the runnable binary as `forge`
- Make `npx forge-ai-assist@latest` immediately open an interactive assistant-selection install flow
- Remove the current explicit command surface from the primary product UX
- Add an assistant summonable asset that fetches GitHub Discussions from the current repository remote
- Persist fetched discussion artifacts only inside `.forge` for later analysis work
- Require `GH_TOKEN` or `GITHUB_TOKEN` before discussions fetches proceed
- Support user-provided time and category filters, including relative windows and explicit bounds

## Summary

The current codebase already has the right ingredients for this phase, but they are wired around an older multi-command CLI. The simplest path is to keep the underlying services that still make sense, replace the command-oriented program with a single default execution path, and make the install flow the only public entry. Packaging can keep the npm package name unchanged while switching the published `bin` name to `forge`, which satisfies the "run via `npx forge-ai-assist@latest` but expose `forge`" constraint.

The existing assistant runtime layer is also reusable. Rather than inventing a parallel mechanism for the GitHub Discussions fetcher, Forge should add a new shared summonable entry and let the adapter layer render it for supported assistants. That keeps installation logic centralized and consistent with the current architecture.

For GitHub Discussions, the stable implementation target is GitHub's GraphQL API. Discussions are exposed through repository-level GraphQL connections rather than the older REST shape, and pagination is cursor-based. The fetch flow should therefore derive `owner` and `name` from the repository's `origin` remote, request discussions through a GraphQL query, normalize the response into Forge-owned JSON artifacts, and record run metadata so later analysis can distinguish raw observed discussion content from downstream interpretations.

Because the user wants time-window and category filtering, Forge should treat filter parsing as a first-class layer instead of ad hoc prompt text. Relative windows like `today`, `yesterday`, and `last week` should normalize into explicit date bounds before the GitHub request is issued, and those normalized bounds should be recorded in the sidecar metadata for auditability. Category filters should likewise resolve to a stable internal representation so reruns and later analysis can explain exactly which discussions were included.

## Recommended Architecture

### Pattern 1: Replace commands with a single default installer entry

- Keep `src/cli.ts` as the executable entrypoint
- Collapse `src/program.ts` into a single action that runs when no subcommand is present, or replace Commander entirely if it becomes dead weight
- Present an interactive assistant-selection prompt as the primary UX and route the selected assistants into the existing install service
- Keep only internal flags that materially help local verification, packaging, or non-interactive fallback

### Pattern 2: Keep the assistant runtime model and add one new summonable capability

- Add a dedicated shared summonable entry for GitHub Discussions fetch
- Install that entry through the existing assistant registry and adapter pipeline instead of creating assistant-specific bespoke logic first
- Keep the fetch behavior described in the prompt/instructions, while the actual data acquisition and persistence live in Forge services

### Pattern 3: Model discussions ingest as a sidecar run with durable history

- Add a dedicated `.forge/discussions/` subtree similar to existing analysis and planning run storage
- Persist raw fetched discussions and a stable latest pointer
- Record source metadata such as remote URL, owner/repo, fetched timestamp, pagination cursors, and discussion counts
- Preserve rerun history rather than overwriting prior fetches

### Pattern 4: Add explicit auth preflight and filter normalization

- Check `GH_TOKEN` first and `GITHUB_TOKEN` second, or support either equivalently with one canonical resolved token
- Fail fast with an actionable shell-oriented message when neither token is present
- Normalize user filters into one structured query object before issuing GraphQL calls
- Record the normalized filter object in the persisted run metadata

## Pitfalls To Avoid

- Do not keep the old command list visible "just in case"; that would directly violate the requested UX simplification
- Do not tie the fetcher to a hard-coded `owner/repo`; it must derive from the active repository remote
- Do not store only assistant-rendered prompt text for discussions; the sidecar needs durable machine-readable discussion artifacts
- Do not assume GitHub Discussions are available over the current repository remote without explicit error handling for missing remotes, non-GitHub remotes, disabled discussions, or missing auth
- Do not let natural-language filters like `last week` be interpreted implicitly at multiple layers; normalize them once and persist the result
- Do not write assistant-native fetch results into repository working files outside `.forge`

## Validation Architecture

- Verify a packed install still works through `npx forge-ai-assist@latest` semantics after the `bin` name changes to `forge`
- Verify the default CLI path launches the interactive assistant-selection flow instead of showing the legacy command list
- Verify assistant installation can include the new GitHub Discussions fetch capability without regressing the shared registry model
- Verify the fetch flow derives the GitHub repository identity from `origin`, handles authentication errors cleanly, and writes durable artifacts only under `.forge`
- Verify missing-token flows stop early with an actionable shell configuration message
- Verify relative and explicit date filters plus category filters normalize consistently and constrain fetched results as expected

## External Notes

- GitHub exposes Discussions data through the GraphQL API, including repository discussions and discussion categories.
- GitHub's GraphQL pagination is cursor-based and fits Forge's need for durable incremental fetch metadata.
- The current repo remote is `https://github.com/ajitgunturi/forge.git`, so owner/repo derivation can be validated against a real GitHub remote during implementation.

## Plan Shape Recommendation

Use two plans:

1. Rework packaging and the CLI entry into the default interactive installer flow
2. Add the GitHub Discussions fetcher entry, fetch service, and sidecar artifact persistence
3. Add token preflight and filter normalization for user-scoped discussions queries

## Reference Sources

- GitHub GraphQL Discussions object and repository discussion connections: official GitHub GraphQL API documentation
- GitHub GraphQL pagination guidance: official GitHub GraphQL API documentation
