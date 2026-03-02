"""Minimal example for running the FORGE DiscussionAgent."""

from __future__ import annotations

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from forge.agents.discussions import DiscussionAgent
from forge.core.orchestration import Orchestrator


def main() -> None:
    """Run a sample discussion payload through the orchestrator."""
    payload = (
        "Bug report: API timeout when processing large repositories. "
        "Workaround merged and issue marked resolved."
    )

    orchestrator = Orchestrator()
    orchestrator.register_agent(DiscussionAgent())

    result = orchestrator.run_agent("discussions", payload)
    print(result)


if __name__ == "__main__":
    main()
