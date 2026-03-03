import { SummonableEntry } from '../../contracts/summonable-entry.js';
import { COPILOT_RUNTIME_ENTRY } from './copilot.js';

export const forgeDiscussionAnalyzerEntry: SummonableEntry = {
  id: 'forge-discussion-analyzer',
  displayName: 'Forge Discussion Analyzer',
  purpose: 'Analyze GitHub Discussions for the current repository through Forge-managed fetching, preprocessing, and compact sidecar context.',
  instructions: [
    'Use this summonable when the user wants a digest, triage, pattern analysis, or follow-up answer based on GitHub Discussions.',
    `Treat \`${COPILOT_RUNTIME_ENTRY}\` as the single backend for this workflow because the installed Copilot runtime bundles Forge there.`,
    'Ask for approval once for the Forge command that fetches or analyzes discussions, then let Forge complete the workflow instead of decomposing it into extra shell steps.',
    'Do not run npm install, repair Forge dependencies, or switch to raw gh api graphql when Forge is available. Only consider a non-Forge fallback if the Forge runtime is truly unavailable and the user explicitly approves that fallback.',
    'Delegate data acquisition, filtering, and preprocessing to Forge instead of re-fetching data or embedding large prompt instructions.',
    'If analysis needs fresher data, use Forge to fetch or refresh discussions first and then continue with Forge-managed analysis.',
  ].join(' '),
  capabilities: [
    {
      name: 'Discussion Digests',
      description: 'Produces structured summaries and analysis from GitHub Discussions.',
      benefits: ['Scannable summaries', 'Question-driven follow-up analysis'],
    },
    {
      name: 'Compact Context',
      description: 'Uses Forge-prepared sidecar artifacts instead of large static prompt bodies.',
      benefits: ['Lower prompt overhead', 'Reusable repository-local context'],
    },
  ],
  commands: [
    {
      name: '/agent forge-discussion-analyzer',
      description: 'Select the discussion analyzer summonable, then ask a question.',
      usage: `${COPILOT_RUNTIME_ENTRY} --run-summonable forge-discussion-analyzer --question "<your question>"`,
      examples: [
        '/agent -> select forge-discussion-analyzer -> "what were the major support themes last week?"',
        `${COPILOT_RUNTIME_ENTRY} --run-summonable forge-discussion-analyzer --question "summarize unresolved discussions"`,
      ],
    },
  ],
  principles: [
    'Keep the assistant-facing asset compact and let Forge own the operational backend.',
    'Ground analysis in fetched sidecar artifacts, not in guessed repository state.',
    'Request approval once for the Forge-managed action, not repeatedly for the same analysis flow.',
    'Optimize for high-signal GitHub Discussion summaries and follow-up answers.',
  ],
};

export const forgeSummonableEntries: SummonableEntry[] = [
  forgeDiscussionAnalyzerEntry,
];
