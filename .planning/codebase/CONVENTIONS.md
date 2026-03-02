# Code Conventions

## Scope

This repository is a small Python package scaffold under `forge/` with code concentrated in `forge/forge/agents/`, `forge/forge/core/`, `forge/examples/`, and `forge/scripts/assistant/`. The conventions below reflect what is implemented today rather than aspirational style guidance from the `README`.

## Naming And Layout

- The package uses a `src`-like separation without a `src/` directory: distributable code lives in `forge/forge/`, while runnable examples and helper scripts are kept outside the package in `forge/examples/` and `forge/scripts/assistant/` (`forge/pyproject.toml:16`, `forge/examples/example_discussion_run.py:1`, `forge/scripts/assistant/collect_context.py:1`).
- Modules use lowercase snake_case filenames such as `base.py`, `orchestration.py`, `categorization.py`, and `signal.py` (`forge/forge/agents/base.py:1`, `forge/forge/core/orchestration.py:1`).
- Public classes use PascalCase and are named after roles in the architecture: `BaseAgent`, `DiscussionAgent`, `Orchestrator`, `Categorizer`, and `SignalExtractor` (`forge/forge/agents/base.py:8`, `forge/forge/agents/discussions/agent.py:8`, `forge/forge/core/orchestration.py:8`, `forge/forge/core/categorization.py:6`, `forge/forge/core/signal.py:6`).
- Methods and local variables use snake_case consistently, including semantic names like `raw_text`, `discussion_text`, `payload`, `collect`, and `file_path` (`forge/forge/agents/discussions/agent.py:17`, `forge/scripts/assistant/collect_context.py:31`).
- Package `__init__` files explicitly re-export stable entry points through `__all__`, which indicates an intent to keep import surfaces narrow (`forge/forge/__init__.py:3`, `forge/forge/agents/__init__.py:5`, `forge/forge/core/__init__.py:7`).

## Style Patterns

- Every module starts with a brief triple-quoted docstring summarizing intent, and nearly every class and method also carries a concise docstring (`forge/forge/agents/base.py:1`, `forge/forge/agents/discussions/agent.py:1`, `forge/scripts/assistant/collect_context.py:1`).
- `from __future__ import annotations` is used everywhere, even in simple modules, so postponed annotation evaluation is a repo-wide convention (`forge/forge/agents/base.py:3`, `forge/forge/core/signal.py:3`, `forge/examples/example_discussion_run.py:3`).
- Type hints are expected on parameters and return values, but the project currently uses broad container types such as `dict[str, object]` instead of domain models or `TypedDict`s (`forge/forge/agents/base.py:16`, `forge/forge/agents/base.py:23`, `forge/forge/core/orchestration.py:18`).
- Control flow favors small methods with direct returns and lightweight string heuristics instead of helper utilities or shared constants. The `DiscussionAgent` repeats text normalization and keyword checks across `extract_resolution`, `detect_status`, and `classify_type` (`forge/forge/agents/discussions/agent.py:33`, `forge/forge/agents/discussions/agent.py:40`, `forge/forge/agents/discussions/agent.py:49`).
- The codebase prefers straightforward standard-library dependencies only. `pyproject.toml` declares no runtime dependencies, and the implementation sticks to `abc`, `argparse`, `pathlib`, and `sys` (`forge/pyproject.toml:14`, `forge/forge/agents/base.py:5`, `forge/scripts/assistant/collect_context.py:9`).

## Abstractions

- The main abstraction is an abstract base class contract. `BaseAgent` defines `run`, `validate`, and `structured_output`, and concrete agents inherit that interface rather than relying on protocols or plugin registration (`forge/forge/agents/base.py:8`, `forge/forge/agents/base.py:15`, `forge/forge/agents/base.py:19`, `forge/forge/agents/base.py:23`).
- Orchestration is intentionally minimal: `Orchestrator` is just a name-to-instance registry with `register_agent` and `run_agent` methods (`forge/forge/core/orchestration.py:8`, `forge/forge/core/orchestration.py:14`, `forge/forge/core/orchestration.py:18`).
- Core intelligence helpers are separated into single-purpose classes rather than free functions, even when the implementations are trivial. `Categorizer` and `SignalExtractor` each provide cohesive but currently shallow method groups (`forge/forge/core/categorization.py:6`, `forge/forge/core/signal.py:6`).
- Assistant-specific context assembly is isolated into a script-level lookup table `TOPIC_MAP`, which shows a convention of encoding lightweight configuration in Python dictionaries rather than external YAML or JSON files (`forge/scripts/assistant/collect_context.py:12`).
- Example code demonstrates the intended composition pattern: create an `Orchestrator`, register a concrete agent, then execute by agent name (`forge/examples/example_discussion_run.py:23`, `forge/examples/example_discussion_run.py:24`, `forge/examples/example_discussion_run.py:26`).

## Error Handling

- Validation failures are handled with immediate `ValueError` exceptions rather than custom exception types. `DiscussionAgent.run` rejects empty payloads, and `Orchestrator.run_agent` rejects unknown agent names the same way (`forge/forge/agents/discussions/agent.py:19`, `forge/forge/core/orchestration.py:20`).
- Most other code paths are optimistic and do not guard against malformed intermediate states. For example, `extract_problem` assumes sentence splitting on `"."` is always acceptable (`forge/forge/agents/discussions/agent.py:29`), and `SignalExtractor` methods return stripped text without any input checks (`forge/forge/core/signal.py:9`, `forge/forge/core/signal.py:13`).
- The assistant context script avoids raising for missing files by filtering `TOPIC_MAP` through `Path.exists()`, which is a silent-failure convention instead of surfacing incomplete topic definitions (`forge/scripts/assistant/collect_context.py:31`).
- There is no centralized logging, retry, or error-wrapping layer. Errors are expected to bubble directly from the standard library or these small guard clauses.

## Notable Deviations And Gaps

- The repository narrative emphasizes "structured outputs" and "production-oriented" behavior (`forge/README.md:5`, `forge/README.md:17`), but the current implementation uses generic dictionaries and heuristic string matching, so conventions are scaffold-level rather than hardened framework rules.
- Packaging and execution paths are slightly awkward: the example manually mutates `sys.path` to locate the package (`forge/examples/example_discussion_run.py:8`), which suggests local run ergonomics are not fully standardized yet.
- Export conventions are explicit for most packages, but `forge/forge/agents/discussions/__init__.py` is not included in the setuptools package list in `forge/pyproject.toml`, so the package boundary is conceptually clear but not yet rigorously maintained (`forge/forge/agents/discussions/__init__.py:3`, `forge/pyproject.toml:16`).
