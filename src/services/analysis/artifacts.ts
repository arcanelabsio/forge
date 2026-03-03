import path from 'node:path';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { SidecarContext } from '../sidecar.js';
import { readMetadata, writeMetadata } from '../metadata.js';
import { ANALYSIS_SUBDIR, RUNS_SUBDIR, LATEST_RUN_POINTER } from '../../config/analysis.js';
import { AnalysisRun, AnalysisRunSummary } from '../../contracts/analysis.js';

/**
 * Resolved paths for analysis artifacts.
 */
export interface AnalysisPaths {
  /**
   * Root directory for analysis artifacts within .forge sidecar.
   */
  base: string;

  /**
   * Directory for historical analysis runs.
   */
  runs: string;

  /**
   * Path to the latest analysis run JSON artifact.
   */
  latest: string;
}

export interface SidecarRunPaths {
  base: string;
  runs: string;
  latest: string;
}

export function deriveSidecarRunPaths(
  context: SidecarContext,
  baseSubdir: string,
  runsSubdir: string,
  latestPointer: string
): SidecarRunPaths {
  const base = path.join(context.sidecarPath, baseSubdir);
  return {
    base,
    runs: path.join(base, runsSubdir),
    latest: path.join(base, latestPointer),
  };
}

/**
 * Derives the analysis paths from the sidecar context.
 */
export function deriveAnalysisPaths(context: SidecarContext): AnalysisPaths {
  return deriveSidecarRunPaths(context, ANALYSIS_SUBDIR, RUNS_SUBDIR, LATEST_RUN_POINTER);
}

/**
 * Updates the sidecar metadata with the summary of an analysis run.
 */
export async function registerAnalysisRun(
  context: SidecarContext,
  summary: AnalysisRunSummary
): Promise<void> {
  const metadata = await readMetadata(context.metadataPath);
  if (!metadata) {
    throw new Error(`Metadata file not found at ${context.metadataPath}`);
  }

  // Initialize analysis section if it doesn't exist
  if (!metadata.analysis) {
    metadata.analysis = {
      history: [],
    };
  }

  metadata.analysis.lastRunId = summary.id;
  metadata.analysis.history.push(summary);
  metadata.updatedAt = new Date().toISOString();

  await writeMetadata(context.metadataPath, metadata);
}

/**
 * Persists an analysis run to disk, updates the 'latest' pointer, and
 * registers the run in the sidecar metadata.
 *
 * This performs three operations:
 * 1. A durable historical record in the `runs/` subdirectory.
 * 2. A copy to the `latest.json` pointer for easy retrieval.
 * 3. A summary entry in the sidecar metadata index.
 */
export async function persistAnalysisRun(
  context: SidecarContext,
  run: AnalysisRun
): Promise<AnalysisRunSummary> {
  const paths = deriveAnalysisPaths(context);

  // Ensure directories exist
  await mkdir(paths.runs, { recursive: true });

  const filename = `${run.id}.json`;
  const artifactPath = path.join(paths.runs, filename);
  const payload = JSON.stringify(run, null, 2);

  // Write full historical run
  await writeFile(artifactPath, payload, 'utf-8');

  // Update latest pointer with a full copy for immediate consumption
  // rather than forced double-hop lookups from metadata.
  await writeFile(paths.latest, payload, 'utf-8');

  // Return summary for metadata update
  const summary: AnalysisRunSummary = {
    id: run.id,
    timestamp: run.timestamp,
    commitHash: run.observedFacts.repository.commitHash,
    artifactPath: path.relative(context.sidecarPath, artifactPath),
  };

  // Register in metadata index
  await registerAnalysisRun(context, summary);

  return summary;
}

/**
 * Loads the latest analysis run from disk.
 * Returns null if no analysis has been performed.
 */
export async function loadLatestAnalysis(context: SidecarContext): Promise<AnalysisRun | null> {
  const paths = deriveAnalysisPaths(context);
  try {
    const data = await readFile(paths.latest, 'utf-8');
    return JSON.parse(data) as AnalysisRun;
  } catch (err) {
    // No analysis run found or invalid format
    return null;
  }
}
