# Integrations

## Current State

There are no implemented external service integrations in the checked-in code. The repository currently integrates only internal Python modules plus a small amount of Python standard library functionality.

## Internal Module Integrations

- `Orchestrator` depends on the shared `BaseAgent` contract and executes registered agents by name in `forge/forge/core/orchestration.py:5-23`.
- `DiscussionAgent` extends `BaseAgent` and returns the shared structured-output shape from `forge/forge/agents/discussions/agent.py:5-27` and `forge/forge/agents/base.py:15-29`.
- Package-level exports connect modules through `__init__` files:
  - `forge/forge/core/__init__.py:3-7`
  - `forge/forge/agents/__init__.py:3-5`
  - `forge/forge/agents/discussions/__init__.py:3-5`
- The example runner integrates the orchestrator with the discussions agent in `forge/examples/example_discussion_run.py:12-27`.

## CLI And Tooling Integrations

- `forge/scripts/assistant/collect_context.py` provides a local CLI integration for AI coding workflows using `argparse` and file existence checks in `forge/scripts/assistant/collect_context.py:9-48`.
- The assistant playbook documents how that script should be used from external coding tools, but this is documentation guidance rather than a runtime service integration. See `forge/docs/assistant/playbook.md:9-18`.

## Standard Library Dependencies

Implemented integrations are limited to these standard library modules:

- `abc` for the abstract base class in `forge/forge/agents/base.py:5-17`
- `argparse` for CLI parsing in `forge/scripts/assistant/collect_context.py:9-10` and `forge/scripts/assistant/collect_context.py:37-44`
- `pathlib.Path` for local path checks in `forge/scripts/assistant/collect_context.py:10` and `forge/scripts/assistant/collect_context.py:31-34`
- `sys.path` manipulation for local example execution in `forge/examples/example_discussion_run.py:5-13`

## Explicitly Absent Integrations

The repository does not currently implement any of the following:

- LLM provider SDK integrations such as OpenAI, Anthropic, Gemini, or local inference adapters
- GitHub, GitLab, Jira, Slack, Discord, email, webhook, or database integrations
- HTTP clients, queues, schedulers, background workers, or event buses
- Web frameworks, REST APIs, GraphQL, RPC servers, or browser frontends
- Observability tooling such as logging frameworks, metrics, tracing, or error reporting SDKs
- Authentication, secrets management, or environment-driven credentials

Evidence:

- No third-party packages are declared in `forge/pyproject.toml:14`.
- Import scanning across the Python source shows only stdlib and internal imports.
- The implemented agent logic in `forge/forge/agents/discussions/agent.py:17-58` performs local heuristic processing only.

## Planned Or Aspirational Integrations

- The README states the framework is model-agnostic and compatible with providers such as Copilot, Claude, Codex, Gemini, and local models in `forge/README.md:27-30`.
- It also says provider integrations can be added behind adapters without changing orchestration semantics in `forge/README.md:53-55`.
- Future expansion mentions CLI integration, additional repository data sources, and event-driven automation in `forge/README.md:57-64`.

These are design intentions, not present-day integrations.
