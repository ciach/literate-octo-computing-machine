import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { generateReport } from '../dist/index.js';

const baseRun = {
  schemaVersion: '1.0',
  projectName: 'payments-ui',
  generatedAt: '2026-03-22T00:00:00.000Z',
  run: { status: 'failed', buildId: 'build-123' },
  counts: {
    passed: 8,
    failed: 2,
    skipped: 1,
    flaky: 0,
    timedOut: 0,
    interrupted: 0,
  },
  projects: [],
  history: {
    enabled: true,
    previousBuildId: 'build-122',
    newFailures: 0,
    fixedFailures: 0,
    stillFailing: 0,
  },
  artifacts: {
    blobReportDir: 'blob-report',
    playwrightHtmlDir: 'playwright-report',
    testResultsDir: 'test-results',
    junitPath: 'junit/results.xml',
    internalReportDir: 'internal-report',
  },
  failures: {
    totalGroups: 2,
    topFingerprint: 'fp-new',
  },
};

const baseFailures = {
  schemaVersion: '1.0',
  projectName: 'payments-ui',
  generatedAt: '2026-03-22T00:00:00.000Z',
  groups: [
    {
      fingerprint: 'fp-new',
      title: 'new failure',
      normalizedMessage: 'new boom',
      testFile: 'tests/a.spec.ts',
      status: 'failed',
      countInRun: 1,
      tests: [],
      exampleAttachments: [],
    },
    {
      fingerprint: 'fp-still',
      title: 'still failing',
      normalizedMessage: 'same boom',
      testFile: 'tests/b.spec.ts',
      status: 'failed',
      countInRun: 1,
      tests: [],
      exampleAttachments: [],
    },
  ],
};

const previousFailures = {
  schemaVersion: '1.0',
  projectName: 'payments-ui',
  generatedAt: '2026-03-21T00:00:00.000Z',
  groups: [
    {
      fingerprint: 'fp-still',
      title: 'still failing',
      normalizedMessage: 'same boom',
      testFile: 'tests/b.spec.ts',
      status: 'failed',
      countInRun: 1,
      tests: [],
      exampleAttachments: [],
    },
    {
      fingerprint: 'fp-fixed',
      title: 'fixed failure',
      normalizedMessage: 'old boom',
      testFile: 'tests/c.spec.ts',
      status: 'failed',
      countInRun: 1,
      tests: [],
      exampleAttachments: [],
    },
  ],
};

test('generateReport renders summary files and updates history counts', async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), 'generate-report-'));
  const currentDir = join(tempRoot, 'artifacts', 'internal-report');
  const previousDir = join(tempRoot, 'previous');
  await mkdir(currentDir, { recursive: true });
  await mkdir(previousDir, { recursive: true });

  await writeFile(join(currentDir, 'run.json'), JSON.stringify(baseRun, null, 2));
  await writeFile(join(currentDir, 'failures.json'), JSON.stringify(baseFailures, null, 2));
  await writeFile(join(previousDir, 'failures.json'), JSON.stringify(previousFailures, null, 2));

  await generateReport(
    {
      projectName: 'payments-ui',
      outputDir: join(tempRoot, 'artifacts'),
      summaryTitle: 'Payments summary',
      enableHistoryDiff: true,
    },
    {
      currentRunPath: join(currentDir, 'run.json'),
      currentFailuresPath: join(currentDir, 'failures.json'),
      previousFailuresPath: join(previousDir, 'failures.json'),
      outputDir: currentDir,
    },
  );

  const run = JSON.parse(await readFile(join(currentDir, 'run.json'), 'utf8'));
  const markdown = await readFile(join(currentDir, 'summary.md'), 'utf8');
  const html = await readFile(join(currentDir, 'summary.html'), 'utf8');

  assert.equal(run.history.newFailures, 1);
  assert.equal(run.history.fixedFailures, 1);
  assert.equal(run.history.stillFailing, 1);
  assert.match(markdown, /# Payments summary summary/);
  assert.match(markdown, /- New failures: 1/);
  assert.match(html, /payments-ui Playwright Summary/);
  assert.match(html, /fp-new/);
});
