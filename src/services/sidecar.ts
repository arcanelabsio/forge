import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { SIDECAR_DIR_NAME, METADATA_FILENAME } from '../config/sidecar.js';
import { readMetadata, writeMetadata, createNewMetadata, SidecarMetadata } from './metadata.js';

/**
 * Resolved paths to the Forge sidecar and its metadata.
 */
export interface SidecarContext {
  /**
   * Root directory of the repository.
   */
  repoPath: string;

  /**
   * Path to the `.forge` sidecar directory.
   */
  sidecarPath: string;

  /**
   * Path to the sidecar's metadata file.
   */
  metadataPath: string;
}

/**
 * Derives the sidecar context from the repository root.
 */
export function deriveSidecarContext(repoRoot: string): SidecarContext {
  const repoPath = path.resolve(repoRoot);
  const sidecarPath = path.join(repoPath, SIDECAR_DIR_NAME);
  const metadataPath = path.join(sidecarPath, METADATA_FILENAME);

  return {
    repoPath,
    sidecarPath,
    metadataPath,
  };
}

/**
 * Initializes the Forge sidecar in the given repository root.
 * If the sidecar already exists, it reads and returns the existing metadata.
 * Otherwise, it creates the sidecar directory and initializes default metadata.
 */
export async function initializeSidecar(repoRoot: string): Promise<SidecarContext & { metadata: SidecarMetadata }> {
  const context = deriveSidecarContext(repoRoot);
  
  // Ensure sidecar directory exists
  await mkdir(context.sidecarPath, { recursive: true });

  let metadata = await readMetadata(context.metadataPath);

  if (!metadata) {
    // First run initialization
    metadata = createNewMetadata();
  } else {
    // Refresh timestamp for existing sidecar
    metadata.updatedAt = new Date().toISOString();
  }

  await writeMetadata(context.metadataPath, metadata);

  return {
    ...context,
    metadata,
  };
}
