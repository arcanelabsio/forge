# Technology Stack

## Snapshot

This codebase is currently a small Python framework scaffold packaged from the nested `forge/` project directory, not a multi-language application. The implemented stack is intentionally minimal and mostly standard library based.

## Languages

- Python is the only implemented programming language in the repository. Packaging metadata requires Python 3.10+ in `forge/pyproject.toml:5-17`.
- Markdown is used for project documentation and assistant playbooks in `forge/README.md` and `forge/docs/assistant/playbook.md`.
- TOML is used for packaging configuration in `forge/pyproject.toml`.

## Packaging And Runtime

- Build backend: `setuptools.build_meta` with `setuptools>=61.0` in `forge/pyproject.toml:1-3`.
- Package name: `forge-framework` in `forge/pyproject.toml:5-8`.
- Runtime requirement: Python `>=3.10` in `forge/pyproject.toml:10`.
- Declared packages are explicitly enumerated rather than auto-discovered in `forge/pyproject.toml:16-17`.
- There is no lockfile, dependency manager metadata for Poetry/PDM/uv, container definition, or CI workflow present in the checked-in files under the repository root.

## Dependency Profile

- Third-party Python dependencies: none declared. `dependencies = []` in `forge/pyproject.toml:14`.
- Implemented imports are all Python standard library or internal package imports:
  - `abc` in `forge/forge/agents/base.py:5`
  - `argparse` and `pathlib` in `forge/scripts/assistant/collect_context.py:9-10`
  - `sys` and `pathlib` in `forge/examples/example_discussion_run.py:5-6`
- The README describes the framework as model-agnostic and compatible with multiple model providers, but no provider SDKs or adapters are implemented yet in the source tree. See `forge/README.md:27-30` and `forge/README.md:53-64`.

## Code Organization

- Core primitives live under `forge/forge/core/`:
  - `SignalExtractor` in `forge/forge/core/signal.py:6-20`
  - `Categorizer` in `forge/forge/core/categorization.py:6-25`
  - `Orchestrator` in `forge/forge/core/orchestration.py:8-23`
- Agent contracts live under `forge/forge/agents/`:
  - `BaseAgent` abstract contract in `forge/forge/agents/base.py:8-29`
  - `DiscussionAgent` example implementation in `forge/forge/agents/discussions/agent.py:8-58`
- Public package exports are assembled via `__all__` in:
  - `forge/forge/core/__init__.py:1-7`
  - `forge/forge/agents/__init__.py:1-5`
  - `forge/forge/agents/discussions/__init__.py:1-5`

## Execution Surfaces

- Example runtime entrypoint: `python examples/example_discussion_run.py` per `forge/README.md:88-92`.
- The example script manually prepends the nested project root to `sys.path` before importing package modules in `forge/examples/example_discussion_run.py:8-13`.
- Assistant-context helper script exposes a CLI via `argparse` and topic choices in `forge/scripts/assistant/collect_context.py:12-48`.

## Configuration Surfaces

- Packaging/build config is centralized in `forge/pyproject.toml`.
- Assistant-context selection is hard-coded through `TOPIC_MAP` in `forge/scripts/assistant/collect_context.py:12-28`.
- There are no environment variable reads, `.env` handling, config files, or runtime settings classes in the implemented Python source.

## Maturity Notes

- The implemented code is a scaffold with heuristic string processing rather than a production integration stack:
  - `SignalExtractor` methods mostly strip text or return empty lists in `forge/forge/core/signal.py:9-20`.
  - `DiscussionAgent` uses string matching and sentence splitting, not LLM/provider calls, in `forge/forge/agents/discussions/agent.py:17-58`.
- The README roadmap and architectural language are broader than the current code footprint. See `forge/README.md:77-94`.
