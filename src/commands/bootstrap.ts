import { git } from "../services/git.js";
import { initializeSidecar } from "../services/sidecar.js";
import { writeMetadata } from "../services/metadata.js";

/**
 * Handles the repository bootstrap command.
 * 
 * Performs the initial repository setup for Forge:
 * 1. Confirms the current directory is within a Git repository.
 * 2. Initializes or reuses the Forge sidecar directory (.forge).
 * 3. Records the bootstrap run in metadata history.
 * 4. Prints a concise success summary.
 * 
 * This command respects the sidecar-only boundary and does not modify 
 * the host repository outside the .forge directory.
 */
export async function bootstrapCommand(): Promise<void> {
  // 1. Resolve the Git root (throws RepositoryRequiredError if not in a repo)
  const repoRoot = await git.getRepoRoot();

  // 2. Initialize the Forge sidecar (ensures directory exists)
  const { sidecarPath, metadataPath, metadata } = await initializeSidecar(repoRoot);

  // 3. Populate bootstrap-specific metadata and record history
  const now = new Date().toISOString();
  
  metadata.bootstrap = {
    completedAt: now,
    repoRootPath: repoRoot,
  };

  metadata.history.push({
    type: "bootstrap",
    timestamp: now,
  });

  // Ensure metadata updates are persisted
  await writeMetadata(metadataPath, metadata);

  // 4. Print status summary
  console.log("Forge repository bootstrap successful.");
  console.log(`- Repository: ${repoRoot}`);
  console.log(`- Sidecar: ${sidecarPath}`);
  console.log(`- Metadata: v${metadata.version}`);
}
