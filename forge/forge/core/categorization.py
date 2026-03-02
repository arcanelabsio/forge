"""Categorization helpers for normalized repository artifacts."""

from __future__ import annotations


class Categorizer:
    """Assign categories and statuses to repository intelligence outputs."""

    def categorize_discussion(self, discussion_text: str) -> str:
        """Categorize a discussion into a coarse semantic type."""
        lowered = discussion_text.lower()
        if "bug" in lowered or "error" in lowered:
            return "bug"
        if "feature" in lowered or "proposal" in lowered:
            return "feature-request"
        return "general"

    def assign_status(self, discussion_text: str) -> str:
        """Assign a workflow status from discussion language cues."""
        lowered = discussion_text.lower()
        if "resolved" in lowered or "fixed" in lowered:
            return "resolved"
        if "blocked" in lowered:
            return "blocked"
        return "open"
