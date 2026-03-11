import { IssueFilters, IssueRecord } from '../../contracts/issues.js';
import { GitHubRepositoryRef } from '../../contracts/discussions.js';
import { GitHubIssuesFetchError } from '../../lib/errors.js';
import { matchesIssueWindow } from './filters.js';

const GITHUB_ISSUES_PAGE_SIZE = 100;

interface GitHubIssueApiRecord {
  id: number;
  number: number;
  title: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at?: string | null;
  state: 'open' | 'closed';
  user?: {
    login?: string | null;
  } | null;
  labels: Array<{
    name?: string | null;
  }>;
  body?: string | null;
  comments: number;
  pull_request?: Record<string, unknown>;
}

export interface FetchGitHubIssuesOptions {
  repository: GitHubRepositoryRef;
  token: string;
  filters: IssueFilters;
}

export interface FetchGitHubIssuesResult {
  issues: IssueRecord[];
  pageInfo: {
    hasNextPage: boolean;
    fetchedPages: number;
    nextPage?: number;
  };
}

export async function fetchGitHubIssues(
  options: FetchGitHubIssuesOptions,
): Promise<FetchGitHubIssuesResult> {
  const collected: IssueRecord[] = [];
  let page = 1;
  let hasNextPage = true;
  let fetchedPages = 0;

  while (hasNextPage && collected.length < options.filters.limit) {
    fetchedPages += 1;
    const remaining = options.filters.limit - collected.length;
    const pageSize = Math.min(GITHUB_ISSUES_PAGE_SIZE, remaining);

    const response = await fetchIssuesPage(options, page, pageSize);
    const normalized = response
      .filter((issue) => !issue.pull_request)
      .map((issue): IssueRecord => ({
        id: String(issue.id),
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        closedAt: issue.closed_at ?? null,
        state: issue.state,
        author: issue.user?.login ?? undefined,
        labels: issue.labels.map((label) => label.name?.trim()).filter((value): value is string => Boolean(value)),
        bodyText: issue.body ?? '',
        commentsCount: issue.comments,
      }))
      .filter((issue) => matchesIssueWindow(issue[options.filters.dateField], options.filters))
      .filter((issue) => matchesLabelFilter(issue, options.filters.label));

    collected.push(...normalized);

    hasNextPage = response.length === pageSize;
    page += 1;

    if (options.filters.after) {
      const oldestSeen = response.at(-1)?.[toApiDateField(options.filters.dateField)];
      if (oldestSeen && new Date(oldestSeen) < new Date(options.filters.after)) {
        break;
      }
    }
  }

  return {
    issues: collected.slice(0, options.filters.limit),
    pageInfo: {
      hasNextPage,
      fetchedPages,
      nextPage: hasNextPage ? page : undefined,
    },
  };
}

async function fetchIssuesPage(
  options: FetchGitHubIssuesOptions,
  page: number,
  perPage: number,
): Promise<GitHubIssueApiRecord[]> {
  const params = new URLSearchParams({
    state: options.filters.state,
    per_page: String(perPage),
    page: String(page),
    sort: options.filters.dateField === 'createdAt' ? 'created' : 'updated',
    direction: 'desc',
  });
  const url = `https://api.github.com/repos/${options.repository.owner}/${options.repository.name}/issues?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${options.token}`,
    },
  });

  if (!response.ok) {
    throw new GitHubIssuesFetchError(await buildIssueFetchErrorMessage(response));
  }

  return (await response.json()) as GitHubIssueApiRecord[];
}

async function buildIssueFetchErrorMessage(response: Response): Promise<string> {
  const payload = (await response.json().catch(() => null)) as
    | {
        message?: string;
      }
    | null;

  if (payload?.message) {
    return payload.message;
  }

  return 'GitHub issues request failed.';
}

function toApiDateField(dateField: IssueFilters['dateField']): 'created_at' | 'updated_at' {
  return dateField === 'createdAt' ? 'created_at' : 'updated_at';
}

function matchesLabelFilter(issue: IssueRecord, labelFilter?: string): boolean {
  if (!labelFilter) {
    return true;
  }

  const normalized = labelFilter.trim().toLowerCase();
  return issue.labels.some((label) => label.toLowerCase() === normalized);
}
