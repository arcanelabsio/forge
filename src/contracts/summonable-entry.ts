/**
 * Shared internal model for Forge’s summonable entry content.
 *
 * A summonable entry represents a capability that Forge exposes to an assistant,
 * such as a planning agent or an analysis specialist. This model remains
 * assistant-agnostic while adapters handle native presentation (e.g., Markdown,
 * JSON, or specialized prompt formats).
 */

export interface SummonableCapability {
  name: string;
  description: string;
  benefits: string[];
}

export interface SummonableCommand {
  name: string;
  description: string;
  usage: string;
}

/**
 * SummonableEntry: The core model for an assistant-facing Forge capability.
 */
export interface SummonableEntry {
  /** Unique identity for this entry (e.g., 'forge-agent', 'planning-specialist') */
  id: string;
  /** Display name for the assistant persona */
  displayName: string;
  /** High-level purpose of this assistant persona */
  purpose: string;
  /** Core instructions/prompt for the assistant */
  instructions: string;
  /** Specific capabilities exposed by this entry */
  capabilities: SummonableCapability[];
  /** Commands available to the assistant */
  commands: SummonableCommand[];
  /** Operating principles for the assistant */
  principles: string[];
  /** Optional metadata for assistant-specific extensions */
  metadata?: Record<string, any>;
}

/**
 * Repository of summonable entries available in the Forge runtime.
 */
export interface SummonableEntryRegistry {
  entries: SummonableEntry[];
  defaultEntryId: string;
}
