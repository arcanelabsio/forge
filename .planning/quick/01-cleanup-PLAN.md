---
phase: 02-cleanup
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - forge/
  - test-zod.ts
  - forge-ai-assist-0.1.0.tgz
  - .github/copilot-instructions.md
  - .planning/PROJECT.md
  - .planning/ROADMAP.md
  - .planning/codebase/STACK.md
  - .planning/codebase/ARCHITECTURE.md
  - .planning/codebase/STRUCTURE.md
  - .planning/codebase/CONVENTIONS.md
  - .planning/codebase/INTEGRATIONS.md
  - .planning/codebase/TESTING.md
  - .planning/codebase/CONCERNS.md
autonomous: true
requirements: []
must_haves:
  truths:
    - "The forge/ directory is completely removed from the filesystem and git index."
    - "Temporary files test-zod.ts and forge-ai-assist-0.1.0.tgz are removed."
    - "No references to Python, pyproject.toml, or the forge/ directory remain in the .planning/ documents or Copilot instructions."
  artifacts:
    - path: ".github/copilot-instructions.md"
      provides: "Updated instructions without Python references"
---

<objective>
Remove the legacy Python scaffold and all associated references to transition the repository fully to a Node.js/TypeScript project.
</objective>

<tasks>

<task type="auto">
  <name>Task 1: Delete physical files and git tracking</name>
  <files>forge/, test-zod.ts, forge-ai-assist-0.1.0.tgz</files>
  <action>
    1. Run `git rm -rf forge/` to remove the tracked Python scaffold.
    2. Run `rm test-zod.ts forge-ai-assist-0.1.0.tgz` to remove untracked temporary files.
  </action>
  <verify>
    <automated>ls -d forge/ test-zod.ts forge-ai-assist-0.1.0.tgz 2>/dev/null | grep . || echo "Files removed"</automated>
  </verify>
  <done>Physical files and git tracking for the Python scaffold are gone.</done>
</task>

<task type="auto">
  <name>Task 2: Scrub Python references from planning and config files</name>
  <files>.github/copilot-instructions.md, .planning/PROJECT.md, .planning/ROADMAP.md, .planning/codebase/*.md</files>
  <action>
    Update the following files to remove sections describing the Python framework, scripts, and architecture:
    - .github/copilot-instructions.md: Remove 'Priority order' #2 and #3, and 'Fast context targets'.
    - .planning/PROJECT.md: Update 'Current State' to reflect that the Python scaffold has been removed.
    - .planning/codebase/*.md: Delete or rewrite these files as they are currently 100% focused on the Python implementation. Since Phase 1 (Node.js/TS Bootstrap) is complete, these should be replaced with placeholders or analysis of the new TS structure.
  </action>
  <verify>
    <automated>grep -riE "python|forge/|pyproject" .planning/ .github/ | grep -v "node_modules" || echo "References scrubbed"</automated>
  </verify>
  <done>No legacy Python references remain in the documentation.</done>
</task>

</tasks>

<success_criteria>
The repository is a clean TypeScript project with no trace of the initial Python scaffold in the source tree or planning metadata.
</success_criteria>
