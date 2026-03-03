# Releasing Forge

## Quick Steps

1. Publish npm:

```bash
export NPM_TOKEN=your_npm_token_here
make release v1.0.0
```

2. Push the matching tag and GitHub Release:

```bash
make release-tag v1.0.0
```

3. Verify the public install:

```bash
npx forge-ai-assist@latest
node "$HOME/.copilot/forge/bin/forge.mjs" --help
```

Expected result:

- `~/.copilot/agents/forge-discussion-analyzer.agent.md` exists
- `~/.copilot/forge/node_modules` exists
- no manual `npm install` is needed inside `~/.copilot/forge`
