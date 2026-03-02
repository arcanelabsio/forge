# FORGE Structure

## Top-Level Layout

The repository root at `/Users/ajit.gunturi/workspaces/playground/forge` is mostly a workspace container. The actual Python project lives in the nested [`forge/`](/Users/ajit.gunturi/workspaces/playground/forge/forge) directory.

Key top-level directories:

- [`.github/`](/Users/ajit.gunturi/workspaces/playground/forge/.github) for repository automation metadata.
- [`.planning/codebase/`](/Users/ajit.gunturi/workspaces/playground/forge/.planning/codebase) for generated codebase analysis documents.
- [`forge/`](/Users/ajit.gunturi/workspaces/playground/forge/forge) for the installable package, documentation, scripts, and examples.

## Project Directory Layout

Inside [`forge/`](/Users/ajit.gunturi/workspaces/playground/forge/forge), responsibilities are split by function rather than by feature slice:

- [`forge/pyproject.toml`](/Users/ajit.gunturi/workspaces/playground/forge/forge/pyproject.toml): packaging metadata and declared packages.
- [`forge/README.md`](/Users/ajit.gunturi/workspaces/playground/forge/forge/README.md): architectural intent, roadmap, and quick-start usage.
- [`forge/docs/assistant/playbook.md`](/Users/ajit.gunturi/workspaces/playground/forge/forge/docs/assistant/playbook.md): assistant-facing workflow documentation.
- [`forge/examples/example_discussion_run.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/examples/example_discussion_run.py): executable demonstration of the current runtime path.
- [`forge/scripts/assistant/collect_context.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/scripts/assistant/collect_context.py): support CLI for emitting topic-specific context file lists.
- [`forge/forge/`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge): importable Python package.

## Python Package Layout

The installable package root is [`forge/forge/`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge), exposed by [`forge/forge/__init__.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/__init__.py).

It contains two first-level subpackages:

- [`forge/forge/core/`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/core)
- [`forge/forge/agents/`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/agents)

This is also reflected in [`forge/pyproject.toml`](/Users/ajit.gunturi/workspaces/playground/forge/forge/pyproject.toml), which explicitly lists:

- `forge`
- `forge.core`
- `forge.agents`
- `forge.agents.discussions`

## Core Package Structure

[`forge/forge/core/`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/core) groups reusable framework primitives:

- [`forge/forge/core/orchestration.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/core/orchestration.py): agent registry and dispatch.
- [`forge/forge/core/signal.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/core/signal.py): placeholder signal extraction utilities.
- [`forge/forge/core/categorization.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/core/categorization.py): placeholder normalization and classification helpers.
- [`forge/forge/core/__init__.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/core/__init__.py): convenience exports for the three core classes.

This package is structurally cohesive: all files describe reusable framework services rather than a specific domain.

## Agents Package Structure

[`forge/forge/agents/`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/agents) contains the agent abstraction and domain implementations:

- [`forge/forge/agents/base.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/agents/base.py): abstract `BaseAgent` contract.
- [`forge/forge/agents/__init__.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/agents/__init__.py): re-exports `BaseAgent`.
- [`forge/forge/agents/discussions/`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/agents/discussions): discussion-specific agent package.

Inside the discussions package:

- [`forge/forge/agents/discussions/agent.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/agents/discussions/agent.py): `DiscussionAgent` implementation.
- [`forge/forge/agents/discussions/__init__.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/agents/discussions/__init__.py): re-exports `DiscussionAgent`.

The directory layout shows a clear package boundary: domain agents live under `agents/<domain>/`, while shared logic belongs either in `agents/base.py` or `core/`.

## Directory Responsibilities

### `examples/`

[`forge/examples/`](/Users/ajit.gunturi/workspaces/playground/forge/forge/examples) is runtime-oriented and user-facing. Files here demonstrate how the framework is expected to be assembled and executed.

### `scripts/assistant/`

[`forge/scripts/assistant/`](/Users/ajit.gunturi/workspaces/playground/forge/forge/scripts/assistant) is developer-tooling-oriented. It supports AI-assisted development rather than the framework's domain runtime.

### `docs/assistant/`

[`forge/docs/assistant/`](/Users/ajit.gunturi/workspaces/playground/forge/forge/docs/assistant) contains process documentation for assistant usage and repository context management.

### `forge/core/` and `forge/agents/`

These are the only directories that define the framework's importable runtime behavior.

## Structural Relationships

The main structural dependency direction is:

- `examples/` depends on package modules.
- `scripts/assistant/` depends on repository file paths and the local filesystem.
- `forge/forge/core/` depends on `forge/forge/agents/base.py` only for the agent contract in orchestration.
- `forge/forge/agents/discussions/` depends on `forge/forge/agents/base.py`.

Notably absent:

- no tests directory
- no CLI package
- no configuration package
- no adapters/integrations package
- no persistence layer
- no provider-specific model integrations

## Current Structural Shape

The repository is structured as an expandable scaffold:

- packaging and docs are present
- one example path is present
- one agent domain is implemented
- core support modules are started
- several intended extension points are represented by directory boundaries rather than by large implementations

In practical terms, the directory layout already encodes the intended long-term shape of the framework, even though the current code volume is small and only one execution flow is active.
