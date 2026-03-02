import { FileSystemSummary } from '../../contracts/analysis.js';

export class StructureAnalyzer {
  constructor(private repoRoot: string) {}

  async analyze(): Promise<FileSystemSummary> {
    return {
      directories: [],
      criticalFiles: [],
      entryPoints: [],
    };
  }
}
