import { describe, expect, it } from 'vitest';
import { forgeDiscussionAnalyzerEntry, forgeIssueAnalyzerEntry } from '../../../src/services/assistants/summonables.js';
import { getExposedSummonableName, getSummonableRoute, toNamespacedSummonableName } from '../../../src/services/assistants/exposure.js';

describe('assistant exposure naming', () => {
  it('keeps the runtime id stable while command runtimes use the namespaced command alias', () => {
    expect(forgeDiscussionAnalyzerEntry.id).toBe('forge-discussion-analyzer');
    expect(forgeIssueAnalyzerEntry.id).toBe('forge-issue-analyzer');
    expect(getExposedSummonableName('claude', 'command', forgeDiscussionAnalyzerEntry)).toBe('forge:discussion-analyzer');
    expect(getExposedSummonableName('gemini', 'command', forgeDiscussionAnalyzerEntry)).toBe('forge:discussion-analyzer');
    expect(getExposedSummonableName('claude', 'command', forgeIssueAnalyzerEntry)).toBe('forge:issue-analyzer');
    expect(getExposedSummonableName('gemini', 'command', forgeIssueAnalyzerEntry)).toBe('forge:issue-analyzer');
  });

  it('keeps agent and skill ids stable for Copilot, Codex, and Claude agents', () => {
    expect(getExposedSummonableName('copilot', 'agent', forgeDiscussionAnalyzerEntry)).toBe('forge-discussion-analyzer');
    expect(getExposedSummonableName('copilot', 'skill', forgeDiscussionAnalyzerEntry)).toBe('forge-discussion-analyzer');
    expect(getExposedSummonableName('codex', 'skill', forgeDiscussionAnalyzerEntry)).toBe('forge-discussion-analyzer');
    expect(getExposedSummonableName('claude', 'agent', forgeDiscussionAnalyzerEntry)).toBe('forge-discussion-analyzer');
    expect(getExposedSummonableName('copilot', 'agent', forgeIssueAnalyzerEntry)).toBe('forge-issue-analyzer');
    expect(getExposedSummonableName('copilot', 'skill', forgeIssueAnalyzerEntry)).toBe('forge-issue-analyzer');
    expect(getExposedSummonableName('codex', 'skill', forgeIssueAnalyzerEntry)).toBe('forge-issue-analyzer');
    expect(getExposedSummonableName('claude', 'agent', forgeIssueAnalyzerEntry)).toBe('forge-issue-analyzer');
  });

  it('derives the command path route and converts only the leading namespace separator', () => {
    expect(toNamespacedSummonableName('forge-discussion-analyzer')).toBe('forge:discussion-analyzer');
    expect(toNamespacedSummonableName('forge-issue-analyzer')).toBe('forge:issue-analyzer');
    expect(toNamespacedSummonableName('singleword')).toBe('singleword');
    expect(getSummonableRoute('forge-discussion-analyzer')).toEqual({
      namespace: 'forge',
      localName: 'discussion-analyzer',
      namespacedName: 'forge:discussion-analyzer',
    });
    expect(getSummonableRoute('forge-issue-analyzer')).toEqual({
      namespace: 'forge',
      localName: 'issue-analyzer',
      namespacedName: 'forge:issue-analyzer',
    });
  });
});
