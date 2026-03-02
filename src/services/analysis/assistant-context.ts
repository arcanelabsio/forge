import { AssistantContextFindings } from '../../contracts/analysis.js';

export class AssistantContextAnalyzer {
  constructor(private repoRoot: string) {}

  async analyze(): Promise<AssistantContextFindings> {
    return {
      hasInstructions: false,
      hasCustomSkills: false,
      availableSkills: [],
    };
  }
}
