import { execa } from 'execa';
import { RepositoryRequiredError } from '../lib/errors.js';

/**
 * Service for Git operations and repository state detection.
 */
export class GitService {
  /**
   * Returns the canonical absolute path to the repository root.
   * Throws RepositoryRequiredError if not inside a Git worktree.
   */
  async getRepoRoot(): Promise<string> {
    try {
      const { stdout } = await execa('git', ['rev-parse', '--show-toplevel']);
      return stdout.trim();
    } catch (error: any) {
      if (error.stderr?.includes('not a git repository')) {
        throw new RepositoryRequiredError();
      }
      throw error;
    }
  }

  /**
   * Confirms if the current working directory is inside a Git repository.
   */
  async isInsideWorkTree(): Promise<boolean> {
    try {
      const { stdout } = await execa('git', ['rev-parse', '--is-inside-work-tree']);
      return stdout.trim() === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Asserts that the current directory is inside a Git repository.
   * Throws RepositoryRequiredError if not.
   */
  async assertInRepo(): Promise<void> {
    const isInRepo = await this.isInsideWorkTree();
    if (!isInRepo) {
      throw new RepositoryRequiredError();
    }
  }
}

export const git = new GitService();
