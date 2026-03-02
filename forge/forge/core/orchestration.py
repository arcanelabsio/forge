"""Agent orchestration primitives."""

from __future__ import annotations

from forge.agents.base import BaseAgent


class Orchestrator:
    """Register and execute agents by name."""

    def __init__(self) -> None:
        self._agents: dict[str, BaseAgent] = {}

    def register_agent(self, agent: BaseAgent) -> None:
        """Register an agent instance for later execution."""
        self._agents[agent.name] = agent

    def run_agent(self, name: str, payload: str) -> dict[str, object]:
        """Run a registered agent by name with the provided payload."""
        if name not in self._agents:
            raise ValueError(f"Agent '{name}' is not registered.")
        agent = self._agents[name]
        return agent.run(payload)
