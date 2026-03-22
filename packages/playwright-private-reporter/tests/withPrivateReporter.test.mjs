import test from 'node:test';
import assert from 'node:assert/strict';

import { withPrivateReporter } from '../dist/index.js';

test('withPrivateReporter injects CI reporters and artifact defaults', () => {
  const config = withPrivateReporter(
    {
      reporter: [['dot']],
      use: { baseURL: 'https://example.test' },
    },
    {
      projectName: 'payments-ui',
      outputDir: 'artifacts',
      ci: true,
    },
  );

  assert.equal(config.outputDir, 'artifacts/test-results');
  assert.deepEqual(config.reporter, [
    ['blob', { outputDir: 'blob-report' }],
    ['dot'],
    ['junit', { outputFile: 'junit/results.xml' }],
    ['@your-org/playwright-private-reporter', { projectName: 'payments-ui', outputDir: 'artifacts', ci: true }],
  ]);
  assert.deepEqual(config.use, {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    baseURL: 'https://example.test',
  });
});

test('withPrivateReporter keeps local developer reporters friendly', () => {
  const config = withPrivateReporter(
    {
      use: { locale: 'en-US' },
    },
    {
      projectName: 'payments-ui',
      ci: false,
    },
  );

  assert.deepEqual(config.reporter, [
    ['list'],
    ['junit', { outputFile: 'junit/results.xml' }],
    ['@your-org/playwright-private-reporter', { projectName: 'payments-ui', ci: false }],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ]);
  assert.deepEqual(config.use, {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'en-US',
  });
});
