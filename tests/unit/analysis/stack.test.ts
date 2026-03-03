import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StackAnalyzer } from '../../../src/services/analysis/stack.js';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

vi.mock('node:fs/promises');

describe('StackAnalyzer', () => {
  const repoRoot = '/fake/repo';
  let analyzer: StackAnalyzer;

  beforeEach(() => {
    vi.clearAllMocks();
    analyzer = new StackAnalyzer(repoRoot);
  });

  it('detects typescript and frameworks from package.json', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify({
      dependencies: {
        'next': '14.0.0',
        'react': '18.2.0',
        'express': '4.18.2'
      },
      devDependencies: {
        'typescript': '5.3.0',
        'vitest': '1.0.0',
        'prettier': '3.1.0'
      }
    }));

    vi.mocked(access).mockImplementation(async (p) => {
      if (p.toString().endsWith('package-lock.json')) return;
      throw new Error('Not found');
    });

    const stack = await analyzer.analyze();

    expect(stack.language).toBe('typescript');
    expect(stack.frameworks).toContain('nextjs');
    expect(stack.frameworks).toContain('react');
    expect(stack.frameworks).toContain('express');
    expect(stack.tools).toContain('typescript');
    expect(stack.tools).toContain('vitest');
    expect(stack.tools).toContain('prettier');
    expect(stack.packageManager).toBe('npm');
  });

  it('detects yarn package manager', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify({}));
    vi.mocked(access).mockImplementation(async (p) => {
      if (p.toString().endsWith('yarn.lock')) return;
      throw new Error('Not found');
    });

    const stack = await analyzer.analyze();
    expect(stack.packageManager).toBe('yarn');
  });

  it('detects pnpm package manager', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify({}));
    vi.mocked(access).mockImplementation(async (p) => {
      if (p.toString().endsWith('pnpm-lock.yaml')) return;
      throw new Error('Not found');
    });

    const stack = await analyzer.analyze();
    expect(stack.packageManager).toBe('pnpm');
  });

  it('returns unknown language and undefined package manager if no files found', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('No package.json'));
    vi.mocked(access).mockRejectedValue(new Error('No lock files'));

    const stack = await analyzer.analyze();
    expect(stack.language).toBe('unknown');
    expect(stack.packageManager).toBeUndefined();
    expect(stack.frameworks).toEqual([]);
    expect(stack.tools).toEqual([]);
  });
});
