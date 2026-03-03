import { execa } from 'execa';
import { GitHubRepositoryRef } from '../contracts/discussions.js';
import { RepositoryRequiredError, UnsupportedGitHubRemoteError } from '../lib/errors.js';

export function parseGitHubRepositoryRemote(remoteUrl: string): GitHubRepositoryRef | null {
  const normalized = remoteUrl.trim();
  const patterns = [
    /^https:\/\/github\.com\/(?<owner>[^/]+)\/(?<repo>[^/]+?)(?:\.git)?\/?$/i,
    /^git@github\.com:(?<owner>[^/]+)\/(?<repo>[^/]+?)(?:\.git)?$/i,
    /^ssh:\/\/git@github\.com\/(?<owner>[^/]+)\/(?<repo>[^/]+?)(?:\.git)?\/?$/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match?.groups?.owner && match.groups.repo) {
      return {
        owner: match.groups.owner,
        name: match.groups.repo,
        remoteUrl: normalized,
      };
    }
  }

  return null;
}

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
   * Returns the current branch name.
   */
  async getBranch(): Promise<string> {
    try {
      const { stdout } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
      return stdout.trim();
    } catch {
      return 'unknown';
    }
  }

  /**
   * Returns the current commit hash.
   */
  async getCommitHash(): Promise<string> {
    try {
      const { stdout } = await execa('git', ['rev-parse', 'HEAD']);
      return stdout.trim();
    } catch {
      return 'unknown';
    }
  }

  /**
   * Returns the remote URL for 'origin' if available.
   */
  async getRemoteUrl(): Promise<string | undefined> {
    try {
      const { stdout } = await execa('git', ['remote', 'get-url', 'origin']);
      return stdout.trim();
    } catch {
      return undefined;
    }
  }

  async getGitHubRepository(): Promise<GitHubRepositoryRef> {
    const remoteUrl = await this.getRemoteUrl();

    if (!remoteUrl) {
      throw new UnsupportedGitHubRemoteError('No origin remote was found for the current repository.');
    }

    const repository = parseGitHubRepositoryRemote(remoteUrl);
    if (!repository) {
      throw new UnsupportedGitHubRemoteError(
        `Forge only supports GitHub remotes for discussions fetches. Current origin: ${remoteUrl}`
      );
    }

    return repository;
  }

  /**
   * Returns the repository name inferred from the root directory name.
   */
  async getRepoName(): Promise<string> {
    const root = await this.getRepoRoot();
    const { basename } = await import('node:path');
    return basename(root);
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
