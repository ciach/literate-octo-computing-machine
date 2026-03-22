import type { PlaywrightTestConfig, ReporterDescription } from '@playwright/test';

import type { PrivateReporterOptions } from '../types/schema.js';

const DEFAULT_INTERNAL_REPORTER_PATH = '@your-org/playwright-private-reporter';

function hasReporter(reporters: ReporterDescription[], name: string): boolean {
  return reporters.some((reporter) => reporter[0] === name);
}

export function withPrivateReporter(
  baseConfig: PlaywrightTestConfig,
  options: PrivateReporterOptions,
): PlaywrightTestConfig {
  const outputDir = options.outputDir ?? 'artifacts';
  const ci = options.ci ?? process.env.CI === 'true';
  const reporters: ReporterDescription[] = Array.isArray(baseConfig.reporter)
    ? [...(baseConfig.reporter as ReporterDescription[])]
    : baseConfig.reporter
      ? [baseConfig.reporter as ReporterDescription]
      : [];

  if (ci && !hasReporter(reporters, 'blob')) {
    reporters.unshift(['blob', { outputDir: 'blob-report' }]);
  }

  if (!hasReporter(reporters, 'junit')) {
    reporters.push(['junit', { outputFile: 'junit/results.xml' }]);
  }

  if (!hasReporter(reporters, DEFAULT_INTERNAL_REPORTER_PATH)) {
    reporters.push([DEFAULT_INTERNAL_REPORTER_PATH, options]);
  }

  if (!ci && !hasReporter(reporters, 'html') && !hasReporter(reporters, 'list')) {
    reporters.unshift(['list']);
    reporters.push(['html', { outputFolder: 'playwright-report', open: 'never' }]);
  }

  return {
    ...baseConfig,
    outputDir: baseConfig.outputDir ?? `${outputDir}/test-results`,
    reporter: reporters,
    use: {
      trace: 'retain-on-failure',
      screenshot: 'only-on-failure',
      video: 'retain-on-failure',
      ...baseConfig.use,
    },
  };
}
