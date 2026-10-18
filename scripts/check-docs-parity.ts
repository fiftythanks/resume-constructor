/**
 * Deterministic TypeDoc Documentation Parity Checker
 *
 * Validates that all public component barrels, feature pages, hooks,
 * utilities and colocated pure helpers are registered in
 * docs/astro.config.ts under starlightTypeDoc.entryPoints.
 */

import { existsSync, readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const ASTRO_CONFIG_PATH = 'docs/astro.config.ts';

interface ScanResult {
  readonly missingFromConfig: readonly string[];
  readonly missingFromDisk: readonly string[];
  readonly registeredCount: number;
}

/**
 * Recursively discover files matching a predicate.
 */
async function discoverFiles(
  dirPath: string,
  predicate: (path: string) => boolean,
): Promise<string[]> {
  const results: string[] = [];
  const entries = await readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const nested = await discoverFiles(fullPath, predicate);
      results.push(...nested);
    } else if (predicate(fullPath)) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Extract registered entry points from docs/astro.config.ts.
 */
function extractRegisteredEntryPoints(configContent: string): string[] {
  const match = configContent.match(/entryPoints:\s*\[([\s\S]*?)\]/);
  if (!match) {
    throw new Error('Failed to locate starlightTypeDoc.entryPoints in docs/astro.config.ts');
  }

  return match[1]
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith("'") || line.startsWith('"'))
    .map(line => line.replace(/['",]/g, '').replace(/^\.\.\//, ''));
}

/**
 * Main verification routine.
 */
async function checkDocsParity(): Promise<ScanResult> {
  if (!existsSync(ASTRO_CONFIG_PATH)) {
    throw new Error(`Configuration file not found: ${ASTRO_CONFIG_PATH}`);
  }

  const configContent = readFileSync(ASTRO_CONFIG_PATH, 'utf-8');
  const registeredEntries = extractRegisteredEntryPoints(configContent);
  const registeredSet = new Set(registeredEntries);

  // 1. Verify all registered files exist on disk
  const missingFromDisk: string[] = [];
  for (const entry of registeredEntries) {
    if (!existsSync(entry)) {
      missingFromDisk.push(entry);
    }
  }

  // 2. Discover public exports that must be documented
  const publicExports: string[] = [];

  // Top-level components (src/components/<Name>/index.tsx)
  const componentBarrels = await discoverFiles('src/components', path => {
    return /^src\/components\/[^/]+\/index\.tsx$/.test(path);
  });
  publicExports.push(...componentBarrels);

  // Colocated component pure helpers (src/components/<Name>/[a-z]*.ts)
  const componentHelpers = await discoverFiles('src/components', path => {
    return (
      /^src\/components\/[^/]+\/[a-z][^/]*\.ts$/.test(path) &&
      !path.endsWith('.test.ts') &&
      !path.endsWith('.d.ts')
    );
  });
  publicExports.push(...componentHelpers);

  // Feature pages (src/pages/<Name>/index.tsx)
  const pageBarrels = await discoverFiles('src/pages', path => {
    return /^src\/pages\/[^/]+\/index\.tsx$/.test(path);
  });
  publicExports.push(...pageBarrels);

  // Top-level hooks and barrel hook entries
  const hooks = await discoverFiles('src/hooks', path => {
    if (path.endsWith('.test.ts') || path.endsWith('.d.ts')) {
      return false;
    }
    return (
      /^src\/hooks\/use[^/]+\.ts$/.test(path) ||
      /^src\/hooks\/use[^/]+\/index\.ts$/.test(path)
    );
  });
  publicExports.push(...hooks);

  // Shared utilities (src/utils/*.ts)
  const utils = await discoverFiles('src/utils', path => {
    return (
      /^src\/utils\/[^/]+\.ts$/.test(path) &&
      !path.endsWith('.test.ts') &&
      !path.endsWith('.d.ts')
    );
  });
  publicExports.push(...utils);

  // Shared types (src/types/*.ts)
  const types = await discoverFiles('src/types', path => {
    return (
      /^src\/types\/[^/]+\.ts$/.test(path) &&
      !path.endsWith('.test.ts') &&
      !path.endsWith('.d.ts')
    );
  });
  publicExports.push(...types);

  // Compare discovered against registered
  const missingFromConfig: string[] = [];
  for (const exp of publicExports) {
    if (!registeredSet.has(exp)) {
      missingFromConfig.push(exp);
    }
  }

  return {
    missingFromConfig,
    missingFromDisk,
    registeredCount: registeredEntries.length,
  };
}

async function run(): Promise<void> {
  console.log('Validating TypeDoc documentation parity against docs/astro.config.ts...');

  try {
    const result = await checkDocsParity();

    if (result.missingFromDisk.length > 0) {
      console.error('\nError: The following registered entry points do not exist on disk:');
      for (const item of result.missingFromDisk) {
        console.error(`  - ${item}`);
      }
    }

    if (result.missingFromConfig.length > 0) {
      console.error('\nError: The following public exports are missing from docs/astro.config.ts:');
      for (const item of result.missingFromConfig) {
        console.error(`  - '../${item}'`);
      }
    }

    if (result.missingFromDisk.length > 0 || result.missingFromConfig.length > 0) {
      console.error('\nDocumentation parity check failed.');
      process.exitCode = 1;
      return;
    }

    console.log(`Success: All ${result.registeredCount} public entry points are documented and verified.`);
  } catch (error) {
    console.error('Fatal error checking documentation parity:', error);
    process.exitCode = 1;
  }
}

void run();
