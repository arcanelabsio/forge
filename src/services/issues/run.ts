import { IssueRun } from '../../contracts/issues.js';
import { git } from '../git.js';
import { resolveGitHubToken } from '../discussions/auth.js';
import { normalizeIssueFilters } from './filters.js';
import { fetchGitHubIssues } from './fetch.js';

export interface RunIssueFetchOptions {
  cwd: string;
  token?: string;
  when?: string;
  after?: string;
  before?: string;
  state?: string;
  label?: string;
  dateField?: 'createdAt' | 'updatedAt';
  limit?: number;
}

export async function runIssueFetch(options: RunIssueFetchOptions): Promise<IssueRun> {
  process.chdir(options.cwd);

  await git.getRepoRoot();
  const repository = await git.getGitHubRepository();
  const token = resolveGitHubToken({ explicitToken: options.token });
  const filters = normalizeIssueFilters({
    when: options.when,
    after: options.after,
    before: options.before,
    state: options.state,
    label: options.label,
    dateField: options.dateField,
    limit: options.limit,
  });

  const fetched = await fetchGitHubIssues({
    repository,
    token,
    filters,
  });

  const run: IssueRun = {
    version: '1.0',
    id: new Date().toISOString().replace(/[:.]/g, '-'),
    timestamp: new Date().toISOString(),
    repository,
    filters,
    pageInfo: fetched.pageInfo,
    issueCount: fetched.issues.length,
    issues: fetched.issues,
  };

  return run;
}
