/**
 * Repository analysis run metadata and durable artifacts.
 *
 * This contract separates observed repository facts from inferred recommendations
 * to ensure that planning logic can distinguish between what is definitively true
 * about the repository and what is suggested by the analysis assistant.
 */

export interface RepositoryIdentity {
  name: string;
  remote?: string;
  branch: string;
  commitHash: string;
}

export interface TechnologyStack {
  language: string;
  frameworks: string[];
  tools: string[];
  packageManager?: string;
}

export interface FileSystemSummary {
  directories: string[];
  criticalFiles: string[];
  entryPoints: string[];
}

export interface AssistantContextFindings {
  hasInstructions: boolean;
  hasCustomSkills: boolean;
  instructionsPath?: string;
  availableSkills: string[];
}

/**
 * Observed Facts: Concrete evidence gathered from the repository.
 */
export interface ObservedFacts {
  repository: RepositoryIdentity;
  stack: TechnologyStack;
  structure: FileSystemSummary;
  assistantContext: AssistantContextFindings;
  rawFindings: Record<string, any>;
}

/**
 * Recommendations: Inferred guidance based on observed facts.
 */
export interface Recommendation {
  id: string;
  category: 'architecture' | 'implementation' | 'security' | 'performance' | 'convention';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  rationale: string;
  suggestedAction?: string;
}

/**
 * AnalysisRun: The complete durable artifact of a repository analysis session.
 */
export interface AnalysisRun {
  /** Schema version for forward/backward compatibility */
  version: '1.0';
  /** Unique identifier for this analysis run (ISO timestamp) */
  id: string;
  /** When the analysis was performed */
  timestamp: string;
  /** Repository facts observed during the run */
  observedFacts: ObservedFacts;
  /** Inferred recommendations based on the observations */
  recommendations: Recommendation[];
}

/**
 * Summary pointer for metadata indexing.
 */
export interface AnalysisRunSummary {
  id: string;
  timestamp: string;
  commitHash: string;
  artifactPath: string;
}
