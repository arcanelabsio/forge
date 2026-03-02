import { TechnologyStack } from '../../contracts/analysis.js';

export class StackAnalyzer {
  constructor(private repoRoot: string) {}

  async analyze(): Promise<TechnologyStack> {
    return {
      language: 'typescript',
      frameworks: [],
      tools: [],
    };
  }
}
