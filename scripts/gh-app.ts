import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Lightweight helper for GitHub App authentication and GitHub API automation.
 * Works seamlessly with Bun and node:crypto without external dependencies.
 */

function loadEnv(): {
  appId: string;
  installationId: string;
  keyPath: string;
  owner: string;
  repo: string;
} {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const env: Record<string, string> = {};

  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').replace(/^["']|["']$/g, '');
      env[key] = val;
    }
  }

  const appId = process.env.GITHUB_APP_ID || env.GITHUB_APP_ID;
  const installationId =
    process.env.GITHUB_APP_INSTALLATION_ID || env.GITHUB_APP_INSTALLATION_ID;
  const keyPath =
    process.env.GITHUB_APP_PRIVATE_KEY_PATH || env.GITHUB_APP_PRIVATE_KEY_PATH;
  const owner = process.env.GITHUB_OWNER || env.GITHUB_OWNER || 'fiftythanks';
  const repo =
    process.env.GITHUB_REPO || env.GITHUB_REPO || 'resume-constructor';

  if (!appId || !installationId || !keyPath) {
    throw new Error(
      'Missing GitHub App configuration. Please ensure .env.local contains GITHUB_APP_ID, GITHUB_APP_INSTALLATION_ID and GITHUB_APP_PRIVATE_KEY_PATH.',
    );
  }

  return { appId, installationId, keyPath, owner, repo };
}

export async function getInstallationToken(): Promise<string> {
  const { appId, installationId, keyPath } = loadEnv();

  const privateKey = fs.readFileSync(path.resolve(keyPath), 'utf8');
  const now = Math.floor(Date.now() / 1000);

  const header = Buffer.from(
    JSON.stringify({ alg: 'RS256', typ: 'JWT' }),
  ).toString('base64url');

  const payload = Buffer.from(
    JSON.stringify({
      iat: now - 60,
      exp: now + 600,
      iss: appId,
    }),
  ).toString('base64url');

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const jwt = `${header}.${payload}.${sign.sign(privateKey, 'base64url')}`;

  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${jwt}`,
        'User-Agent': 'Resume-Constructor-Agent',
      },
    },
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Failed to fetch installation access token (${res.status}): ${errorText}`,
    );
  }

  const data = (await res.json()) as { token: string };
  return data.token;
}

export async function pushBranch(branchName?: string): Promise<string> {
  const { owner, repo } = loadEnv();
  const token = await getInstallationToken();

  const currentBranch =
    branchName ||
    execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();

  const remoteUrl = `https://x-access-token:${token}@github.com/${owner}/${repo}.git`;

  console.log(`Pushing branch ${currentBranch} to origin via GitHub App...`);
  execSync(`git push ${remoteUrl} ${currentBranch}`, {
    stdio: 'inherit',
  });

  return currentBranch;
}

export async function createPullRequest({
  base = 'main',
  body,
  head,
  reviewers = ['fiftythanks'],
  title,
}: {
  base?: string;
  body: string;
  head?: string;
  reviewers?: string[];
  title: string;
}): Promise<{ html_url: string; number: number }> {
  const { owner, repo } = loadEnv();
  const token = await getInstallationToken();

  const branch =
    head ||
    execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();

  console.log(
    `Creating pull request for ${branch} -> ${base} in ${owner}/${repo}...`,
  );

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'Resume-Constructor-Agent',
      },
      body: JSON.stringify({
        base,
        body,
        head: branch,
        title,
      }),
    },
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create pull request: ${errorText}`);
  }

  const pr = (await res.json()) as { html_url: string; number: number };
  console.log(`Pull request #${pr.number} created: ${pr.html_url}`);

  // Request review from user
  if (reviewers.length > 0) {
    const reviewRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pr.number}/requested_reviewers`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'User-Agent': 'Resume-Constructor-Agent',
        },
        body: JSON.stringify({
          reviewers,
        }),
      },
    );

    if (reviewRes.ok) {
      console.log(`Requested review from: ${reviewers.join(', ')}`);
    } else {
      console.warn('Could not assign reviewers automatically.');
    }
  }

  return pr;
}

async function main(): Promise<void> {
  const isDirectRun =
    process.argv[1] !== undefined &&
    path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

  if (!isDirectRun) return;

  const args = process.argv.slice(2);
  const command = args[0];

  try {
    if (command === 'token') {
      const token = await getInstallationToken();
      console.log(`Token: ${token.substring(0, 10)}... (valid for 1 hour)`);
    } else if (command === 'push') {
      await pushBranch(args[1]);
    } else if (command === 'pr') {
      const titleIndex = args.indexOf('--title');
      const bodyIndex = args.indexOf('--body');
      const title =
        titleIndex !== -1 ? args[titleIndex + 1] : 'Update from Bot';
      const body =
        bodyIndex !== -1
          ? args[bodyIndex + 1]
          : 'Automated changes submitted by GitHub App.';

      await pushBranch();
      const pr = await createPullRequest({ body, title });
      console.log(`\nSuccessfully created PR: ${pr.html_url}`);
    } else {
      console.log(`
Usage:
  bun run scripts/gh-app.ts token           # Verify and print token prefix
  bun run scripts/gh-app.ts push [branch]   # Push branch over HTTPS using App token
  bun run scripts/gh-app.ts pr --title "..." --body "..." # Push & open PR
      `);
    }
  } catch (err) {
    console.error((err as Error).message);
    process.exitCode = 1;
  }
}

void main();


