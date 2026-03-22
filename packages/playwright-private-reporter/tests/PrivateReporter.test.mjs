import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { PrivateReporter } from '../dist/index.js';

function createTestCase(overrides = {}) {
  return {
    id: 'test-id',
    title: 'shows an error',
    location: {
      file: 'tests/payments.spec.ts',
      line: 12,
      column: 7,
    },
    titlePath() {
      return ['payments-ui', 'checkout', 'shows an error'];
    },
    parent: {
      project() {
        return { name: 'chromium' };
      },
    },
    ...overrides,
  };
}

test('PrivateReporter writes run, failures, and health artifacts', async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), 'private-reporter-'));
  const reporter = new PrivateReporter({
    projectName: 'payments-ui',
    outputDir: tempRoot,
  });

  reporter.onTestEnd(
    createTestCase(),
    {
      status: 'failed',
      retry: 0,
      error: {
        message: 'Timed out after 5000ms while waiting for https://example.test/checkout',
        stack: 'Error: boom\n    at tests/payments.spec.ts:12:7',
      },
      attachments: [
        { name: 'trace', contentType: 'application/zip', path: 'artifacts/test-results/trace.zip' },
      ],
    },
  );

  reporter.onTestEnd(
    createTestCase({ id: 'test-id-pass', title: 'passes happily' }),
    {
      status: 'passed',
      retry: 0,
      attachments: [],
    },
  );

  await reporter.onEnd();

  const internalReportDir = join(tempRoot, 'internal-report');
  const run = JSON.parse(await readFile(join(internalReportDir, 'run.json'), 'utf8'));
  const failures = JSON.parse(await readFile(join(internalReportDir, 'failures.json'), 'utf8'));
  const health = JSON.parse(await readFile(join(internalReportDir, 'health.json'), 'utf8'));

  assert.equal(run.projectName, 'payments-ui');
  assert.equal(run.counts.failed, 1);
  assert.equal(run.counts.passed, 1);
  assert.equal(run.failures.totalGroups, 1);

  assert.equal(failures.groups.length, 1);
  assert.equal(failures.groups[0].projectName, 'chromium');
  assert.equal(failures.groups[0].countInRun, 1);
  assert.equal(failures.groups[0].normalizedMessage, 'Timed out after <duration> while waiting for <url>');
  assert.equal(failures.groups[0].exampleAttachments[0].path, 'artifacts/test-results/trace.zip');

  assert.deepEqual(health, { ok: true, errors: [] });
});
