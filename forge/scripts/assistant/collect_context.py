"""Collect focused FORGE context for AI assistants.

This script outputs a compact file list by topic so assistants can load only
relevant modules and spend tokens on reasoning and implementation.
"""

from __future__ import annotations

import argparse
from pathlib import Path

TOPIC_MAP: dict[str, list[str]] = {
    "core": [
        "forge/README.md",
        "forge/forge/core/signal.py",
        "forge/forge/core/categorization.py",
        "forge/forge/core/orchestration.py",
    ],
    "agents": [
        "forge/forge/agents/base.py",
        "forge/forge/agents/discussions/agent.py",
    ],
    "discussions": [
        "forge/forge/agents/base.py",
        "forge/forge/agents/discussions/agent.py",
        "forge/examples/example_discussion_run.py",
    ],
}


def collect(topic: str) -> list[str]:
    """Return existing file paths for a given topic."""
    candidates = TOPIC_MAP.get(topic, [])
    return [path for path in candidates if Path(path).exists()]


def main() -> None:
    """CLI entrypoint."""
    parser = argparse.ArgumentParser(description="Emit focused FORGE context files")
    parser.add_argument("--topic", required=True, choices=sorted(TOPIC_MAP))
    args = parser.parse_args()

    for file_path in collect(args.topic):
        print(file_path)


if __name__ == "__main__":
    main()
