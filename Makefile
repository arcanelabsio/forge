SHELL := /bin/zsh

.PHONY: release release-check release-tag

VERSION_ARG := $(word 2,$(MAKECMDGOALS))
FORWARD_ARGS := $(filter-out release release-check release-tag $(VERSION_ARG),$(MAKECMDGOALS))

release:
	@if [ -z "$(VERSION_ARG)" ]; then \
		echo "Usage: make release v1.0.0"; \
		echo "Example: make release v1.0.0"; \
		exit 1; \
	fi
	npm run release:local -- "$(VERSION_ARG)" --publish $(FORWARD_ARGS)

release-check:
	@if [ -z "$(VERSION_ARG)" ]; then \
		echo "Usage: make release-check v1.0.0"; \
		echo "Example: make release-check v1.0.0"; \
		exit 1; \
	fi
	npm run release:local -- "$(VERSION_ARG)" $(FORWARD_ARGS)

release-tag:
	@if [ -z "$(VERSION_ARG)" ]; then \
		echo "Usage: make release-tag v1.0.0"; \
		echo "Example: make release-tag v1.0.0"; \
		exit 1; \
	fi
	@VERSION=$$(echo "$(VERSION_ARG)" | sed 's/^v//'); \
	TAG="v$$VERSION"; \
	BRANCH=$$(git branch --show-current); \
	git push origin "$$BRANCH"
	if ! git rev-parse "$$TAG" >/dev/null 2>&1; then \
		git tag -a "$$TAG" -m "$$TAG"; \
	fi
	git push origin "$$TAG"
	if ! gh release view "$$TAG" >/dev/null 2>&1; then \
		gh release create "$$TAG" --verify-tag --title "$$TAG" --notes "## Install\n\nRun:\n\n\tnpx forge-ai-assist@latest\n\nForge installs the Copilot runtime globally under ~/.copilot and installs the forge-discussion-analyzer agent.\n\n## Notes\n\n- bundled runtime dependencies are shipped in the npm package so npx installs work without follow-on npm install repair steps\n- the Copilot install surface keeps only forge-discussion-analyzer and removes the legacy generic forge-agent asset\n- discussion analysis runs persist full trace artifacts under .forge/discussions/analysis for debugging and auditability\n- the installed Copilot agent uses Forge as the processor, asks for approval once for the Forge command path, and avoids raw gh api graphql fallback when Forge is available\n\n## Verify\n\nRun:\n\n\tnode \"\$$HOME/.copilot/forge/bin/forge.mjs\" --help\n\nThen in Copilot use /agent and select forge-discussion-analyzer."; \
	else \
		echo "GitHub Release $$TAG already exists; skipping create."; \
	fi

%:
	@:
