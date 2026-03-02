"""Base agent contract for FORGE."""

from __future__ import annotations

from abc import ABC, abstractmethod


class BaseAgent(ABC):
    """Abstract base class for all FORGE agents."""

    def __init__(self, name: str, description: str) -> None:
        self.name = name
        self.description = description

    @abstractmethod
    def run(self, raw_text: str) -> dict[str, object]:
        """Execute the agent on input text and return structured output."""

    def validate(self, raw_text: str) -> bool:
        """Validate the incoming payload before processing."""
        return isinstance(raw_text, str) and bool(raw_text.strip())

    def structured_output(self, **fields: object) -> dict[str, object]:
        """Produce a consistent dictionary output format."""
        return {
            "agent": self.name,
            "description": self.description,
            "result": fields,
        }
