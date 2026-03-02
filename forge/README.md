# FORGE

AI Agents for Repository Intelligence & Execution

FORGE is a production-oriented, open-source framework for turning repository activity into structured outputs that teams can execute on.

## Philosophy

FORGE is built around one pipeline:

**Noise → Signal → Structure → Action**

Repository ecosystems generate high-volume, low-structure input: discussions, issues, comments, incidents, and planning fragments. FORGE agents convert that data into decision-ready artifacts.

Core operating principles:

- **Execution > Explanation**: output should drive next steps, not just summarize context.
- **Signal > Volume**: prioritize relevance, risk, and momentum over exhaustive capture.
- **Structure > Conversation**: produce machine-usable, human-reviewable artifacts.
- **Autonomy > Hand-holding**: agents should operate with clear contracts and minimal manual routing.
- **Expandability**: architecture must support new agents, sources, and orchestration patterns.

## What FORGE Is / Is Not

### FORGE is

- A Python framework for repository intelligence workflows.
- A multi-agent architecture with shared core primitives.
- Model-agnostic by design (compatible with Copilot, Claude, Codex, Gemini, and local models).
- Focused on structured outputs that can feed automation.

### FORGE is not

- A single monolithic chatbot.
- A UI-first project.
- Locked to one model provider or API surface.
- A static analytics dashboard.

## Architecture Overview

FORGE uses two primary layers:

1. **Core layer**
   - Signal extraction and noise reduction.
   - Categorization and status assignment.
   - Lightweight orchestration to register and execute agents.

2. **Agents layer**
   - Domain-specific agents (starting with Discussions intelligence).
   - Common contract via `BaseAgent`.
   - Structured outputs for downstream execution pipelines.

### Model-agnostic approach

The framework defines interfaces and execution contracts, not provider-specific assumptions. Model integrations can be added behind adapters without changing core orchestration semantics.

### Future expansion

The scaffold is intentionally minimal and prepared for:

- CLI integration.
- Additional repository data sources.
- Event-driven automation.
- Cross-repository intelligence patterns.


## Assistant Configuration Strategy

FORGE keeps assistant configuration intentionally lean:

- Keep always-on instructions short.
- Move repeatable context assembly into scripts.
- Load only the files needed for the active task.

Use `python forge/scripts/assistant/collect_context.py --topic <core|agents|discussions>` to emit focused context file lists for AI coding tools.

## Roadmap

- **Phase 1: Discussions Intelligence**
  - Extract problems, resolutions, status, and type from repository discussions.
- **Phase 2: Issue Intelligence**
  - Prioritize backlog health, ownership gaps, and blocker patterns.
- **Phase 3: Milestone Planner**
  - Transform repository signals into milestone and execution plans.
- **Phase 4: Cross-Repo Pattern Engine**
  - Detect repeat failure/success patterns across repositories.

## Quick Start (Scaffold)

```bash
python examples/example_discussion_run.py
```

This repository currently provides a minimal architecture skeleton intended as a foundation for production-grade expansion.
