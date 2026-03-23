import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadPreviousFailuresSummary } from '../history/loadPrevious.js';
import { diffFailureGroups } from '../history/diffRuns.js';
import { renderSummaryHtml } from '../templates/summary.html.js';
import type { FailuresSummary, PrivateReporterOptions, RunSummary } from '../types/schema.js';

export type GenerateReportCliOptions = {
  currentRunPath?: string;
  currentFailuresPath?: string;
  previousFailuresPath?: string;
  outputDir?: string;
};

export async function generateReport(
  reporterOptions: PrivateReporterOptions,
  cliOptions: GenerateReportCliOptions = {},
): Promise<void> {
  const currentRunPath = resolve(cliOptions.currentRunPath ?? 'artifacts/internal-report/run.json');
  const currentFailuresPath = resolve(cliOptions.currentFailuresPath ?? 'artifacts/internal-report/failures.json');
  const previousFailuresPath = cliOptions.previousFailuresPath
    ? resolve(cliOptions.previousFailuresPath)
    : undefined;
  const outputDir = resolve(cliOptions.outputDir ?? 'artifacts/internal-report');

  const runSummary = JSON.parse(await readFile(currentRunPath, 'utf8')) as RunSummary;
  const failuresSummary = JSON.parse(await readFile(currentFailuresPath, 'utf8')) as FailuresSummary;
  const previousFailures = previousFailuresPath
    ? await loadPreviousFailuresSummary(previousFailuresPath)
    : undefined;
  const diff = previousFailures ? diffFailureGroups(failuresSummary.groups, previousFailures.groups) : undefined;

  if (diff) {
    runSummary.history.newFailures = diff.newFailures.length;
    runSummary.history.fixedFailures = diff.fixedFailures.length;
    runSummary.history.stillFailing = diff.stillFailing.length;
  }

  const markdown = [
    `# ${reporterOptions.summaryTitle ?? reporterOptions.projectName} summary`,
    '',
    `- Status: ${runSummary.run.status}`,
    `- Passed: ${runSummary.counts.passed}`,
    `- Failed: ${runSummary.counts.failed}`,
    `- Failure groups: ${failuresSummary.groups.length}`,
    diff ? `- New failures: ${diff.newFailures.length}` : undefined,
    diff ? `- Fixed failures: ${diff.fixedFailures.length}` : undefined,
  ]
    .filter(Boolean)
    .join('\n');

  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(resolve(outputDir, 'run.json'), JSON.stringify(runSummary, null, 2), 'utf8'),
    writeFile(resolve(outputDir, 'summary.md'), markdown, 'utf8'),
    writeFile(resolve(outputDir, 'summary.html'), renderSummaryHtml(runSummary, failuresSummary), 'utf8'),
  ]);
}

async function runFromCli(): Promise<void> {
  const projectName = process.env.PRIVATE_REPORT_PROJECT_NAME ?? 'playwright-project';

  await generateReport({
    projectName,
    outputDir: process.env.PRIVATE_REPORT_OUTPUT_DIR ?? 'artifacts',
    summaryTitle: process.env.PRIVATE_REPORT_SUMMARY_TITLE,
    enableHistoryDiff: process.env.PRIVATE_REPORT_ENABLE_HISTORY_DIFF === 'true',
  });
}

// Export for CLI usage
export { runFromCli };

