# Architecture Decision Records — Forge

Numbered records of architectural decisions in this repo. Each ADR captures the context, the options considered, and the decision taken, so future-us remember why the code looks the way it does.

## Conventions

- Numbering is sequential, zero-padded to 4 digits (`ADR-0001`, `ADR-0002`).
- Status is one of `Proposed`, `Accepted`, `Superseded`, `Deprecated`.
- ADRs are immutable after acceptance. Supersede rather than edit.

## Template

```markdown
---
id: ADR-NNNN
title: Short decision statement
status: Accepted
date: YYYY-MM-DD
---

## Context
What is the situation and what forces are in play?

## Options Considered
### Option A
- Pro / Con
### Option B
- Pro / Con

## Decision
Chosen option and the one-line reason.

## Consequences
### Positive
### Negative
### Risks
```

## Index

- [ADR-0001](0001-define-once-render-to-many.md) — Plugin definition is assistant-agnostic; adapters render.
- [ADR-0002](0002-direct-gh-execution-no-bundled-runtime.md) — Assistants call `gh` directly; Forge ships no runtime.
- [ADR-0003](0003-managed-block-markers-preserve-user-edits.md) — Installs use managed-block markers.
