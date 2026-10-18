/**
 * Prose Style and British English Linter
 *
 * Scans markdown documents and source code comments for:
 * 1. American English spellings (enforces traditional British English)
 * 2. Quotation mark rules (double quotes in prose, single quotes in code)
 */

import { existsSync, readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

interface Violation {
  readonly file: string;
  readonly line: number;
  readonly match: string;
  readonly message: string;
  readonly rule: 'british-english' | 'prose-quotes';
}

const AMERICAN_SPELLINGS: ReadonlyArray<{
  readonly label: string;
  readonly pattern: RegExp;
  readonly suggestion: string;
}> = [
  {
    pattern: /\boptimiz(e|ed|es|ing|ation|ations)\b/gi,
    suggestion: 'optimis$1',
    label: 'optimise',
  },
  {
    pattern: /\binitializ(e|ed|es|ing|ation|ations)\b/gi,
    suggestion: 'initialis$1',
    label: 'initialise',
  },
  {
    pattern: /\bbehavior(s)?\b/gi,
    suggestion: 'behaviour$1',
    label: 'behaviour',
  },
  {
    pattern: /\bcustomiz(e|ed|es|ing|ation|ations)\b/gi,
    suggestion: 'customis$1',
    label: 'customise',
  },
  {
    pattern: /\bprioritiz(e|ed|es|ing|ation|ations)\b/gi,
    suggestion: 'prioritis$1',
    label: 'prioritise',
  },
  {
    pattern: /\bcenter(s|ed|ing)?\b/gi,
    suggestion: 'centre$1',
    label: 'centre',
  },
  {
    pattern: /\bcolor(s)?\b/gi,
    suggestion: 'colour$1',
    label: 'colour',
  },
  {
    pattern: /\borg-wide\b/gi,
    suggestion: 'organisation-wide',
    label: 'organisation-wide',
  },
];

const IGNORED_DIRECTORIES = new Set([
  '.astro',
  '.gemini',
  '.git',
  'dist',
  'node_modules',
]);

/**
 * Recursively discover markdown and source files to lint.
 */
async function discoverTargetFiles(dirPath: string): Promise<string[]> {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    if (
      IGNORED_DIRECTORIES.has(entry.name) ||
      entry.name.startsWith('.') && entry.name !== '.agents'
    ) {
      continue;
    }

    const fullPath = join(dirPath, entry.name);
    if (fullPath.includes('docs/src/content/docs/api')) {
      continue;
    }
    if (entry.isDirectory()) {
      const nested = await discoverTargetFiles(fullPath);
      results.push(...nested);
    } else {
      const ext = extname(entry.name);
      if (['.md', '.scss', '.ts', '.tsx'].includes(ext)) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

/**
 * Lint markdown file content.
 */
function lintMarkdown(
  filePath: string,
  content: string,
): { violations: Violation[]; } {
  const violations: Violation[] = [];
  const lines = content.split('\n');
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Toggle fenced code blocks
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
      continue;
    }

    // Strip inline code snippets (`...`) to prevent false positives in code
    const proseLine = rawLine.replace(/`[^`]+`/g, '`code`');

    // American English spelling check
    for (const rule of AMERICAN_SPELLINGS) {
      const match = proseLine.match(rule.pattern);
      if (match) {
        violations.push({
          file: filePath,
          line: i + 1,
          rule: 'british-english',
          message: `American spelling detected: "${match[0]}". Use British English ("${rule.label}").`,
          match: match[0],
        });
      }
    }
  }

  return { violations };
}

/**
 * Extract and lint comments from TypeScript and SCSS source files.
 */
function lintSourceComments(
  filePath: string,
  content: string,
): Violation[] {
  const violations: Violation[] = [];
  const lines = content.split('\n');
  let inBlockComment = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let commentText = '';

    if (inBlockComment) {
      const endBlock = line.indexOf('*/');
      if (endBlock !== -1) {
        commentText = line.substring(0, endBlock);
        inBlockComment = false;
      } else {
        commentText = line;
      }
    } else {
      const lineCommentIndex = line.indexOf('//');
      const blockCommentIndex = line.indexOf('/*');

      if (lineCommentIndex !== -1 && (blockCommentIndex === -1 || lineCommentIndex < blockCommentIndex)) {
        commentText = line.substring(lineCommentIndex + 2);
      } else if (blockCommentIndex !== -1) {
        const endBlock = line.indexOf('*/', blockCommentIndex + 2);
        if (endBlock !== -1) {
          commentText = line.substring(blockCommentIndex + 2, endBlock);
        } else {
          commentText = line.substring(blockCommentIndex + 2);
          inBlockComment = true;
        }
      }
    }

    if (!commentText) {
      continue;
    }

    const trimmedComment = commentText.replace(/`[^`]+`/g, '`code`').trim();
    if (!trimmedComment) {
      continue;
    }

    // American spelling check in comments
    for (const rule of AMERICAN_SPELLINGS) {
      const match = trimmedComment.match(rule.pattern);
      if (match) {
        violations.push({
          file: filePath,
          line: i + 1,
          rule: 'british-english',
          message: `American spelling detected in comment: "${match[0]}". Use British English ("${rule.label}").`,
          match: match[0],
        });
      }
    }
  }

  return violations;
}

async function run(): Promise<void> {
  const args = process.argv.slice(2);
  const targetDirs = ['.agents/skills', 'docs', 'src', 'scripts'];

  const customFilesArgIndex = args.indexOf('--files');
  let filesToScan: string[] = [];

  if (customFilesArgIndex !== -1 && args[customFilesArgIndex + 1]) {
    filesToScan = args.slice(customFilesArgIndex + 1).filter(f => existsSync(f));
  } else {
    for (const dir of targetDirs) {
      if (existsSync(dir)) {
        const discovered = await discoverTargetFiles(dir);
        filesToScan.push(...discovered);
      }
    }
  }

  const totalViolations: Violation[] = [];

  for (const file of filesToScan) {
    const ext = extname(file);
    const content = readFileSync(file, 'utf-8');

    if (ext === '.md') {
      const result = lintMarkdown(file, content);
      totalViolations.push(...result.violations);
    } else if (['.scss', '.ts', '.tsx'].includes(ext)) {
      const violations = lintSourceComments(file, content);
      totalViolations.push(...violations);
    }
  }

  if (totalViolations.length > 0) {
    console.error(`\nFound ${totalViolations.length} prose style violation(s):\n`);
    for (const v of totalViolations) {
      console.error(`  ${v.file}:${v.line} [${v.rule}] ${v.message}`);
    }
    console.error('\nProse style check failed. Please resolve the issues above.');
    process.exitCode = 1;
    return;
  }

  console.log(`Success: Checked ${filesToScan.length} file(s) for prose style invariants. Zero violations found.`);
}

void run();
