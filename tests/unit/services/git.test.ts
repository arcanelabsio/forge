import { describe, it, expect, vi, beforeEach } from 'vitest';
import { git, parseGitHubRepositoryRemote } from '../../../src/services/git.js';
import { execa } from 'execa';
import { RepositoryRequiredError } from '../../../src/lib/errors.js';

vi.mock('execa', () => ({
  execa: vi.fn(),
}));

describe('GitService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRepoRoot', () => {
    it('returns the git repository root', async () => {
      vi.mocked(execa).mockResolvedValue({ stdout: '/repo/root\n' } as any);

      const root = await git.getRepoRoot();

      expect(root).toBe('/repo/root');
      expect(execa).toHaveBeenCalledWith('git', ['rev-parse', '--show-toplevel']);
    });

    it('throws RepositoryRequiredError if not in a git repo', async () => {
      vi.mocked(execa).mockRejectedValue({ stderr: 'fatal: not a git repository (or any of the parent directories): .git' } as any);

      await expect(git.getRepoRoot()).rejects.toThrow(RepositoryRequiredError);
    });

    it('rethrows other errors', async () => {
      vi.mocked(execa).mockRejectedValue(new Error('something else'));

      await expect(git.getRepoRoot()).rejects.toThrow('something else');
    });
  });

  describe('isInsideWorkTree', () => {
    it('returns true if inside a worktree', async () => {
      vi.mocked(execa).mockResolvedValue({ stdout: 'true\n' } as any);

      const result = await git.isInsideWorkTree();

      expect(result).toBe(true);
      expect(execa).toHaveBeenCalledWith('git', ['rev-parse', '--is-inside-work-tree']);
    });

    it('returns false if not inside a worktree', async () => {
      vi.mocked(execa).mockResolvedValue({ stdout: 'false\n' } as any);

      const result = await git.isInsideWorkTree();

      expect(result).toBe(false);
    });

    it('returns false on error', async () => {
      vi.mocked(execa).mockRejectedValue(new Error());

      const result = await git.isInsideWorkTree();

      expect(result).toBe(false);
    });
  });

  describe('getBranch', () => {
    it('returns the current branch name', async () => {
      vi.mocked(execa).mockResolvedValue({ stdout: 'main\n' } as any);

      const branch = await git.getBranch();

      expect(branch).toBe('main');
      expect(execa).toHaveBeenCalledWith('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
    });

    it('returns "unknown" on error', async () => {
      vi.mocked(execa).mockRejectedValue(new Error());

      const branch = await git.getBranch();

      expect(branch).toBe('unknown');
    });
  });

  describe('getCommitHash', () => {
    it('returns the current commit hash', async () => {
      vi.mocked(execa).mockResolvedValue({ stdout: 'abcdef123456\n' } as any);

      const hash = await git.getCommitHash();

      expect(hash).toBe('abcdef123456');
      expect(execa).toHaveBeenCalledWith('git', ['rev-parse', 'HEAD']);
    });

    it('returns "unknown" on error', async () => {
      vi.mocked(execa).mockRejectedValue(new Error());

      const hash = await git.getCommitHash();

      expect(hash).toBe('unknown');
    });
  });

  describe('getRemoteUrl', () => {
    it('returns the remote URL for origin', async () => {
      vi.mocked(execa).mockResolvedValue({ stdout: 'https://github.com/user/repo.git\n' } as any);

      const url = await git.getRemoteUrl();

      expect(url).toBe('https://github.com/user/repo.git');
      expect(execa).toHaveBeenCalledWith('git', ['remote', 'get-url', 'origin']);
    });

    it('returns undefined on error', async () => {
      vi.mocked(execa).mockRejectedValue(new Error());

      const url = await git.getRemoteUrl();

      expect(url).toBeUndefined();
    });
  });

  describe('parseGitHubRepositoryRemote', () => {
    it('parses HTTPS GitHub remotes', () => {
      expect(parseGitHubRepositoryRemote('https://github.com/user/repo.git')).toEqual({
        owner: 'user',
        name: 'repo',
        remoteUrl: 'https://github.com/user/repo.git',
      });
    });

    it('parses SSH GitHub remotes', () => {
      expect(parseGitHubRepositoryRemote('git@github.com:user/repo.git')).toEqual({
        owner: 'user',
        name: 'repo',
        remoteUrl: 'git@github.com:user/repo.git',
      });
    });

    it('returns null for unsupported remotes', () => {
      expect(parseGitHubRepositoryRemote('https://gitlab.com/user/repo.git')).toBeNull();
    });
  });

  describe('getGitHubRepository', () => {
    it('returns the parsed GitHub repository from origin', async () => {
      vi.mocked(execa).mockResolvedValue({ stdout: 'https://github.com/user/repo.git\n' } as any);

      await expect(git.getGitHubRepository()).resolves.toEqual({
        owner: 'user',
        name: 'repo',
        remoteUrl: 'https://github.com/user/repo.git',
      });
    });
  });

  describe('getRepoName', () => {
    it('returns the directory name of the repository root', async () => {
      vi.mocked(execa).mockResolvedValue({ stdout: '/home/user/my-repo\n' } as any);

      const name = await git.getRepoName();

      expect(name).toBe('my-repo');
    });
  });

  describe('assertInRepo', () => {
    it('does nothing if inside a worktree', async () => {
      vi.mocked(execa).mockResolvedValue({ stdout: 'true\n' } as any);

      await expect(git.assertInRepo()).resolves.toBeUndefined();
    });

    it('throws RepositoryRequiredError if not in a worktree', async () => {
      vi.mocked(execa).mockResolvedValue({ stdout: 'false\n' } as any);

      await expect(git.assertInRepo()).rejects.toThrow(RepositoryRequiredError);
    });
  });
});
