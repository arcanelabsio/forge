import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { PreparedDiscussionDigest, DiscussionAnalysisTrace } from '../../contracts/discussions.js';
import { DiscussionArtifactsRequiredError, DiscussionsOnlyAnalyzerError } from '../../lib/errors.js';
import { loadLatestPreparedDiscussionDigest, prepareLatestDiscussionDigest } from './prepare.js';
import { deriveSidecarContext } from '../sidecar.js';
import { runDiscussionFetch } from './run.js';

export interface RunDiscussionAnalyzerOptions {
  cwd: string;
  question: string;
  refresh?: boolean;
  token?: string;
  when?: string;
  after?: string;
  before?: string;
  category?: string;
  limit?: number;
}

const DEFAULT_ANALYZER_REFRESH_LIMIT = 1000;

export async function runDiscussionAnalyzer(options: RunDiscussionAnalyzerOptions): Promise<string> {
  const digest = options.refresh
    ? await refreshAndPrepareDigest(options)
    : (await loadOrPrepareDigest(options.cwd));

  const answer = renderAnswer(digest, options.question);
  await persistAnalysisTrace(options.cwd, digest, options.question, answer);
  return answer;
}

async function loadOrPrepareDigest(cwd: string): Promise<PreparedDiscussionDigest> {
  const digest = await loadLatestPreparedDiscussionDigest(cwd);
  if (digest) {
    return digest;
  }

  return prepareLatestDiscussionDigest(cwd);
}

function renderAnswer(digest: PreparedDiscussionDigest, question: string): string {
  const normalizedQuestion = question.trim().toLowerCase();
  if (!normalizedQuestion) {
    throw new DiscussionArtifactsRequiredError('A question is required when running forge-discussion-analyzer.');
  }
  assertDiscussionScopedQuestion(question, normalizedQuestion);

  const countSummary = deriveCountSummary(digest, question, normalizedQuestion);
  const includePatterns = shouldIncludePatternSection(normalizedQuestion);
  const includeEffectiveness = shouldIncludeEffectivenessSection(normalizedQuestion);
  const records = (countSummary?.records ?? filterRelevantRecords(digest, normalizedQuestion)).slice(0, 8);

  const lines: string[] = [
    `# GitHub Discussions Digest: ${digest.repository.owner}/${digest.repository.name}`,
    '',
    `**Question:** ${question}  `,
    `**Source Run:** \`${digest.sourceRunId}\`  `,
    `**Data Prepared:** ${digest.timestamp}  `,
    `**Total Discussions:** ${digest.totals.discussions}  `,
    '',
  ];

  if (countSummary) {
    lines.push('## Count Summary');
    lines.push(`**Counted Discussions:** ${countSummary.count}  `);
    lines.push(`**Basis:** ${countSummary.basis}  `);
    lines.push('');
  }

  lines.push(
    '## Summary Overview',
    '| Discussion | Category | Status | Key Takeaway |',
    '| :--- | :--- | :--- | :--- |',
  );

  for (const record of records) {
    lines.push(
      `| [#${record.number} ${record.title}] | ${record.kind} | ${record.status} | ${record.resolution} |`
    );
  }

  lines.push('', '## Detailed Summaries', '');

  for (const record of records) {
    lines.push(`#### ${record.title} (#${record.number})`);
    lines.push(`* **Status:** ${record.status}`);
    lines.push(`* **Category:** ${record.kind}`);
    lines.push(`* **The Issue:** ${record.issue}`);
    lines.push(`* **Key Context:** ${record.keyContext.join(' | ') || 'No additional context extracted.'}`);
    lines.push(`* **The Resolution:** ${record.resolution}`);
    lines.push(`* **Action Items:** ${record.actionItems.join('; ')}`);
    lines.push('');
  }

  if (includePatterns) {
    lines.push('## Pattern Analysis', '');
    lines.push('**Issue Distribution:**');
    Object.entries(digest.totals.kinds)
      .sort((a, b) => b[1] - a[1])
      .forEach(([kind, count]) => {
        lines.push(`- ${kind}: ${count}`);
      });
    lines.push('');
  }

  if (includeEffectiveness) {
    lines.push('## Support Effectiveness Analysis', '');
    lines.push('#### Strengths ✅');
    lines.push(`- ${digest.totals.statuses.resolved ?? 0} discussions show a resolved outcome.`);
    lines.push('');
    lines.push('#### Weaknesses ❌');
    lines.push(`- ${digest.totals.statuses.unresolved ?? 0} discussions still appear unresolved.`);
    lines.push('');
  }

  return lines.join('\n').trim();
}

function filterRelevantRecords(digest: PreparedDiscussionDigest, question: string) {
  const keywords = question
    .split(/\W+/)
    .map((token) => token.toLowerCase())
    .filter((token) => token.length >= 4);

  if (keywords.length === 0) {
    return digest.records;
  }

  const scored = digest.records.map((record) => {
    const haystack = `${record.title} ${record.issue} ${record.resolution} ${record.category} ${record.kind}`.toLowerCase();
    const score = keywords.reduce((acc, keyword) => acc + (haystack.includes(keyword) ? 1 : 0), 0);
    return { record, score };
  });

  const matching = scored.filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score);
  return matching.length > 0 ? matching.map((entry) => entry.record) : digest.records;
}

function shouldIncludePatternSection(question: string): boolean {
  return ['pattern', 'trend', 'common', 'theme', 'recurring'].some((keyword) => question.includes(keyword));
}

function shouldIncludeEffectivenessSection(question: string): boolean {
  return ['effectiveness', 'support quality', 'response time', 'sla', 'performance'].some((keyword) =>
    question.includes(keyword)
  );
}

function assertDiscussionScopedQuestion(question: string, normalizedQuestion: string): void {
  const mentionsIssues = /\bissues?\b/.test(normalizedQuestion);
  const mentionsDiscussions = /\bdiscussions?\b/.test(normalizedQuestion);

  if (!mentionsIssues || mentionsDiscussions) {
    return;
  }

  const correctedQuestion = question.replace(/\bissues?\b/gi, 'discussions');
  throw new DiscussionsOnlyAnalyzerError(
    [
      'forge-discussion-analyzer works with GitHub Discussions only.',
      `Did you mean: "${correctedQuestion}"`,
      '',
      'To narrow the results, ask with filters such as:',
      '- category: "Show discussions in the Ideas category from last week"',
      '- relative window: "Count discussions created last week"',
      '- explicit dates: "Summarize discussions after 2026-01-01 and before 2026-01-31"',
      '- combined scope: "List unresolved discussions in Q&A after 2026-02-15"',
    ].join('\n')
  );
}

async function refreshAndPrepareDigest(options: RunDiscussionAnalyzerOptions): Promise<PreparedDiscussionDigest> {
  await runDiscussionFetch({
    cwd: options.cwd,
    token: options.token,
    when: options.when,
    after: options.after,
    before: options.before,
    category: options.category,
    limit: options.limit ?? DEFAULT_ANALYZER_REFRESH_LIMIT,
  });

  return prepareLatestDiscussionDigest(options.cwd);
}

function deriveCountSummary(
  digest: PreparedDiscussionDigest,
  question: string,
  normalizedQuestion: string,
): { count: number; basis: string; records: PreparedDiscussionDigest['records'] } | null {
  if (!/(count|how many|number of|total)/.test(normalizedQuestion)) {
    return null;
  }

  const temporalFilter = extractTemporalFilter(question);
  const useCreatedAt = /\bcreated\b/.test(normalizedQuestion);
  const records = digest.records.filter((record) => {
    if (!temporalFilter) {
      return true;
    }

    const timestamp = new Date(useCreatedAt ? record.createdAt : record.updatedAt);
    if (Number.isNaN(timestamp.getTime())) {
      return false;
    }
    if (temporalFilter.after && timestamp < temporalFilter.after) {
      return false;
    }
    if (temporalFilter.before && timestamp > temporalFilter.before) {
      return false;
    }
    return true;
  });

  return {
    count: records.length,
    basis: temporalFilter
      ? `${useCreatedAt ? 'createdAt' : 'updatedAt'} filtered by ${temporalFilter.label}`
      : `${useCreatedAt ? 'createdAt' : 'updatedAt'} across the prepared digest`,
    records,
  };
}

function extractTemporalFilter(question: string): { after?: Date; before?: Date; label: string } | null {
  const lowered = question.toLowerCase();
  const sinceMatch = question.match(/\bsince\s+(\d{4}-\d{2}-\d{2})\b/i);
  if (sinceMatch) {
    return {
      after: new Date(`${sinceMatch[1]}T00:00:00.000Z`),
      label: `since ${sinceMatch[1]}`,
    };
  }

  const afterMatch = question.match(/\bafter\s+(\d{4}-\d{2}-\d{2})\b/i);
  const beforeMatch = question.match(/\bbefore\s+(\d{4}-\d{2}-\d{2})\b/i);
  if (afterMatch || beforeMatch) {
    return {
      after: afterMatch ? new Date(`${afterMatch[1]}T00:00:00.000Z`) : undefined,
      before: beforeMatch ? new Date(`${beforeMatch[1]}T23:59:59.999Z`) : undefined,
      label: [
        afterMatch ? `after ${afterMatch[1]}` : null,
        beforeMatch ? `before ${beforeMatch[1]}` : null,
      ].filter(Boolean).join(' and '),
    };
  }

  if (/\btoday\b/.test(lowered)) {
    const now = new Date();
    return {
      after: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)),
      before: now,
      label: 'today',
    };
  }

  if (/\byesterday\b/.test(lowered)) {
    const now = new Date();
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    return {
      after: new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000),
      before: startOfToday,
      label: 'yesterday',
    };
  }

  if (/\blast week\b|\blast-week\b/.test(lowered)) {
    const now = new Date();
    return {
      after: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      before: now,
      label: 'last week',
    };
  }

  return null;
}

async function persistAnalysisTrace(
  cwd: string,
  digest: PreparedDiscussionDigest,
  question: string,
  answer: string,
): Promise<void> {
  const context = deriveSidecarContext(cwd);
  const timestamp = new Date().toISOString();
  const traceId = `${digest.id}-${timestamp.replace(/[:.]/g, '-')}`;
  const runsPath = path.join(context.sidecarPath, 'discussions', 'analysis', 'runs');
  const runDir = path.join(runsPath, traceId);
  await mkdir(runDir, { recursive: true });

  const trace: DiscussionAnalysisTrace = {
    version: '1.0',
    id: traceId,
    timestamp,
    question,
    repository: digest.repository,
    digestId: digest.id,
    sourceRunId: digest.sourceRunId,
    answer,
    digest,
  };

  await writeFile(path.join(runDir, 'trace.json'), JSON.stringify(trace, null, 2), 'utf8');
  await writeFile(path.join(runDir, 'question.txt'), `${question.trim()}\n`, 'utf8');
  await writeFile(path.join(runDir, 'answer.md'), answer, 'utf8');
  await writeFile(path.join(runDir, 'digest.json'), JSON.stringify(digest, null, 2), 'utf8');
  await writeFile(path.join(runDir, 'digest.md'), renderDigestSnapshot(digest), 'utf8');

  await writeFile(path.join(context.sidecarPath, 'discussions', 'analysis', 'latest-answer.json'), JSON.stringify(trace, null, 2), 'utf8');
  await writeFile(path.join(context.sidecarPath, 'discussions', 'analysis', 'latest-answer.md'), answer, 'utf8');
}

function renderDigestSnapshot(digest: PreparedDiscussionDigest): string {
  const lines = [
    `# Analysis Input Digest: ${digest.repository.owner}/${digest.repository.name}`,
    '',
    `**Digest ID:** \`${digest.id}\`  `,
    `**Source Run:** \`${digest.sourceRunId}\`  `,
    `**Timestamp:** ${digest.timestamp}  `,
    `**Discussion Count:** ${digest.totals.discussions}  `,
    '',
    '## Records',
    '',
  ];

  for (const record of digest.records) {
    lines.push(`### #${record.number}: ${record.title}`);
    lines.push(`- Status: ${record.status}`);
    lines.push(`- Kind: ${record.kind}`);
    lines.push(`- Category: ${record.category}`);
    lines.push(`- Issue: ${record.issue}`);
    lines.push(`- Resolution: ${record.resolution}`);
    lines.push('');
  }

  return lines.join('\n').trim();
}
