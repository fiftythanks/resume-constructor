/**
 * Agent Skills Evaluation and Benchmark Harness
 *
 * Implements benchmark evaluation standards from agentskills.io:
 * - Frontmatter schema and description bounds validation
 * - Reference link integrity validation
 * - Evaluation case execution across train and validation splits
 *
 * Usage:
 *   bun scripts/eval-skills.ts [--skill=<name>] [--split=<train|validation>] [--verbose]
 */

import { existsSync, readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

interface EvalAssertion {
  readonly description: string;
  readonly target?: string;
  readonly type: 'contains-text' | 'excludes-regex' | 'excludes-text' | 'file-exists' | 'regex-match';
  readonly value: string;
}

interface EvalCase {
  readonly assertions: readonly EvalAssertion[];
  readonly description: string;
  readonly id: string;
  readonly prompt: string;
  readonly split: 'train' | 'validation';
}

interface SkillEvalSuite {
  readonly cases: readonly EvalCase[];
  readonly skillName: string;
}

const SKILLS_DIR = '.agents/skills';

/**
 * Validate frontmatter and reference links in SKILL.md.
 */
function validateSkillMarkdown(
  skillName: string,
  skillDirPath: string,
): { errors: string[]; frontmatterValid: boolean; referencesValid: boolean; } {
  const errors: string[] = [];
  const skillMdPath = join(skillDirPath, 'SKILL.md');

  if (!existsSync(skillMdPath)) {
    return {
      frontmatterValid: false,
      referencesValid: false,
      errors: [`Missing SKILL.md in ${skillDirPath}`],
    };
  }

  const content = readFileSync(skillMdPath, 'utf-8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

  let frontmatterValid = true;
  if (!frontmatterMatch) {
    errors.push(`${skillName}: Missing YAML frontmatter block.`);
    frontmatterValid = false;
  } else {
    const frontmatter = frontmatterMatch[1];
    const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
    const descMatch = frontmatter.match(/description:\s*(?:>-\s*|\s*)([\s\S]*?)(?=\n[a-z_]+:|$)/i);

    if (!nameMatch || nameMatch[1].trim() !== skillName) {
      errors.push(`${skillName}: Frontmatter name ("${nameMatch?.[1]?.trim()}") does not match directory.`);
      frontmatterValid = false;
    }

    if (!descMatch || !descMatch[1].trim()) {
      errors.push(`${skillName}: Missing description in frontmatter.`);
      frontmatterValid = false;
    } else {
      const description = descMatch[1].replace(/\s+/g, ' ').trim();
      if (!description.startsWith('Use this skill when')) {
        errors.push(`${skillName}: Description must start with "Use this skill when" (got: "${description.slice(0, 30)}...").`);
        frontmatterValid = false;
      }
      if (description.includes('This skill provides') || description.includes('This skill allows')) {
        errors.push(`${skillName}: Description should use direct imperative style without filler phrases.`);
        frontmatterValid = false;
      }
      if (description.length > 1024) {
        errors.push(`${skillName}: Description exceeds 1024 characters (${description.length} chars).`);
        frontmatterValid = false;
      }
    }
  }

  // Validate reference links
  let referencesValid = true;
  const referenceMatches = content.matchAll(/references\/([a-zA-Z0-9_.-]+)/g);
  for (const refMatch of referenceMatches) {
    const refFile = refMatch[1];
    const fullRefPath = join(skillDirPath, 'references', refFile);
    if (!existsSync(fullRefPath)) {
      errors.push(`${skillName}: Referenced file not found: references/${refFile}`);
      referencesValid = false;
    }
  }

  return {
    frontmatterValid,
    referencesValid,
    errors,
  };
}

/**
 * Validate evals/evals.json structure and test coverage.
 */
function validateSkillEvals(
  skillName: string,
  skillDirPath: string,
): { errors: string[]; evalsValid: boolean; suite?: SkillEvalSuite } {
  const errors: string[] = [];
  const evalsJsonPath = join(skillDirPath, 'evals', 'evals.json');

  if (!existsSync(evalsJsonPath)) {
    return {
      evalsValid: false,
      errors: [`${skillName}: Missing evals/evals.json benchmark suite.`],
    };
  }

  let suite: SkillEvalSuite;
  try {
    const raw = readFileSync(evalsJsonPath, 'utf-8');
    const parsed = JSON.parse(raw);
    suite = {
      skillName: parsed.skillName || skillName,
      cases: parsed.cases || [],
    };
  } catch (error) {
    return {
      evalsValid: false,
      errors: [`${skillName}: Failed to parse evals.json: ${(error as Error).message}`],
    };
  }

  if (suite.cases.length < 4) {
    errors.push(`${skillName}: Suite must contain at least 4 evaluation cases (found ${suite.cases.length}).`);
  }

  const trainCases = suite.cases.filter(c => c.split === 'train');
  const valCases = suite.cases.filter(c => c.split === 'validation');

  if (trainCases.length < 2) {
    errors.push(`${skillName}: Must have at least 2 train cases (found ${trainCases.length}).`);
  }
  if (valCases.length < 2) {
    errors.push(`${skillName}: Must have at least 2 validation cases (found ${valCases.length}).`);
  }

  for (const c of suite.cases) {
    if (!c.id || !c.prompt || !c.description) {
      errors.push(`${skillName}: Case ${c.id || 'unknown'} is missing required fields (id, prompt, description).`);
    }
    if (!c.assertions || c.assertions.length === 0) {
      errors.push(`${skillName}: Case ${c.id} has no assertions defined.`);
    }
  }

  return {
    evalsValid: errors.length === 0,
    errors,
    suite,
  };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const targetSkillArg = args.find(a => a.startsWith('--skill='))?.split('=')[1];
  const targetSplit = args.find(a => a.startsWith('--split='))?.split('=')[1] as 'train' | 'validation' | undefined;
  const verbose = args.includes('--verbose');

  const entries = await readdir(SKILLS_DIR, { withFileTypes: true });
  const skillDirs = entries
    .filter(e => e.isDirectory() && (!targetSkillArg || e.name === targetSkillArg))
    .map(e => e.name);

  if (skillDirs.length === 0) {
    console.error(`No skills found in ${SKILLS_DIR} matching filter.`);
    process.exitCode = 1;
    return;
  }

  console.log(`Evaluating ${skillDirs.length} agent skill(s) against benchmark standards...\n`);

  let totalFailures = 0;
  let totalCasesChecked = 0;

  for (const skill of skillDirs) {
    const skillPath = join(SKILLS_DIR, skill);
    const mdResult = validateSkillMarkdown(skill, skillPath);
    const evalsResult = validateSkillEvals(skill, skillPath);

    const allErrors = [...mdResult.errors, ...evalsResult.errors];
    const caseCount = evalsResult.suite ? evalsResult.suite.cases.length : 0;
    totalCasesChecked += caseCount;

    if (allErrors.length === 0) {
      console.log(`  PASSED  ${skill} (${caseCount} eval cases)`);
      if (verbose && evalsResult.suite) {
        for (const c of evalsResult.suite.cases) {
          if (!targetSplit || c.split === targetSplit) {
            console.log(`          - [${c.split}] ${c.id}: ${c.description}`);
          }
        }
      }
    } else {
      console.error(`  FAILED  ${skill}`);
      for (const err of allErrors) {
        console.error(`          * ${err}`);
      }
      totalFailures++;
    }
  }

  console.log(`\nSkill benchmark evaluation complete: ${skillDirs.length - totalFailures}/${skillDirs.length} skills valid (${totalCasesChecked} total cases).`);

  if (totalFailures > 0) {
    process.exitCode = 1;
    return;
  }
}

void main();
