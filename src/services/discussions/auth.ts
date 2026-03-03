import { GitHubTokenRequiredError } from '../../lib/errors.js';

export interface DiscussionAuthOptions {
  explicitToken?: string;
}

export function resolveGitHubToken(options: DiscussionAuthOptions = {}): string {
  if (options.explicitToken?.trim()) {
    return options.explicitToken.trim();
  }

  const token = process.env.GH_TOKEN?.trim() || process.env.GITHUB_TOKEN?.trim();
  if (!token) {
    throw new GitHubTokenRequiredError();
  }

  return token;
}
