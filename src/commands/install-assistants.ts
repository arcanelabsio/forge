import { assistantInstallService } from '../services/assistants/install.js';
import { forgeAgentEntry } from '../services/assistants/forge-agent.js';
import { AssistantOperationResult } from '../contracts/assistants.js';

/**
 * Handles the CLI surface for installing and updating all supported AI assistants.
 *
 * This command generalizes the Phase 3 Copilot proof to the broader assistant set
 * supported by the Forge adapter registry.
 */
export async function installAssistantsCommand(cwd: string): Promise<void> {
  try {
    console.log('Installing/Updating Forge AI assistant entrypoints...');
    
    const results = await assistantInstallService.installAll(cwd, forgeAgentEntry);
    
    console.log('\nAssistant Status Summary:');
    console.log('-------------------------');
    
    let hasSuccess = false;
    for (const result of results) {
      const statusIcon = getStatusIcon(result.status);
      console.log(`${statusIcon} ${result.id.padEnd(10)}: ${result.message}`);
      if (result.status === 'success' || result.status === 'skipped') {
        hasSuccess = true;
      }
    }
    
    if (hasSuccess) {
      console.log('\nSuccess! At least one assistant entrypoint is ready.');
      console.log('You can now summon the Forge agent in your preferred AI assistant.');
    } else {
      console.log('\nNo assistants were installed or updated. Check the status messages above.');
    }
  } catch (error) {
    console.error('\nFailed to install assistant adapters:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Maps operation status to a user-friendly CLI icon.
 */
function getStatusIcon(status: AssistantOperationResult['status']): string {
  switch (status) {
    case 'success': return '✅';
    case 'skipped': return '⏭️ ';
    case 'no-op':   return '➖';
    case 'failed':  return '❌';
    default:        return '❓';
  }
}
