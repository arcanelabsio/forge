# FORGE Architecture

## Overview

The current codebase is a minimal Python framework scaffold organized around a two-layer design:

- Core primitives in [`forge/forge/core/orchestration.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/core/orchestration.py), [`forge/forge/core/signal.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/core/signal.py), and [`forge/forge/core/categorization.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/core/categorization.py).
- Domain agents in [`forge/forge/agents/base.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/agents/base.py) and [`forge/forge/agents/discussions/agent.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/agents/discussions/agent.py).

The architecture is intentionally small. Only one end-to-end runtime path is currently wired: a discussion payload passed through `Orchestrator` into `DiscussionAgent`, producing a structured dictionary.

## Entry Points

### Example runtime entry point

[`forge/examples/example_discussion_run.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/examples/example_discussion_run.py) is the only executable application entry point in the repository.

Its control flow is:

1. Resolve the outer project directory and insert it into `sys.path`.
2. Import `DiscussionAgent` from [`forge/forge/agents/discussions/__init__.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/agents/discussions/__init__.py).
3. Import `Orchestrator` from [`forge/forge/core/orchestration.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/core/orchestration.py).
4. Build a sample string payload.
5. Register the agent under its declared name (`"discussions"`).
6. Dispatch the payload via `orchestrator.run_agent("discussions", payload)`.
7. Print the returned structured result.

### Assistant/tooling entry point

[`forge/scripts/assistant/collect_context.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/scripts/assistant/collect_context.py) is a separate CLI-oriented support entry point. It does not participate in runtime analysis flow; instead, it maps topics to curated file lists for external coding assistants.

## Runtime Layers

### Layer 1: orchestration contract

[`forge/forge/core/orchestration.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/core/orchestration.py) defines `Orchestrator`, which owns an in-memory registry:

- `register_agent(agent)` stores agent instances keyed by `agent.name`.
- `run_agent(name, payload)` looks up the agent and delegates to `agent.run(payload)`.

This layer provides dispatch, but not scheduling, retries, dependency injection, persistence, or model/provider integration.

### Layer 2: agent contract

[`forge/forge/agents/base.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/agents/base.py) defines `BaseAgent`, the common abstraction for all agents:

- `name` and `description` are the routing and metadata contract.
- `run(raw_text)` is abstract and must return `dict[str, object]`.
- `validate(raw_text)` enforces a non-empty string input.
- `structured_output(**fields)` normalizes output shape to `{agent, description, result}`.

This is the main package boundary in the current design: orchestration depends only on the abstract `BaseAgent`, while concrete logic lives in agent implementations.

### Layer 3: domain implementation

[`forge/forge/agents/discussions/agent.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/agents/discussions/agent.py) contains the only concrete agent, `DiscussionAgent`.

`DiscussionAgent.run()` performs the whole analysis inline:

- validate input
- extract the first sentence as `problem`
- infer `resolution` from simple keywords
- infer workflow `status` from simple keywords
- classify `discussion_type` from simple keywords
- wrap all fields using `structured_output()`

This means the domain agent currently owns both coordination and heuristic analysis logic. There is no intermediate service layer.

## Data Flow

The active data path is:

1. Raw text originates in [`forge/examples/example_discussion_run.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/examples/example_discussion_run.py).
2. `Orchestrator.run_agent()` in [`forge/forge/core/orchestration.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/core/orchestration.py) forwards the text unchanged to the registered agent.
3. `DiscussionAgent.run()` in [`forge/forge/agents/discussions/agent.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/agents/discussions/agent.py) transforms the string into a structured dictionary.
4. The result is printed by the example script.

Current output shape:

```python
{
    "agent": "discussions",
    "description": "Extracts structured insights from repository discussions.",
    "result": {
        "problem": "...",
        "resolution": "...",
        "status": "...",
        "discussion_type": "...",
    },
}
```

No persistence, event bus, queue, network I/O, or external storage is involved.

## Control Flow

The main synchronous call chain is:

`example_discussion_run.main()` -> `Orchestrator.register_agent()` -> `Orchestrator.run_agent()` -> `DiscussionAgent.run()` -> `BaseAgent.validate()` / `BaseAgent.structured_output()`

Error behavior is also simple and local:

- `Orchestrator.run_agent()` raises `ValueError` if the requested name is not registered.
- `DiscussionAgent.run()` raises `ValueError` if validation fails.

There is no cross-module exception translation or recovery path.

## Module Relationships

### Core to agent dependency direction

- [`forge/forge/core/orchestration.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/core/orchestration.py) depends on [`forge/forge/agents/base.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/agents/base.py) for the abstract contract.
- [`forge/forge/agents/discussions/agent.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/agents/discussions/agent.py) depends on [`forge/forge/agents/base.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/agents/base.py).
- The example script depends on both the core orchestration module and the discussions agent package.

### Prepared but currently unused modules

[`forge/forge/core/signal.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/core/signal.py) and [`forge/forge/core/categorization.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/core/categorization.py) expose `SignalExtractor` and `Categorizer`, but they are not called by `Orchestrator`, `BaseAgent`, or `DiscussionAgent`.

Architecturally, they represent intended future decomposition:

- `SignalExtractor` for preprocessing and pattern extraction.
- `Categorizer` for classification and status normalization.

At present, their responsibilities are duplicated in lighter form inside `DiscussionAgent`.

## Package Boundaries

### Outer project boundary

[`forge/pyproject.toml`](/Users/ajit.gunturi/workspaces/playground/forge/forge/pyproject.toml) defines the installable Python project. The outer `forge/` directory acts as repository-local project root containing:

- packaging metadata
- README and docs
- examples
- scripts
- the actual importable `forge` package directory

### Importable package boundary

[`forge/forge/__init__.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/__init__.py) marks the inner `forge/forge/` directory as the importable package root.

Subpackage exports are curated through:

- [`forge/forge/core/__init__.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/core/__init__.py)
- [`forge/forge/agents/__init__.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/agents/__init__.py)
- [`forge/forge/agents/discussions/__init__.py`](/Users/ajit.gunturi/workspaces/playground/forge/forge/forge/agents/discussions/__init__.py)

These `__init__` files provide stable package-level import surfaces, even though the internal module graph is still small.

## Architectural Assessment

The current architecture is a scaffold rather than a full framework:

- Strong separation exists between abstract agent contract, orchestration, and one domain agent.
- The example path proves the minimum viable runtime loop.
- Core preprocessing and categorization modules exist but are not yet integrated into the active path.
- All execution is synchronous and in-process.
- The repository is prepared for expansion into more agents and richer pipelines, but today it is centered on a single heuristic discussion-analysis workflow.
