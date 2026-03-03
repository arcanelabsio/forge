import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runAnalysis } from '../../../src/services/analysis/run.js';
import { readFile, access, readdir, writeFile } from 'node:fs/promises';
import { git } from '../../../src/services/git.js';
import { initializeSidecar } from '../../../src/services/sidecar.js';
import { persistAnalysisRun, deriveAnalysisPaths } from '../../../src/services/analysis/artifacts.js';

vi.mock('node:fs/promises');
vi.mock('../../../src/services/git.js');
vi.mock('../../../src/services/sidecar.js');
vi.mock('../../../src/services/analysis/artifacts.js');

describe('runAnalysis', () => {
  const repoRoot = '/fake/repo';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(git.assertInRepo).mockResolvedValue(undefined);
    vi.mocked(git.getRepoRoot).mockResolvedValue(repoRoot);
    vi.mocked(git.getRepoName).mockResolvedValue('fake-repo');
    vi.mocked(git.getBranch).mockResolvedValue('main');
    vi.mocked(git.getCommitHash).mockResolvedValue('abc123456');
    vi.mocked(git.getRemoteUrl).mockResolvedValue('https://github.com/fake/repo.git');

    vi.mocked(initializeSidecar).mockResolvedValue({
      repoRoot,
      config: { sidecarDir: '.forge' },
    } as any);

    vi.mocked(deriveAnalysisPaths).mockReturnValue({
      base: '/fake/repo/.forge/analysis',
      runs: '/fake/repo/.forge/analysis/runs',
      latest: '/fake/repo/.forge/analysis/latest.json',
    });
  });

  it('performs a complete analysis run', async () => {
    // Mock FS for analyzers
    vi.mocked(readFile).mockImplementation(async (filePath) => {
      if (filePath.toString().endsWith('package.json')) {
        return JSON.stringify({
          dependencies: {
            'next': 'latest',
            'react': 'latest',
          },
          devDependencies: {
            'typescript': 'latest',
            'vitest': 'latest',
          }
        });
      }
      throw new Error('File not found');
    });

    vi.mocked(access).mockImplementation(async (filePath) => {
      const p = filePath.toString();
      if (p.endsWith('package-lock.json')) return;
      if (p.endsWith('tsconfig.json')) return;
      if (p.endsWith('README.md')) return;
      if (p.endsWith('src/index.ts')) return;
      if (p.endsWith('CLAUDE.md')) return;
      throw new Error('Access denied');
    });

    vi.mocked(readdir).mockImplementation(async (dirPath) => {
      if (dirPath === repoRoot) {
        return [
          { name: 'src', isDirectory: () => true },
          { name: 'tests', isDirectory: () => true },
          { name: 'package.json', isDirectory: () => false },
        ] as any;
      }
      return [];
    });

    const run = await runAnalysis(repoRoot);

    expect(run).toBeDefined();
    expect(run.observedFacts.repository.name).toBe('fake-repo');
    expect(run.observedFacts.stack.language).toBe('typescript');
    expect(run.observedFacts.stack.frameworks).toContain('nextjs');
    expect(run.observedFacts.stack.frameworks).toContain('react');
    expect(run.observedFacts.stack.tools).toContain('typescript');
    expect(run.observedFacts.stack.tools).toContain('vitest');
    expect(run.observedFacts.stack.packageManager).toBe('npm');
    
    expect(run.observedFacts.structure.directories).toContain('src');
    expect(run.observedFacts.structure.directories).toContain('tests');

    expect(run.observedFacts.assistantContext.hasInstructions).toBe(true);
    expect(run.observedFacts.assistantContext.instructionsPath).toBe('CLAUDE.md');

    expect(persistAnalysisRun).toHaveBeenCalled();
    expect(writeFile).toHaveBeenCalled(); // For SUMMARY.md
  });

  it('generates recommendations based on missing facts', async () => {
    // Empty repo
    vi.mocked(readFile).mockRejectedValue(new Error('no package.json'));
    vi.mocked(access).mockRejectedValue(new Error('not found'));
    vi.mocked(readdir).mockResolvedValue([]);

    const run = await runAnalysis(repoRoot);

    expect(run.recommendations.length).toBeGreaterThan(0);
    
    // Flat repository structure recommendation
    const recStruc01 = run.recommendations.find(r => r.id === 'REC-STRUC-01');
    expect(recStruc01).toBeDefined();

    // Missing assistant instructions recommendation
    const recAsst01 = run.recommendations.find(r => r.id === 'REC-ASST-01');
    expect(recAsst01).toBeDefined();
  });

  it('generates recommendation for inconsistent TypeScript', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify({
      dependencies: {},
      devDependencies: {}
    }));
    vi.mocked(access).mockRejectedValue(new Error('not found'));
    vi.mocked(readdir).mockResolvedValue([]);

    const run = await runAnalysis(repoRoot);
    
    // Inconsistent TypeScript recommendation (language=typescript but tools NOT including 'typescript')
    // StackAnalyzer defaults to typescript if package.json exists.
    const recStack01 = run.recommendations.find(r => r.id === 'REC-STACK-01');
    expect(recStack01).toBeDefined();
  });
});
