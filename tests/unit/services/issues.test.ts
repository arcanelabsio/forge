import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runIssueAnalyzer } from '../../../src/services/issues/analyze.js';
import { analyzeIssueRequestIntent } from '../../../src/services/issues/request-intent.js';
import { fetchGitHubIssues } from '../../../src/services/issues/fetch.js';
import { normalizeIssueFilters } from '../../../src/services/issues/filters.js';
import * as issueRunService from '../../../src/services/issues/run.js';

describe('Issue services', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'forge-issues-'));
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  function mockAnalyzerFetch<T extends { id: string }>(run: T) {
    return vi.spyOn(issueRunService, 'runIssueFetch').mockResolvedValue(run as never);
  }

  it('normalizes relative issue filters and defaults state to all', () => {
    const now = new Date('2026-03-03T12:00:00.000Z');
    const filters = normalizeIssueFilters({ when: 'yesterday', limit: 5, now });

    expect(filters.when).toBe('yesterday');
    expect(filters.after).toBeDefined();
    expect(filters.before).toBeDefined();
    expect(filters.dateField).toBe('createdAt');
    expect(filters.state).toBe('all');
    expect(filters.limit).toBe(5);
  });

  it('fetches issues from GitHub and filters out pull requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([
        {
          id: 1,
          number: 11,
          title: 'Issue one',
          html_url: 'https://github.com/ajitgunturi/forge/issues/11',
          created_at: '2026-03-03T08:00:00.000Z',
          updated_at: '2026-03-03T09:00:00.000Z',
          closed_at: null,
          state: 'open',
          user: { login: 'ajitg' },
          labels: [{ name: 'bug' }],
          body: 'An open bug.',
          comments: 2,
        },
        {
          id: 2,
          number: 12,
          title: 'PR one',
          html_url: 'https://github.com/ajitgunturi/forge/pull/12',
          created_at: '2026-03-03T08:00:00.000Z',
          updated_at: '2026-03-03T09:00:00.000Z',
          closed_at: null,
          state: 'open',
          user: { login: 'ajitg' },
          labels: [{ name: 'bug' }],
          body: 'Actually a pull request.',
          comments: 0,
          pull_request: {},
        },
      ]),
    });

    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchGitHubIssues({
      repository: {
        owner: 'ajitgunturi',
        name: 'forge',
        remoteUrl: 'https://github.com/ajitgunturi/forge.git',
      },
      token: 'token',
      filters: normalizeIssueFilters({
        when: 'today',
        label: 'bug',
        state: 'open',
        limit: 10,
        now: new Date('2026-03-03T12:00:00.000Z'),
      }),
    });

    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]?.title).toBe('Issue one');
    expect(result.issues[0]?.labels).toContain('bug');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('runs forge-issue-analyzer from live fetched issues and saves a summary artifact', async () => {
    const run = {
      version: '1.0' as const,
      id: '2026-03-03T10-00-00-000Z',
      timestamp: '2026-03-03T10:00:00.000Z',
      repository: {
        owner: 'ajitgunturi',
        name: 'forge',
        remoteUrl: 'https://github.com/ajitgunturi/forge.git',
      },
      filters: normalizeIssueFilters({ when: 'today', state: 'all', limit: 10 }),
      pageInfo: {
        hasNextPage: false,
        nextPage: undefined,
        fetchedPages: 1,
      },
      issueCount: 2,
      issues: [
        {
          id: 'I_1',
          number: 201,
          title: 'Bug: install hangs',
          url: 'https://github.com/ajitgunturi/forge/issues/201',
          createdAt: '2026-03-03T08:00:00.000Z',
          updatedAt: '2026-03-03T09:00:00.000Z',
          closedAt: null,
          state: 'open' as const,
          author: 'ajitg',
          labels: ['bug'],
          bodyText: 'Install fails with token setup.',
          commentsCount: 2,
        },
        {
          id: 'I_2',
          number: 202,
          title: 'Chore: docs cleanup',
          url: 'https://github.com/ajitgunturi/forge/issues/202',
          createdAt: '2026-03-03T07:00:00.000Z',
          updatedAt: '2026-03-03T09:30:00.000Z',
          closedAt: '2026-03-03T10:00:00.000Z',
          state: 'closed' as const,
          author: 'ajitg',
          labels: ['documentation'],
          bodyText: 'Close docs cleanup.',
          commentsCount: 1,
        },
      ],
    };

    const fetchSpy = mockAnalyzerFetch(run);

    try {
      const answer = await runIssueAnalyzer({
        cwd: tempDir,
        question: 'summarize all issues',
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(answer).toContain('GitHub Issues Digest');
      expect(answer).toContain('State Summary');
      expect(answer).toContain('Bug: install hangs');

      const latestSummaryRaw = await readFile(
        join(tempDir, '.forge/issues/summary/latest.json'),
        'utf8',
      );
      const latestSummary = JSON.parse(latestSummaryRaw) as {
        question: string;
        answer: string;
        sourceRunId: string;
        source: string;
        issueCount: number;
      };

      expect(latestSummary.question).toBe('summarize all issues');
      expect(latestSummary.answer).toContain('GitHub Issues Digest');
      expect(latestSummary.sourceRunId).toBe('2026-03-03T10-00-00-000Z');
      expect(latestSummary.source).toBe('live-fetch');
      expect(latestSummary.issueCount).toBe(2);
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it('fails fast when the question asks for discussions instead of issues', async () => {
    await expect(
      runIssueAnalyzer({
        cwd: tempDir,
        question: 'show me discussions updated in the last week',
      }),
    ).rejects.toThrow(/Forge analyzes GitHub Issues only/);

    await expect(
      runIssueAnalyzer({
        cwd: tempDir,
        question: 'show me discussions updated in the last week',
      }),
    ).rejects.toThrow(/Want "show me issues updated in the last week" instead/);
  });

  it('parses issue intent filters from question text', () => {
    const intent = analyzeIssueRequestIntent({
      question: 'count open issues created between 2026-01-01 and 2026-01-31 in the bug label',
      limit: 25,
    });

    expect(intent.parsedFilters.after).toBe('2026-01-01T00:00:00.000Z');
    expect(intent.parsedFilters.before).toBe('2026-01-31T23:59:59.999Z');
    expect(intent.parsedFilters.label).toBe('bug');
    expect(intent.parsedFilters.state).toBe('open');
    expect(intent.parsedFilters.dateField).toBe('createdAt');
    expect(intent.refreshMode).toBe('fetch');
  });
});
