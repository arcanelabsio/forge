import fs from 'node:fs/promises';
import path from 'node:path';
import { assistantRegistry, AssistantAdapter } from './registry.js';
import { AssistantId, AssistantOperationResult } from '../../contracts/assistants.js';
import { SummonableEntry } from '../../contracts/summonable-entry.js';
import { forgeSummonableEntries } from './summonables.js';

/**
 * AssistantInstallService: Orchestrates the installation and update of 
 * AI assistant runtime entries across the supported assistant set.
 */
export class AssistantInstallService {
  getSupportedAssistantIds(): AssistantId[] {
    return assistantRegistry.listCapabilities().map((capability) => capability.id);
  }

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
    return this.installSelected(cwd, entry, this.getSupportedAssistantIds());
  }

  async installSelected(
    cwd: string,
    entry: SummonableEntry,
    assistantIds: AssistantId[]
  ): Promise<AssistantOperationResult[]> {
    return this.installEntriesSelected(cwd, [entry], assistantIds);
  }

  async installDefaultSummonables(cwd: string, assistantIds: AssistantId[]): Promise<AssistantOperationResult[]> {
    return this.installEntriesSelected(cwd, forgeSummonableEntries, assistantIds);
  }

  async installEntriesSelected(
    cwd: string,
    entries: SummonableEntry[],
    assistantIds: AssistantId[]
  ): Promise<AssistantOperationResult[]> {
    const results: AssistantOperationResult[] = [];

    for (const assistantId of assistantIds) {
      const adapter = assistantRegistry.get(assistantId);
      if (!adapter) {
        results.push({
          id: assistantId,
          status: 'failed',
          message: `Adapter for assistant '${assistantId}' not found in registry.`,
        });
        continue;
      }

      try {
        const result = await this.installMany(cwd, entries, adapter);
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

  async installMany(
    cwd: string,
    entries: SummonableEntry[],
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

    let installedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const entry of entries) {
      const result = await this.installOne(cwd, entry, adapter);
      if (result.status === 'failed') {
        return result;
      }
      if (result.status === 'success') {
        if (result.message.includes('updated')) {
          updatedCount += 1;
        } else {
          installedCount += 1;
        }
      } else if (result.status === 'skipped') {
        skippedCount += 1;
      }
    }

    if (installedCount === 0 && updatedCount === 0) {
      return {
        id: adapter.id,
        status: 'skipped',
        message: `${adapter.name} summonables are already up to date (${skippedCount} checked).`,
      };
    }

    const segments = [
      installedCount > 0 ? `${installedCount} installed` : null,
      updatedCount > 0 ? `${updatedCount} updated` : null,
      skippedCount > 0 ? `${skippedCount} unchanged` : null,
    ].filter(Boolean);

    return {
      id: adapter.id,
      status: 'success',
      message: `${adapter.name} summonables ready (${segments.join(', ')}).`,
    };
  }

  async installOne(cwd: string, entry: SummonableEntry, adapter: AssistantAdapter): Promise<AssistantOperationResult> {
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
