import { AssistantContextFindings } from '../../contracts/analysis.js';
import { access, readdir } from 'node:fs/promises';
import path from 'node:path';

export class AssistantContextAnalyzer {
  constructor(private repoRoot: string) {}

  async analyze(): Promise<AssistantContextFindings> {
    const instructions = await this.detectInstructions();
    const skills = await this.detectSkills();

    return {
      hasInstructions: instructions.exists,
      instructionsPath: instructions.path,
      hasCustomSkills: skills.available.length > 0,
      availableSkills: skills.available,
    };
  }

  private async detectInstructions(): Promise<{ exists: boolean; path?: string }> {
    const candidates = [
      '.github/copilot-instructions.md',
      '.github/instructions.md',
      'CLAUDE.md',
      '.clinerules',
      '.cursorrules',
    ];

    for (const candidate of candidates) {
      try {
        const fullPath = path.join(this.repoRoot, candidate);
        await access(fullPath);
        return { exists: true, path: candidate };
      } catch {
        // Continue
      }
    }

    return { exists: false };
  }

  private async detectSkills(): Promise<{ available: string[] }> {
    const skillDirs = [
      '.agents/skills',
      '.forge/skills',
    ];

    const available: string[] = [];

    for (const dir of skillDirs) {
      try {
        const fullPath = path.join(this.repoRoot, dir);
        const items = await readdir(fullPath, { withFileTypes: true });
        const skills = items
          .filter(item => item.isDirectory())
          .map(item => item.name);
        available.push(...skills);
      } catch {
        // Continue
      }
    }

    return { available };
  }
}
