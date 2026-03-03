import { SummonableEntry } from '../../contracts/summonable-entry.js';

/**
 * Shared entry renderer.
 *
 * This service takes a SummonableEntry (assistant-agnostic model) and converts
 * it into a standardized Markdown representation that can be consumed by
 * most AI assistants.
 */
export class EntryRenderer {
  /**
   * Renders a SummonableEntry as a Markdown document.
   *
   * @param entry The summonable entry model.
   * @returns A rendered Markdown string.
   */
  renderToMarkdown(entry: SummonableEntry): string {
    const lines: string[] = [];

    // Header and Purpose
    lines.push(`# ${entry.displayName}`);
    lines.push('');
    lines.push(entry.purpose);
    lines.push('');

    // Instructions
    lines.push('## Instructions');
    lines.push(entry.instructions);
    lines.push('');

    // Commands
    if (entry.commands.length > 0) {
      lines.push('## Commands');
      lines.push('');
      for (const cmd of entry.commands) {
        lines.push(`### ${cmd.name}`);
        lines.push(cmd.description);
        lines.push('');
        lines.push(`Usage: \`${cmd.usage}\``);
        lines.push('');
        if (cmd.examples && cmd.examples.length > 0) {
          lines.push('Examples:');
          for (const example of cmd.examples) {
            lines.push(`- \`${example}\``);
          }
          lines.push('');
        }
      }
    }

    // Capabilities
    if (entry.capabilities.length > 0) {
      lines.push('## Capabilities');
      for (const cap of entry.capabilities) {
        lines.push(`- **${cap.name}**: ${cap.description}`);
      }
      lines.push('');
    }

    // Principles
    if (entry.principles.length > 0) {
      lines.push('## Principles');
      for (const p of entry.principles) {
        lines.push(`- ${p}`);
      }
      lines.push('');
    }

    return lines.join('\n').trim();
  }
}

export const entryRenderer = new EntryRenderer();
