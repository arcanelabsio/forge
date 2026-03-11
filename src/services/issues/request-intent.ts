import { IssueFilters } from '../../contracts/issues.js';
import { normalizeIssueFilters } from './filters.js';

export interface IssueAnalyzerIntentOptions {
  question: string;
  forceRefresh?: boolean;
  refreshAnalysis?: boolean;
  when?: string;
  after?: string;
  before?: string;
  state?: string;
  label?: string;
  limit?: number;
}

export interface IssueAnalyzerIntent {
  question: string;
  normalizedQuestion: string;
  scope: 'issues' | 'discussions';
  refreshMode: 'fetch';
  refreshReason:
    | 'explicit-force-refresh'
    | 'explicit-refresh-analysis'
    | 'current-status-question'
    | 'time-scoped-question'
    | 'default-live-query';
  parsedFilters: IssueFilters;
  temporalField: 'createdAt' | 'updatedAt';
  answerShape: {
    wantsCounts: boolean;
    wantsPatterns: boolean;
    wantsEffectiveness: boolean;
    wantsLabelHealth: boolean;
  };
  redirectQuestion?: string;
}

export function analyzeIssueRequestIntent(
  options: IssueAnalyzerIntentOptions,
): IssueAnalyzerIntent {
  const question = options.question.trim();
  const normalizedQuestion = question.toLowerCase();
  const scope = detectScope(normalizedQuestion);

  const extractedFilters = extractQuestionFilters(question, normalizedQuestion);
  const temporalField = detectTemporalField(normalizedQuestion, extractedFilters);
  const chosenLabel = options.label ?? extractedFilters.label;
  const chosenState = options.state ?? extractedFilters.state;
  const parsedFilters = normalizeIssueFilters({
    when: options.when ?? extractedFilters.when,
    after: options.after ?? extractedFilters.after,
    before: options.before ?? extractedFilters.before,
    label: chosenLabel,
    state: chosenState,
    dateField: temporalField,
    limit: options.limit,
  });

  const refreshReason = resolveRefreshReason({
    normalizedQuestion,
    forceRefresh: options.forceRefresh,
    refreshAnalysis: options.refreshAnalysis,
    filters: parsedFilters,
  });

  return {
    question,
    normalizedQuestion,
    scope,
    refreshMode: 'fetch',
    refreshReason,
    parsedFilters,
    temporalField,
    answerShape: {
      wantsCounts: /\b(count|how many|number of|total)\b/.test(normalizedQuestion),
      wantsPatterns: ['pattern', 'trend', 'common', 'theme', 'recurring', 'gap', 'gaps'].some((keyword) =>
        normalizedQuestion.includes(keyword),
      ),
      wantsEffectiveness: ['effectiveness', 'stability', 'closure rate', 'triage quality', 'response time'].some(
        (keyword) => normalizedQuestion.includes(keyword),
      ),
      wantsLabelHealth: hasCurrentStatusIntent(normalizedQuestion) && Boolean(parsedFilters.label),
    },
    redirectQuestion: scope === 'discussions' ? question.replace(/\bdiscussions?\b/gi, 'issues') : undefined,
  };
}

function detectScope(normalizedQuestion: string): 'issues' | 'discussions' {
  const mentionsDiscussions = /\bdiscussions?\b/.test(normalizedQuestion);
  const mentionsIssues = /\bissues?\b/.test(normalizedQuestion);
  if (mentionsDiscussions && !mentionsIssues) {
    return 'discussions';
  }
  return 'issues';
}

function detectTemporalField(
  normalizedQuestion: string,
  extractedFilters: { when?: string; after?: string; before?: string; label?: string; state?: string },
): 'createdAt' | 'updatedAt' {
  if (/\b(updated|activity|active|recent activity)\b/.test(normalizedQuestion)) {
    return 'updatedAt';
  }
  if (/\b(created|opened|open)\b/.test(normalizedQuestion)) {
    return 'createdAt';
  }
  if (extractedFilters.when || extractedFilters.after || extractedFilters.before) {
    return 'createdAt';
  }
  return 'updatedAt';
}

function resolveRefreshReason(input: {
  normalizedQuestion: string;
  forceRefresh?: boolean;
  refreshAnalysis?: boolean;
  filters: IssueFilters;
}): IssueAnalyzerIntent['refreshReason'] {
  if (input.forceRefresh) {
    return 'explicit-force-refresh';
  }
  if (input.refreshAnalysis) {
    return 'explicit-refresh-analysis';
  }
  if (hasCurrentStatusIntent(input.normalizedQuestion)) {
    return 'current-status-question';
  }
  if (hasExplicitTimeScope(input.normalizedQuestion, input.filters)) {
    return 'time-scoped-question';
  }
  return 'default-live-query';
}

function hasCurrentStatusIntent(normalizedQuestion: string): boolean {
  if (/\b(current status|latest status|current state|latest state|up to date)\b/.test(normalizedQuestion)) {
    return true;
  }
  if (/\bhow\s+is\s+.+\s+looking\b/.test(normalizedQuestion) || /\bhow\s+are\s+.+\s+looking\b/.test(normalizedQuestion)) {
    return true;
  }
  if (/\bhow\s+(?:is|are)\s+.+\s+(?:doing|going|performing)\b/.test(normalizedQuestion)) {
    return true;
  }

  const currentnessWord = /\b(current|latest|fresh)\b/.test(normalizedQuestion);
  const statusWord = /\b(status|state|standing|situation|update|updates)\b/.test(normalizedQuestion);
  return currentnessWord && statusWord;
}

function hasExplicitTimeScope(normalizedQuestion: string, filters: IssueFilters): boolean {
  if (filters.when || filters.after || filters.before) {
    return true;
  }

  return (
    /\bbetween\b/.test(normalizedQuestion) ||
    /\b(since|after|before|from|during)\b/.test(normalizedQuestion) ||
    /\b(today|yesterday|last week|last-week)\b/.test(normalizedQuestion)
  );
}

function extractQuestionFilters(
  question: string,
  normalizedQuestion: string,
): { when?: string; after?: string; before?: string; label?: string; state?: string } {
  const when = extractRelativeWindow(normalizedQuestion);
  const between = extractBetweenRange(question);
  return {
    when,
    after:
      between?.after ??
      extractSingleDate(question, 'since') ??
      extractSingleDate(question, 'after') ??
      extractSingleDate(question, 'from'),
    before: between?.before ?? extractSingleDate(question, 'before'),
    label: extractLabel(question),
    state: extractState(normalizedQuestion),
  };
}

function extractRelativeWindow(normalizedQuestion: string): string | undefined {
  if (/\btoday\b/.test(normalizedQuestion)) return 'today';
  if (/\byesterday\b/.test(normalizedQuestion)) return 'yesterday';
  if (/\b(?:last week|last-week|last_week|last 1 week|in the last week|in the last 1 week|past week|past 1 week|last 7 days|past 7 days)\b/.test(normalizedQuestion)) {
    return 'last-week';
  }
  return undefined;
}

function extractBetweenRange(question: string): { after?: string; before?: string } | null {
  const match = question.match(/\bbetween\s+(.+?)\s+and\s+(.+?)(?:[?.!,]|$)/i);
  if (!match) {
    return null;
  }

  const after = normalizeDatePhrase(match[1]);
  const before = normalizeDatePhrase(match[2]);
  if (!after && !before) {
    return null;
  }

  return { after: after ?? undefined, before: before ?? undefined };
}

function extractSingleDate(question: string, keyword: 'since' | 'after' | 'before' | 'from'): string | undefined {
  const regex = new RegExp(
    `\\b${keyword}\\s+(.+?)(?=\\b(?:and|in the|under the|under|label|state|created|updated|issues?|discussions?)\\b|[?.!,]|$)`,
    'i',
  );
  const match = question.match(regex);
  if (!match) {
    return undefined;
  }

  return normalizeDatePhrase(match[1]) ?? undefined;
}

function normalizeDatePhrase(raw: string): string | null {
  const trimmed = raw
    .trim()
    .replace(/^on\s+/i, '')
    .replace(/\s+\b(?:in|under)\s+(?:the\s+)?(.+?)\s+label\b.*$/i, '');

  if (!trimmed) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}(?:[ t]\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:z|[+-]\d{2}:\d{2})?)?$/i.test(trimmed)) {
    return trimmed.replace(' ', 'T');
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function extractLabel(question: string): string | undefined {
  const match = question.match(/\b(?:in|under)\s+(?:the\s+)?(.+?)\s+label\b/i);
  if (match?.[1]?.trim()) {
    return match[1].trim();
  }

  const statusMatch = question.match(/\bhow\s+is\s+(.+?)\s+looking\b/i);
  if (isSpecificLabelCandidate(statusMatch?.[1])) {
    return statusMatch[1].trim();
  }

  const doingMatch = question.match(/\bhow\s+(?:is|are)\s+(.+?)\s+(?:doing|going|performing)\b/i);
  if (isSpecificLabelCandidate(doingMatch?.[1])) {
    return doingMatch[1].trim();
  }

  return undefined;
}

function extractState(normalizedQuestion: string): string | undefined {
  if (/\bopen issues?\b/.test(normalizedQuestion) || /\bstate\s+open\b/.test(normalizedQuestion)) {
    return 'open';
  }
  if (/\bclosed issues?\b/.test(normalizedQuestion) || /\bstate\s+closed\b/.test(normalizedQuestion)) {
    return 'closed';
  }
  if (/\ball issues?\b/.test(normalizedQuestion) || /\bstate\s+all\b/.test(normalizedQuestion)) {
    return 'all';
  }
  return undefined;
}

function isSpecificLabelCandidate(value?: string): value is string {
  const trimmed = value?.trim().toLowerCase();
  if (!trimmed) {
    return false;
  }
  return !['it', 'them', 'this', 'that'].includes(trimmed);
}
