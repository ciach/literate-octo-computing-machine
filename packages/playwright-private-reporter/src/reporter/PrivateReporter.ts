import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

import { normalizeAttachments } from './attachments.js';
import { createFailureFingerprint, extractFirstMeaningfulStack, normalizeErrorMessage } from './fingerprint.js';
import { buildFailuresSummary, buildRunSummary, createEmptyCounts, summarizeFailures, type FailureInput } from './summary.js';
import type { PrivateReporterOptions } from '../types/schema.js';

export class PrivateReporter implements Reporter {
  private readonly options: PrivateReporterOptions;
  private readonly failures: FailureInput[] = [];
  private readonly counts = createEmptyCounts();
  private readonly healthErrors: string[] = [];

  public constructor(options: PrivateReporterOptions) {
    this.options = options;
  }

  public printsToStdio(): boolean {
    return false;
  }

  public onTestEnd(test: TestCase, result: TestResult): void {
    this.guard(() => {
      this.recordStatus(result.status);

      if (!result.error) {
        return;
      }

      const normalizedMessage = normalizeErrorMessage(result.error.message);
      const firstMeaningfulStack = extractFirstMeaningfulStack(result.error.stack);
      const attachments = normalizeAttachments(result.attachments);

      this.failures.push({
        fingerprint: createFailureFingerprint({
          testFile: test.location.file,
          titlePath: test.titlePath(),
          projectName: test.parent.project?.()?.name,
          normalizedMessage,
          firstMeaningfulStack,
        }),
        title: test.title,
        normalizedMessage,
        firstMeaningfulStack,
        testFile: test.location.file,
        projectName: test.parent.project?.()?.name,
        status: result.status === 'timedOut' ? 'timedOut' : 'failed',
        id: test.id,
        titlePath: test.titlePath(),
        location: `${test.location.file}:${test.location.line}:${test.location.column}`,
        retry: result.retry,
        attachments,
      });
    });
  }

  public async onEnd(): Promise<void> {
    await this.guardAsync(async () => {
      const outputDir = join(this.options.outputDir ?? 'artifacts', 'internal-report');
      await mkdir(outputDir, { recursive: true });

      const groupedFailures = summarizeFailures(this.failures);
      const runSummary = buildRunSummary({
        options: this.options,
        counts: this.counts,
        groupedFailures,
      });
      const failuresSummary = buildFailuresSummary(this.options, groupedFailures);

      await Promise.all([
        writeFile(join(outputDir, 'run.json'), JSON.stringify(runSummary, null, 2), 'utf8'),
        writeFile(join(outputDir, 'failures.json'), JSON.stringify(failuresSummary, null, 2), 'utf8'),
        writeFile(join(outputDir, 'health.json'), JSON.stringify({ ok: this.healthErrors.length === 0, errors: this.healthErrors }, null, 2), 'utf8'),
      ]);
    });
  }

  private recordStatus(status: TestResult['status']): void {
    switch (status) {
      case 'passed':
        this.counts.passed += 1;
        break;
      case 'failed':
        this.counts.failed += 1;
        break;
      case 'skipped':
        this.counts.skipped += 1;
        break;
      case 'timedOut':
        this.counts.timedOut += 1;
        break;
      case 'interrupted':
        this.counts.interrupted += 1;
        break;
      default:
        this.counts.flaky += 1;
        break;
    }
  }

  private guard(fn: () => void): void {
    try {
      fn();
    } catch (error) {
      this.healthErrors.push(error instanceof Error ? error.message : String(error));
    }
  }

  private async guardAsync(fn: () => Promise<void>): Promise<void> {
    try {
      await fn();
    } catch (error) {
      this.healthErrors.push(error instanceof Error ? error.message : String(error));
    }
  }
}
