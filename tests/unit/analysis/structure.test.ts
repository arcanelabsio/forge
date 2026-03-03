import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StructureAnalyzer } from '../../../src/services/analysis/structure.js';
import { readdir, access } from 'node:fs/promises';
import path from 'node:path';

vi.mock('node:fs/promises');

describe('StructureAnalyzer', () => {
  const repoRoot = '/fake/repo';
  let analyzer: StructureAnalyzer;

  beforeEach(() => {
    vi.clearAllMocks();
    analyzer = new StructureAnalyzer(repoRoot);
  });

  it('detects top-level directories and critical files', async () => {
    vi.mocked(readdir).mockImplementation(async (dirPath) => {
      if (dirPath === repoRoot) {
        return [
          { name: 'src', isDirectory: () => true },
          { name: 'tests', isDirectory: () => true },
          { name: '.git', isDirectory: () => true },
          { name: 'node_modules', isDirectory: () => true },
          { name: 'package.json', isDirectory: () => false },
          { name: 'README.md', isDirectory: () => false },
        ] as any;
      }
      return [];
    });

    vi.mocked(access).mockImplementation(async (p) => {
      if (p.toString().endsWith('package.json')) return;
      if (p.toString().endsWith('README.md')) return;
      if (p.toString().endsWith('tsconfig.json')) return;
      if (p.toString().endsWith('src/index.ts')) return;
      throw new Error('Not found');
    });

    const structure = await analyzer.analyze();

    expect(structure.directories).toContain('src');
    expect(structure.directories).toContain('tests');
    expect(structure.directories).not.toContain('.git');
    expect(structure.directories).not.toContain('node_modules');

    expect(structure.criticalFiles).toContain('package.json');
    expect(structure.criticalFiles).toContain('README.md');
    expect(structure.criticalFiles).toContain('tsconfig.json');

    expect(structure.entryPoints).toContain('src/index.ts');
  });

  it('returns empty results when no items found', async () => {
    vi.mocked(readdir).mockRejectedValue(new Error('No items found'));
    vi.mocked(access).mockRejectedValue(new Error('Not found'));

    const structure = await analyzer.analyze();

    expect(structure.directories).toEqual([]);
    expect(structure.criticalFiles).toEqual([]);
    expect(structure.entryPoints).toEqual([]);
  });
});
