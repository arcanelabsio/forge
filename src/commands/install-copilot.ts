import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { copilotAdapter } from '../services/assistants/copilot.js';
import { forgeAgentEntry } from '../services/assistants/forge-agent.js';

/**
 * Handles the CLI surface for installing the GitHub Copilot proof.
 *
 * This command exposes a focused path for the Phase 3 proof of concept,
 * allowing users to summon the native /agent workflow.
 */
export async function installCopilotCommand(cwd: string): Promise<void> {
  try {
    console.log('Installing GitHub Copilot Forge adapter...');
    
    // Resolve installation target and content
    const targetPath = copilotAdapter.getInstallTarget(cwd, forgeAgentEntry);
    const content = copilotAdapter.render(forgeAgentEntry);
    
    // Ensure the target directory exists
    await mkdir(path.dirname(targetPath), { recursive: true });
    
    // Write the native entry asset
    await writeFile(targetPath, content, 'utf8');
    
    console.log(`Success! GitHub Copilot entrypoint written to: ${targetPath}`);
    console.log('\nYou can now summon the Forge agent in Copilot via:');
    console.log('  /plan - Generate a repository planning draft');
  } catch (error) {
    console.error('Failed to install GitHub Copilot adapter:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
