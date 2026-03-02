import { copilotAdapter } from '../services/assistants/copilot.js';

/**
 * Handles the CLI surface for installing the GitHub Copilot proof.
 *
 * This command exposes a focused path for the Phase 3 proof of concept,
 * allowing users to summon the native /agent workflow.
 */
export async function installCopilotCommand(cwd: string): Promise<void> {
  try {
    console.log('Installing GitHub Copilot Forge adapter...');
    
    // Perform installation via the adapter
    const targetPath = await copilotAdapter.install(cwd);
    
    console.log(`Success! GitHub Copilot entrypoint written to: ${targetPath}`);
    console.log('\nYou can now summon the Forge agent in Copilot via:');
    console.log('  /plan - Generate a repository planning draft');
  } catch (error) {
    console.error('Failed to install GitHub Copilot adapter:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
