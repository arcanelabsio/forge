import fs from 'node:fs/promises';
import path from 'node:path';
import { assistantRegistry, AssistantAdapter } from './registry.js';
import { AssistantId, AssistantOperationResult } from '../../contracts/assistants.js';
import { SummonableEntry } from '../../contracts/summonable-entry.js';

/**
 * AssistantInstallService: Orchestrates the installation and update of 
 * AI assistant runtime entries across the supported assistant set.
 */
export class AssistantInstallService {
  /**
   * Installs or updates all supported assistant entries for a given summonable entry.
   *
   * This method iterates over the registered assistant adapters, 
   * checks their availability, renders native assets, and writes
   * them to their target locations.
   *
   * @param cwd The project root directory
   * @param entry The summonable entry to install/update
   * @returns Structured results for each assistant target
   */
  async installAll(cwd: string, entry: SummonableEntry): Promise<AssistantOperationResult[]> {
    const results: AssistantOperationResult[] = [];
    
    // Get all supported capabilities
    const capabilities = assistantRegistry.listCapabilities();
    
    for (const capability of capabilities) {
      const adapter = assistantRegistry.get(capability.id);
      if (!adapter) {
        results.push({
          id: capability.id,
          status: 'failed',
          message: `Adapter for assistant '${capability.id}' not found in registry.`,
        });
        continue;
      }

      try {
        const result = await this.installOne(cwd, entry, adapter);
        results.push(result);
      } catch (error) {
        results.push({
          id: adapter.id,
          status: 'failed',
          message: `Error installing/updating ${adapter.name}: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }

    return results;
  }

  /**
   * Installs or updates a single assistant entry.
   */
  async installOne(
    cwd: string, 
    entry: SummonableEntry, 
    adapter: AssistantAdapter
  ): Promise<AssistantOperationResult> {
    const availability = await adapter.checkAvailability();
    
    if (!availability.isAvailable) {
      return {
        id: adapter.id,
        status: 'no-op',
        message: availability.reason || `Assistant ${adapter.name} is not available in the current environment.`,
      };
    }

    const targetPath = adapter.getInstallTarget(cwd, entry);
    const content = adapter.render(entry);

    try {
      // Ensure the directory exists
      await fs.mkdir(path.dirname(targetPath), { recursive: true });

      // Check if file already exists
      let existingContent: string | null = null;
      try {
        existingContent = await fs.readFile(targetPath, 'utf8');
      } catch (error) {
        // File does not exist, which is fine
      }

      if (existingContent === content) {
        return {
          id: adapter.id,
          status: 'skipped',
          message: `${adapter.name} entry is already up to date.`,
          filePath: targetPath,
        };
      }

      // Write or update the file
      await fs.writeFile(targetPath, content, 'utf8');

      return {
        id: adapter.id,
        status: 'success',
        message: existingContent === null 
          ? `Successfully installed ${adapter.name} entry.` 
          : `Successfully updated ${adapter.name} entry.`,
        filePath: targetPath,
      };
    } catch (error) {
      return {
        id: adapter.id,
        status: 'failed',
        message: `Failed to write ${adapter.name} entry to ${targetPath}: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}

export const assistantInstallService = new AssistantInstallService();
