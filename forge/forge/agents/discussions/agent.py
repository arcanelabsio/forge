"""Discussion intelligence agent skeleton."""

from __future__ import annotations

from forge.agents.base import BaseAgent


class DiscussionAgent(BaseAgent):
    """Analyze raw repository discussion text into structured intelligence."""

    def __init__(self) -> None:
        super().__init__(
            name="discussions",
            description="Extracts structured insights from repository discussions.",
        )

    def run(self, raw_text: str) -> dict[str, object]:
        """Run discussion analysis and return a structured summary."""
        if not self.validate(raw_text):
            raise ValueError("Discussion payload must be a non-empty string.")

        return self.structured_output(
            problem=self.extract_problem(raw_text),
            resolution=self.extract_resolution(raw_text),
            status=self.detect_status(raw_text),
            discussion_type=self.classify_type(raw_text),
        )

    def extract_problem(self, raw_text: str) -> str:
        """Extract the core problem statement from a discussion."""
        return raw_text.split(".")[0].strip()

    def extract_resolution(self, raw_text: str) -> str:
        """Extract or infer the discussed resolution."""
        lowered = raw_text.lower()
        if "resolved" in lowered or "fixed" in lowered:
            return "Resolution indicated in thread."
        return "Resolution pending."

    def detect_status(self, raw_text: str) -> str:
        """Detect the current state of the discussion."""
        lowered = raw_text.lower()
        if "resolved" in lowered or "fixed" in lowered:
            return "resolved"
        if "blocked" in lowered:
            return "blocked"
        return "open"

    def classify_type(self, raw_text: str) -> str:
        """Classify the discussion type using lightweight heuristics."""
        lowered = raw_text.lower()
        if "bug" in lowered or "error" in lowered:
            return "bug"
        if "feature" in lowered or "enhancement" in lowered:
            return "feature-request"
        if "question" in lowered or "how" in lowered:
            return "question"
        return "general"
