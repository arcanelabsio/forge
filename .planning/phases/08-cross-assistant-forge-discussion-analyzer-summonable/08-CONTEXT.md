# Phase 8: Cross-Assistant Forge Discussion Analyzer Summonable - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning
**Source:** User request plus attached `gh-discussion-analyzer.agent.md`

<domain>
## Phase Boundary

This phase takes the behavior currently encoded in `/Users/ajitg/Downloads/gh-discussion-analyzer.agent.md` and turns it into a Forge-managed summonable that can be installed across supported code assistant environments.

The phase must:

- install a named summonable called `forge-discussion-analyzer`
- make that summonable available through assistant-native invocation surfaces such as Copilot `/agent` selection or the closest equivalent in other assistants
- let users select `forge-discussion-analyzer` and then ask a question, without requiring them to paste or ship the entire legacy `.agent.md` body as prompt context each time
- move the heavy operational logic, script execution, downloads, discussion fetching, and preprocessing into Forge-managed runtime code and sidecar artifacts
- use Forge-managed compact artifacts so the installed assistant asset can stay small while still producing high-quality analysis

This phase is about summonability and runtime architecture, not about adding more assistants beyond the currently supported set.
</domain>

<decisions>
## Implementation Decisions

### Locked Decisions

- The summonable name should be `forge-discussion-analyzer`.
- The user experience should mirror the Copilot mental model: select the summonable, then ask a question.
- Forge should own the script and download behavior instead of embedding that operational bulk directly inside the installed assistant asset.
- The attached `gh-discussion-analyzer.agent.md` is the behavioral source to preserve, but its content should be re-expressed through Forge runtime components and compact summonable instructions.
- The feature should work across supported code assistant contexts, not only GitHub Copilot.
- Context usage should be minimized so models spend tokens on analysis, not on repeatedly ingesting a large static instruction file.

### Claude's Discretion

- The exact artifact format Forge uses to prepare compact discussion-analysis context, as long as it is durable and reviewable under `.forge`
- Whether the summonable installs as a single file, a directory, or a small manifest per assistant, as long as the installed UX is native to that assistant
- The exact invocation bridge between assistant prompt text and Forge runtime execution, as long as it is explicit, testable, and sidecar-safe
- How closely non-Copilot assistants can match `/agent` selection semantics, as long as the equivalent experience is documented and consistent
</decisions>

<specifics>
## Specific Ideas

- The installed summonable should likely be named `forge-discussion-analyzer` in every assistant surface where naming rules allow it.
- Forge should preprocess fetched discussions into compact digests or indexed artifacts before the model sees them.
- The assistant-facing asset should delegate to Forge runtime commands and sidecar artifacts rather than carrying a long embedded workflow.
- The same underlying analysis engine should serve Copilot, Claude, Codex, and Gemini, with only the summonable wrapper varying per assistant.
</specifics>

<deferred>
## Deferred Ideas

- Additional discussion-analysis personas beyond `forge-discussion-analyzer`
- Hosted artifact sync or remote storage of discussion digests
- Automatic background refresh of analysis context without explicit user invocation
</deferred>

---

*Phase: 08-cross-assistant-forge-discussion-analyzer-summonable*
*Context gathered: 2026-03-03 via attached agent instruction and direct user requirements*
