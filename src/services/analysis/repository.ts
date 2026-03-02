import { git } from '../git.js';
import { ObservedFacts, RepositoryIdentity } from '../../contracts/analysis.js';
import { StackAnalyzer } from './stack.js';
import { StructureAnalyzer } from './structure.js';
import { AssistantContextAnalyzer } from './assistant-context.js';

/**
 * Orchestrator for repository analysis.
 * Ensures analysis is always scoped from the repository root.
 */
export class RepositoryAnalyzer {
  /**
   * Performs a comprehensive repository analysis.
   * @param cwd Initial directory to resolve repo root from.
   */
  async analyze(cwd: string): Promise<ObservedFacts> {
    // 1. Resolve canonical Git root
    // We change to cwd temporarily or just use git service which uses process.cwd()
    // but the requirement says: "resolves the canonical Git root through the existing Git service,
    // and coordinates the domain analyzers from that root."
    
    // Ensure we are in a repo
    await git.assertInRepo();
    const repoRoot = await git.getRepoRoot();

    // 2. Gather repository identity
    const repository = await this.getIdentity();

    // 3. Run domain analyzers
    const stackAnalyzer = new StackAnalyzer(repoRoot);
    const structureAnalyzer = new StructureAnalyzer(repoRoot);
    const assistantContextAnalyzer = new AssistantContextAnalyzer(repoRoot);

    const [stack, structure, assistantContext] = await Promise.all([
      stackAnalyzer.analyze(),
      structureAnalyzer.analyze(),
      assistantContextAnalyzer.analyze(),
    ]);

    return {
      repository,
      stack,
      structure,
      assistantContext,
      rawFindings: {},
    };
  }

  /**
   * Collects repository identity metadata.
   */
  private async getIdentity(): Promise<RepositoryIdentity> {
    const [name, branch, commitHash, remote] = await Promise.all([
      git.getRepoName(),
      git.getBranch(),
      git.getCommitHash(),
      git.getRemoteUrl(),
    ]);

    return {
      name,
      branch,
      commitHash,
      remote,
    };
  }
}

export const repositoryAnalyzer = new RepositoryAnalyzer();
