import { GitHubRepositoryRef } from './discussions.js';

export interface IssueFilters {
  when?: 'today' | 'yesterday' | 'last-week';
  after?: string;
  before?: string;
  state: 'open' | 'closed' | 'all';
  label?: string;
  dateField: 'createdAt' | 'updatedAt';
  limit: number;
}

export interface IssueRecord {
  id: string;
  number: number;
  title: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string | null;
  state: 'open' | 'closed';
  author?: string;
  labels: string[];
  bodyText: string;
  commentsCount: number;
}

export interface IssueRun {
  version: '1.0';
  id: string;
  timestamp: string;
  repository: GitHubRepositoryRef;
  filters: IssueFilters;
  pageInfo: {
    hasNextPage: boolean;
    fetchedPages: number;
    nextPage?: number;
  };
  issueCount: number;
  issues: IssueRecord[];
}

export type IssueStatus = 'open' | 'closed' | 'blocked' | 'in-progress';

export type IssueKind =
  | 'bug'
  | 'feature-request'
  | 'documentation'
  | 'maintenance'
  | 'question'
  | 'task';

export interface PreparedIssueRecord {
  number: number;
  title: string;
  url: string;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  state: 'open' | 'closed';
  status: IssueStatus;
  kind: IssueKind;
  issue: string;
  resolution: string;
  keyContext: string[];
  actionItems: string[];
  teamMentions: string[];
  searchableText: string;
}

export interface PreparedIssueDigest {
  version: '1.0';
  id: string;
  sourceRunId: string;
  timestamp: string;
  repository: GitHubRepositoryRef;
  filters: IssueFilters;
  totals: {
    issues: number;
    states: Record<string, number>;
    statuses: Record<string, number>;
    kinds: Record<string, number>;
    labels: Record<string, number>;
  };
  records: PreparedIssueRecord[];
}

export interface IssueSummaryArtifact {
  version: '1.0';
  id: string;
  timestamp: string;
  question: string;
  repository: GitHubRepositoryRef;
  sourceRunId: string;
  source: 'live-fetch';
  filters: {
    when?: string;
    after?: string;
    before?: string;
    state?: 'open' | 'closed' | 'all';
    label?: string;
    dateField?: 'createdAt' | 'updatedAt';
  };
  issueCount: number;
  stateBreakdown: Record<string, number>;
  labelBreakdown: Record<string, number>;
  answer: string;
}
