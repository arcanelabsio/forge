export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserFacingError";
  }
}

/**
 * Thrown when a command is run outside of a Git repository but requires one.
 */
export class RepositoryRequiredError extends UserFacingError {
  constructor(message = "Not in a Git repository. Forge repository flows must be run inside a Git repository.") {
    super(message);
    this.name = "RepositoryRequiredError";
  }
}

/**
 * Thrown when a subprocess (like Git) fails in a way that should be user-visible.
 */
export class SubprocessError extends UserFacingError {
  constructor(message: string, public readonly exitCode?: number, public readonly command?: string) {
    super(message);
    this.name = "SubprocessError";
  }
}

/**
 * Thrown when a plan is requested but no repository analysis exists.
 */
export class AnalysisRequiredError extends UserFacingError {
  constructor(message = 'No repository analysis found. Please run "forge analyze" before generating a plan.') {
    super(message);
    this.name = "AnalysisRequiredError";
  }
}
