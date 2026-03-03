# 11-03 Summary

Wave 3 closed the support loop with documentation and explicit UAT coverage.

- `README.md` now documents the runtime-ready install model, the single public Copilot agent, and the expectation that manual `npm install` inside `~/.copilot/forge` is unsupported.
- `docs/releasing.md` now includes release verification for the bundled runtime and the expected Copilot behavior.
- `11-UAT.md` captures the exact feedback scenario so maintainers can reproduce and verify the fix on a target machine.

Verification:

- `npm test`
- `npm run release:check`
