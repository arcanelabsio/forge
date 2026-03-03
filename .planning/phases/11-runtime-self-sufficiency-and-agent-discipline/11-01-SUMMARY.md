# 11-01 Summary

Wave 1 made the bundled Copilot runtime dependency-complete at install time.

- `src/services/assistants/install.ts` now copies both `dist` and `node_modules` into `~/.copilot/forge`, writes runtime metadata, and removes the obsolete `forge-agent.agent.md` file during reinstall.
- `src/services/assistants/copilot.ts` now exposes the legacy-agent cleanup list used by the installer.
- `tests/smoke/cli.test.ts` now verifies the installed runtime has `node_modules`, removes the legacy agent file, and can run `node "$HOME/.copilot/forge/bin/forge.mjs" --help` immediately after install.

Verification:

- `npm run build`
- `npm test -- tests/smoke/cli.test.ts`
