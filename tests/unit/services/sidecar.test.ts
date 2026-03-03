import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initializeSidecar, deriveSidecarContext } from '../../../src/services/sidecar.js';
import { mkdir } from 'node:fs/promises';
import { readMetadata, writeMetadata, createNewMetadata } from '../../../src/services/metadata.js';
import path from 'node:path';

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../../src/services/metadata.js', () => ({
  readMetadata: vi.fn(),
  writeMetadata: vi.fn(),
  createNewMetadata: vi.fn(),
}));

describe('SidecarService', () => {
  const repoRoot = '/repo/root';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('deriveSidecarContext', () => {
    it('derives correct paths from repo root', () => {
      const context = deriveSidecarContext(repoRoot);
      expect(context.repoPath).toBe(path.resolve(repoRoot));
      expect(context.sidecarPath).toBe(path.join(path.resolve(repoRoot), '.forge'));
      expect(context.metadataPath).toBe(path.join(path.resolve(repoRoot), '.forge', 'metadata.json'));
    });
  });

  describe('initializeSidecar', () => {
    it('creates sidecar directory and new metadata if none exists', async () => {
      const mockMetadata = { version: '1.0.0', updatedAt: '2023-01-01T00:00:00.000Z' };
      vi.mocked(readMetadata).mockResolvedValue(null);
      vi.mocked(createNewMetadata).mockReturnValue(mockMetadata as any);
      vi.mocked(writeMetadata).mockResolvedValue(undefined);

      const result = await initializeSidecar(repoRoot);

      expect(mkdir).toHaveBeenCalledWith(expect.stringContaining('.forge'), { recursive: true });
      expect(readMetadata).toHaveBeenCalled();
      expect(createNewMetadata).toHaveBeenCalled();
      expect(writeMetadata).toHaveBeenCalledWith(expect.any(String), mockMetadata);
      expect(result.metadata).toEqual(mockMetadata);
    });

    it('updates existing metadata if it exists', async () => {
      const updatedAt = '2023-01-01T00:00:00.000Z';
      const existingMetadata = { version: '1.0.0', updatedAt };
      // Clone it so we can check if it changed
      vi.mocked(readMetadata).mockResolvedValue({ ...existingMetadata } as any);
      vi.mocked(writeMetadata).mockResolvedValue(undefined);

      const result = await initializeSidecar(repoRoot);

      expect(mkdir).toHaveBeenCalledWith(expect.stringContaining('.forge'), { recursive: true });
      expect(readMetadata).toHaveBeenCalled();
      expect(createNewMetadata).not.toHaveBeenCalled();
      expect(writeMetadata).toHaveBeenCalled();
      
      // updatedAt should have been updated
      expect(result.metadata.updatedAt).not.toBe(updatedAt);
      expect(new Date(result.metadata.updatedAt).getTime()).toBeGreaterThan(0);
    });
  });
});
