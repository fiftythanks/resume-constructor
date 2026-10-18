/**
 * Modular Project Verification Runner
 *
 * Runs code hygiene, documentation parity, prose style and test suites.
 *
 * Usage:
 *   bun scripts/verify.ts [flags]
 *
 * Flags:
 *   --all         Run complete verification suite (default)
 *   --types       Run TypeScript compiler check (tsc --noEmit)
 *   --lint        Run ESLint
 *   --styles      Run Stylelint on SCSS files
 *   --docs        Run TypeDoc documentation parity check
 *   --prose       Run prose style and British English linter
 *   --tests       Run Vitest automated test suite
 *   --check-only  Do not apply automated fixes during linting
 */

import { spawnSync } from 'node:child_process';

interface Step {
  readonly args: string[];
  readonly command: string;
  readonly name: string;
}

function runCommand(command: string, args: string[]): { durationMs: number; success: boolean; } {
  const startTime = Date.now();
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: process.env,
  });
  const durationMs = Date.now() - startTime;
  return {
    success: result.status === 0,
    durationMs,
  };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check-only');

  const runAll = args.length === 0 || args.includes('--all') || (args.length === 1 && checkOnly);
  const runTypes = runAll || args.includes('--types');
  const runLint = runAll || args.includes('--lint');
  const runStyles = runAll || args.includes('--styles');
  const runDocs = runAll || args.includes('--docs');
  const runProse = runAll || args.includes('--prose');
  const runTests = runAll || args.includes('--tests');

  const steps: Step[] = [];

  if (runTypes) {
    steps.push({
      name: 'Type Safety (tsc)',
      command: 'bun',
      args: ['x', 'tsc', '--noEmit'],
    });
  }

  if (runLint) {
    const eslintArgs = ['x', 'eslint', '.'];
    if (!checkOnly) {
      eslintArgs.push('--fix');
    }
    steps.push({
      name: 'ESLint & Perfectionist',
      command: 'bun',
      args: eslintArgs,
    });
  }

  if (runStyles) {
    const stylelintArgs = ['x', 'stylelint', 'src/**/*.scss'];
    if (!checkOnly) {
      stylelintArgs.push('--fix');
    }
    steps.push({
      name: 'Stylelint Concentric SCSS',
      command: 'bun',
      args: stylelintArgs,
    });
  }

  if (runDocs) {
    steps.push({
      name: 'TypeDoc Documentation Parity',
      command: 'bun',
      args: ['scripts/check-docs-parity.ts'],
    });
  }

  if (runProse) {
    const proseArgs = ['scripts/lint-prose.ts'];
    if (!checkOnly) {
      proseArgs.push('--fix');
    }
    steps.push({
      name: 'Prose & British English Style',
      command: 'bun',
      args: proseArgs,
    });
  }

  if (runTests) {
    steps.push({
      name: 'Vitest Automated Tests',
      command: 'bun',
      args: ['run', 'test:ci'],
    });
  }

  console.log(`Starting verification pipeline (${steps.length} step(s))...\n`);

  let failedSteps = 0;
  const totalStartTime = Date.now();

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    console.log(`[${i + 1}/${steps.length}] ${step.name}...`);

    const { success, durationMs } = runCommand(step.command, step.args);

    if (success) {
      console.log(`  PASSED (${durationMs}ms)\n`);
    } else {
      console.error(`  FAILED (${durationMs}ms)\n`);
      failedSteps++;
      // Stop on first failure in single or check mode to enable rapid remediation
      if (!runAll) {
        break;
      }
    }
  }

  const totalDuration = ((Date.now() - totalStartTime) / 1000).toFixed(2);

  if (failedSteps > 0) {
    console.error(`\nVerification pipeline failed with ${failedSteps} failing step(s) in ${totalDuration}s.`);
    process.exitCode = 1;
    return;
  }

  console.log(`\nVerification pipeline passed cleanly in ${totalDuration}s.`);
}

void main();
