import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getInstallationToken } from './gh-app.ts';

const WORKTREE_PATH = path.resolve(
  process.cwd(),
  '../resume-constructor-agent',
);
const OWNER = 'fiftythanks';
const REPO = 'resume-constructor';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchLatestMain(token: string): string {
  const remoteUrl = `https://x-access-token:${token}@github.com/${OWNER}/${REPO}.git`;
  console.log('Fetching latest main branch from GitHub over HTTPS...');
  execSync(`git fetch ${remoteUrl} main`, { stdio: 'pipe' });
  const commit = execSync('git rev-parse FETCH_HEAD', {
    encoding: 'utf8',
  }).trim();
  console.log(`Latest remote main is at ${commit.slice(0, 7)}.`);
  return commit;
}

function setupWorktree(branchName: string, token: string): string {
  fetchLatestMain(token);

  if (!fs.existsSync(WORKTREE_PATH)) {
    console.log(
      `Creating isolated git worktree at ${WORKTREE_PATH} on branch ${branchName}...`,
    );
    execSync(
      `git worktree add ${WORKTREE_PATH} -b ${branchName} FETCH_HEAD`,
      { stdio: 'inherit' },
    );
  } else {
    console.log(
      `Reusing existing worktree at ${WORKTREE_PATH}, checking out ${branchName}...`,
    );
    execSync(`git -C ${WORKTREE_PATH} checkout -B ${branchName} FETCH_HEAD`, {
      stdio: 'inherit',
    });
  }

  // Copy .env.local to worktree if present
  const localEnv = path.resolve(process.cwd(), '.env.local');
  const targetEnv = path.resolve(WORKTREE_PATH, '.env.local');
  if (fs.existsSync(localEnv)) {
    fs.copyFileSync(localEnv, targetEnv);
    console.log('Synchronised .env.local into agent worktree.');
  }

  // Ensure dependencies are installed in worktree
  console.log('Ensuring dependencies in worktree are up to date...');
  execSync('bun install --frozen-lockfile', {
    cwd: WORKTREE_PATH,
    stdio: 'inherit',
  });

  return WORKTREE_PATH;
}

function runAgent(worktreeDir: string, prompt: string): void {
  console.log('\n--- Spawning Antigravity Agent with Full Autonomy ---');
  console.log(`Working Directory: ${worktreeDir}`);
  console.log(`Prompt: "${prompt}"\n`);

  const result = spawnSync(
    'agy',
    ['--dangerously-skip-permissions', '-p', prompt],
    {
      cwd: worktreeDir,
      env: {
        ...process.env,
        PAGER: 'cat',
      },
      stdio: 'inherit',
    },
  );

  if (result.status !== 0) {
    throw new Error(
      `Agent process exited with non-zero status code: ${result.status}`,
    );
  }
}

async function findOpenPr(
  branchName: string,
  token: string,
): Promise<null | { html_url: string; number: number }> {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/pulls?head=${OWNER}:${branchName}&state=open`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'Resume-Constructor-Agent',
      },
    },
  );

  if (!res.ok) return null;
  const list = (await res.json()) as Array<{
    html_url: string;
    number: number;
  }>;
  return list[0] || null;
}

async function monitorPullRequest(
  prNumber: number,
  worktreeDir: string,
  token: string,
): Promise<void> {
  console.log(
    `\n=== Monitoring Pull Request #${prNumber} for Reviews and Merges ===`,
  );
  console.log(
    'The bot will automatically address change requests and will cleanly exit upon merge.\n',
  );

  let lastProcessedReviewId = 0;

  while (true) {
    await sleep(30000); // Check every 30 seconds

    // 1. Check PR State
    const prRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/pulls/${prNumber}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'User-Agent': 'Resume-Constructor-Agent',
        },
      },
    );

    if (!prRes.ok) {
      console.warn(`Could not fetch PR status: ${prRes.statusText}`);
      continue;
    }

    const pr = (await prRes.json()) as {
      merged: boolean;
      state: string;
    };

    if (pr.state === 'closed') {
      if (pr.merged) {
        console.log(
          `\n🎉 Pull Request #${prNumber} has been MERGED! Mission complete.`,
        );
      } else {
        console.log(`\nPull Request #${prNumber} was closed. Terminating.`);
      }
      break;
    }

    // 2. Check for Reviews Requesting Changes
    const reviewsRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/pulls/${prNumber}/reviews`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'User-Agent': 'Resume-Constructor-Agent',
        },
      },
    );

    if (reviewsRes.ok) {
      const reviews = (await reviewsRes.json()) as Array<{
        body: string;
        id: number;
        state: string;
        user: { login: string };
      }>;

      const latestReview = reviews[reviews.length - 1];

      if (
        latestReview &&
        latestReview.id > lastProcessedReviewId &&
        latestReview.state === 'CHANGES_REQUESTED'
      ) {
        console.log(
          `\n[ALERT] Reviewer @${latestReview.user.login} requested changes on PR #${prNumber}:`,
        );
        console.log(`Feedback: "${latestReview.body}"`);

        // Fetch inline comments
        const commentsRes = await fetch(
          `https://api.github.com/repos/${OWNER}/${REPO}/pulls/${prNumber}/comments`,
          {
            headers: {
              Accept: 'application/vnd.github+json',
              Authorization: `Bearer ${token}`,
              'User-Agent': 'Resume-Constructor-Agent',
            },
          },
        );

        let inlineContext = '';
        if (commentsRes.ok) {
          const comments = (await commentsRes.json()) as Array<{
            body: string;
            line: number;
            path: string;
          }>;
          inlineContext = comments
            .map((c) => `- ${c.path}:${c.line} -> "${c.body}"`)
            .join('\n');
        }

        const fixPrompt = `The reviewer requested changes on PR #${prNumber}.
Review summary: "${latestReview.body}"
${inlineContext ? `Inline Comments:\n${inlineContext}\n` : ''}
Your mission:
1. Examine the review feedback and modify the codebase in this worktree to address every requested change.
2. Adhere strictly to GEMINI.md (traditional British English, ReadonlyExcept, accessible queries, zero redundant effects).
3. Run verification: bun x tsc --noEmit && bun x eslint <modified> --fix && bun x jest --bail --findRelatedTests <modified> --passWithNoTests.
4. Make atomic, bite-sized git commits following Conventional Commits (<=50 char subject, <=80 char body).
5. Push the branch to the PR using: bun run scripts/gh-app.ts push
6. Conclude when all checks pass and changes are pushed.`;

        console.log('Dispatching agent to address requested changes...');
        runAgent(worktreeDir, fixPrompt);

        lastProcessedReviewId = latestReview.id;
        console.log(
          `Changes for PR #${prNumber} pushed! Resuming monitoring...`,
        );
      }
    }
  }
}

async function main(): Promise<void> {
  const isDirectRun =
    process.argv[1] !== undefined &&
    path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

  if (!isDirectRun) return;

  const taskDescription = process.argv.slice(2).join(' ').trim();
  if (!taskDescription) {
    console.error('Usage: bun run scripts/bot-run.ts "<task-description>"');
    process.exitCode = 1;
    return;
  }

  const token = await getInstallationToken();
  const slug = taskDescription
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 24)
    .replace(/^-|-$/g, '');

  const branchName = `feat/bot-${slug || Date.now()}`;

  console.log(`\n=== Autonomous Bot Dispatcher ===`);
  console.log(`Task: ${taskDescription}`);
  console.log(`Target Branch: ${branchName}`);

  const worktreeDir = setupWorktree(branchName, token);

  const fullPrompt = `You are an autonomous senior software engineer working in an isolated Git worktree on branch "${branchName}".

TASK:
${taskDescription}

CRITICAL OPERATIONAL RULES (GEMINI.md):
1. Workspace Isolation: Operate strictly within this worktree. Never attempt to switch to other branches outside this feature branch.
2. Code Standards: React 19, TypeScript strict, ReadonlyExcept props, SCSS with BEM, no redundant effects.
3. Verification Battery:
   - bun x tsc --noEmit
   - bun x eslint <modified-files> --fix
   - bun x stylelint "src/**/*.scss" --fix
   - bun x jest --bail --findRelatedTests <modified-files> --passWithNoTests
4. ATOMIC COMMITS & GRANULARITY:
   - Make small, focused, discrete commits (aim for under ~200-300 lines changed per commit).
   - Decompose: component primitive -> unit tests -> page integration -> docs/roadmap.
   - Commit format: <tag>(<scope>): <subject> (<= 50 chars, body <= 80 chars, British English).
5. PUSH & CREATE PULL REQUEST:
   - When finished and verified, run:
     bun run scripts/gh-app.ts pr --title "<conventional-commit-title>" --body "<markdown-summary>"
   - Request review from @fiftythanks.
`;

  runAgent(worktreeDir, fullPrompt);

  // Check if PR was created
  console.log('\nChecking for opened Pull Request...');
  const pr = await findOpenPr(branchName, token);
  if (pr) {
    console.log(`Found active Pull Request #${pr.number}: ${pr.html_url}`);
    await monitorPullRequest(pr.number, worktreeDir, token);
  } else {
    console.log(
      'No active PR detected for this branch. Bot execution finished.',
    );
  }
}

void main();
