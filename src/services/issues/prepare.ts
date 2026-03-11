import {
  IssueKind,
  IssueRun,
  IssueStatus,
  PreparedIssueDigest,
  PreparedIssueRecord,
} from '../../contracts/issues.js';

export function buildPreparedIssueDigest(run: IssueRun): PreparedIssueDigest {
  const records = run.issues.map((issue) => buildPreparedRecord(issue));

  return {
    version: '1.0',
    id: `${run.id}-analysis`,
    sourceRunId: run.id,
    timestamp: new Date().toISOString(),
    repository: run.repository,
    filters: run.filters,
    totals: {
      issues: records.length,
      states: countBy(records.map((record) => record.state)),
      statuses: countBy(records.map((record) => record.status)),
      kinds: countBy(records.map((record) => record.kind)),
      labels: countBy(records.flatMap((record) => record.labels.length > 0 ? record.labels : ['No Label'])),
    },
    records,
  };
}

function buildPreparedRecord(issue: IssueRun['issues'][number]): PreparedIssueRecord {
  const searchableText = buildSearchableText(issue);
  const kind = classifyIssueKind(issue.title, issue.labels, searchableText);
  const status = classifyIssueStatus(issue.state, searchableText);

  return {
    number: issue.number,
    title: issue.title,
    url: issue.url,
    labels: issue.labels,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    state: issue.state,
    status,
    kind,
    issue: truncateSentence(searchableText, 220),
    resolution: inferResolution(issue.state, status),
    keyContext: extractKeyContext(searchableText),
    actionItems: inferActionItems(issue.state, status, kind),
    teamMentions: extractTeamMentions(searchableText),
    searchableText,
  };
}

function classifyIssueKind(title: string, labels: string[], body: string): IssueKind {
  const labelsLower = labels.map((label) => label.toLowerCase());
  const haystack = `${title} ${body}`.toLowerCase();

  if (labelsLower.some((label) => label.includes('bug'))) return 'bug';
  if (labelsLower.some((label) => label.includes('feature') || label.includes('enhancement'))) return 'feature-request';
  if (labelsLower.some((label) => label.includes('doc'))) return 'documentation';
  if (labelsLower.some((label) => label.includes('chore') || label.includes('maintenance') || label.includes('refactor'))) {
    return 'maintenance';
  }
  if (labelsLower.some((label) => label.includes('question') || label.includes('support'))) return 'question';

  if (haystack.includes('bug') || haystack.includes('error') || haystack.includes('fail')) return 'bug';
  if (haystack.includes('feature') || haystack.includes('enhancement') || haystack.includes('request')) return 'feature-request';
  if (haystack.includes('doc') || haystack.includes('documentation')) return 'documentation';
  if (haystack.includes('question') || haystack.includes('how do')) return 'question';
  return 'task';
}

function classifyIssueStatus(state: 'open' | 'closed', body: string): IssueStatus {
  if (state === 'closed') {
    return 'closed';
  }

  const haystack = body.toLowerCase();
  if (haystack.includes('blocked') || haystack.includes('waiting on')) {
    return 'blocked';
  }
  if (haystack.includes('in progress') || haystack.includes('wip')) {
    return 'in-progress';
  }
  return 'open';
}

function inferResolution(state: 'open' | 'closed', status: IssueStatus): string {
  if (state === 'closed') {
    return 'Issue is closed and appears resolved or intentionally completed.';
  }
  if (status === 'blocked') {
    return 'Issue appears blocked on an external dependency or pending action.';
  }
  if (status === 'in-progress') {
    return 'Issue appears in progress but still open.';
  }
  return 'Issue remains open with no explicit closure signal.';
}

function extractKeyContext(body: string): string[] {
  return normalizeWhitespace(body)
    .split('.')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function buildSearchableText(issue: IssueRun['issues'][number]): string {
  const segments = [
    issue.title,
    issue.bodyText,
    issue.labels.join(' '),
  ];
  return normalizeWhitespace(segments.filter(Boolean).join('. '));
}

function extractTeamMentions(body: string): string[] {
  const matches = body.toLowerCase().match(/@[a-z0-9][a-z0-9-_]*/g) ?? [];
  return [...new Set(matches)];
}

function inferActionItems(state: 'open' | 'closed', status: IssueStatus, kind: IssueKind): string[] {
  if (state === 'closed') {
    return ['No immediate action required'];
  }
  if (status === 'blocked') {
    return ['Track blocker owner', 'Revisit after dependency clears'];
  }
  if (kind === 'documentation') {
    return ['Consider documentation update'];
  }
  return ['Confirm owner', 'Define next implementation step'];
}

function countBy(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function truncateSentence(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}
