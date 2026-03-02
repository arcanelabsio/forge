# Testing

## Current State

The repository has no committed automated test suite. A search for common Python test locations and test framework calls did not find any `tests/`, `test_*.py`, `*_test.py`, `unittest`, or `pytest` usage under `forge/`. The only executable verification path in the repo is the sample script `forge/examples/example_discussion_run.py`.

## Existing Validation Mechanisms

- The example script acts as an informal smoke test by instantiating `Orchestrator`, registering `DiscussionAgent`, and printing the resulting dictionary for a hard-coded payload (`forge/examples/example_discussion_run.py:16`, `forge/examples/example_discussion_run.py:23`, `forge/examples/example_discussion_run.py:26`).
- Input validation exists in runtime code, but it is not exercised by automated tests. `DiscussionAgent.run` raises on empty payloads (`forge/forge/agents/discussions/agent.py:17`), and `Orchestrator.run_agent` raises when a name is not registered (`forge/forge/core/orchestration.py:18`).
- The assistant helper script is deterministic and easy to test because `collect()` is pure apart from `Path.exists()` checks, but there are currently no assertions around `TOPIC_MAP` coverage or CLI behavior (`forge/scripts/assistant/collect_context.py:12`, `forge/scripts/assistant/collect_context.py:31`, `forge/scripts/assistant/collect_context.py:37`).

## Test Tooling Setup

- `forge/pyproject.toml` defines build metadata and package names only. It does not declare optional test dependencies, test scripts, or tool configuration for `pytest`, `coverage`, `tox`, `nox`, or lint/test automation (`forge/pyproject.toml:1`, `forge/pyproject.toml:5`, `forge/pyproject.toml:16`).
- There are no repository-level config files for common test runners or coverage tools in the current tree.
- `README.md` offers a quick-start command for running the example script (`forge/README.md:88`), but it does not document any `test` command or contribution-time validation workflow.

## What Should Be Tested First

- `BaseAgent.validate()` and `BaseAgent.structured_output()` are the contract primitives that all future agents will inherit, so regressions here would affect every downstream agent (`forge/forge/agents/base.py:19`, `forge/forge/agents/base.py:23`).
- `DiscussionAgent` contains the main business logic in the repo today and should have unit tests for valid payloads, invalid payloads, and branch behavior for `extract_resolution`, `detect_status`, and `classify_type` (`forge/forge/agents/discussions/agent.py:17`, `forge/forge/agents/discussions/agent.py:33`, `forge/forge/agents/discussions/agent.py:40`, `forge/forge/agents/discussions/agent.py:49`).
- `Orchestrator` should be tested for agent registration, happy-path dispatch, and unknown-agent failure semantics (`forge/forge/core/orchestration.py:14`, `forge/forge/core/orchestration.py:18`).
- `collect_context.py` needs both unit coverage for `collect()` and a small CLI test to verify `--topic` choices and emitted file lists (`forge/scripts/assistant/collect_context.py:31`, `forge/scripts/assistant/collect_context.py:37`).

## Gaps

- No unit tests currently pin the heuristic keyword behavior, so innocuous wording changes in `DiscussionAgent` or `Categorizer` would silently change outputs (`forge/forge/agents/discussions/agent.py:35`, `forge/forge/agents/discussions/agent.py:42`, `forge/forge/core/categorization.py:11`).
- No integration test verifies that `DiscussionAgent` output shape matches the structure expected by `BaseAgent.structured_output()` and `Orchestrator.run_agent()` (`forge/forge/agents/base.py:23`, `forge/forge/core/orchestration.py:22`).
- No packaging or import test covers the manual `sys.path` adjustment in the example, so local script execution may work while installed-package execution drifts (`forge/examples/example_discussion_run.py:8`).
- No regression tests cover empty strings, whitespace-only strings, mixed-case keywords, or multi-sentence payloads even though the current parsing logic depends on those details (`forge/forge/agents/base.py:19`, `forge/forge/agents/discussions/agent.py:19`, `forge/forge/agents/discussions/agent.py:31`).
- No CI or documented local validation step exists, which means contributors currently have no enforced feedback loop before changes land.

## Practical Baseline For This Repo

If testing is added without changing the current architecture, a minimal baseline would be:

- `pytest` with a small `tests/` tree mirroring `forge/forge/agents/`, `forge/forge/core/`, and `forge/scripts/assistant/`.
- Unit tests for all public methods on `DiscussionAgent`, `Orchestrator`, and `collect()`.
- One smoke test that runs the example flow and asserts the returned dictionary keys rather than only printing output.

That baseline would cover nearly all implemented behavior because the codebase is still compact and has very little I/O.
