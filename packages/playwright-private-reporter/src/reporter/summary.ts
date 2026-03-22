import type {
  AttachmentRecord,
  FailureGroup,
  FailuresSummary,
  HistoryDiff,
  PrivateReporterOptions,
  RunCounts,
  RunSummary,
} from '../types/schema.js';

export type FailureInput = {
  fingerprint: string;
  title: string;
  normalizedMessage: string;
  firstMeaningfulStack?: string;
  testFile: string;
  projectName?: string;
  status: FailureGroup['status'];
  id: string;
  titlePath: string[];
  location?: string;
  retry: number;
  attachments: AttachmentRecord[];
};

export function createEmptyCounts(): RunCounts {
  return {
    passed: 0,
    failed: 0,
    skipped: 0,
    flaky: 0,
    timedOut: 0,
    interrupted: 0,
  };
}

export function summarizeFailures(inputs: FailureInput[]): FailureGroup[] {
  const grouped = new Map<string, FailureGroup>();

  for (const failure of inputs) {
    const existing = grouped.get(failure.fingerprint);
    if (existing) {
      existing.countInRun += 1;
      existing.tests.push({
        id: failure.id,
        titlePath: failure.titlePath,
        location: failure.location,
        retry: failure.retry,
        status: failure.status,
        attachments: failure.attachments,
      });
      continue;
    }

    grouped.set(failure.fingerprint, {
      fingerprint: failure.fingerprint,
      title: failure.title,
      normalizedMessage: failure.normalizedMessage,
      firstMeaningfulStack: failure.firstMeaningfulStack,
      testFile: failure.testFile,
      projectName: failure.projectName,
      status: failure.status,
      countInRun: 1,
      tests: [
        {
          id: failure.id,
          titlePath: failure.titlePath,
          location: failure.location,
          retry: failure.retry,
          status: failure.status,
          attachments: failure.attachments,
        },
      ],
      exampleAttachments: failure.attachments.slice(0, 3),
    });
  }

  return [...grouped.values()].sort((left, right) => right.countInRun - left.countInRun);
}

export function buildRunSummary(params: {
  options: PrivateReporterOptions;
  counts: RunCounts;
  groupedFailures: FailureGroup[];
  historyDiff?: HistoryDiff;
}): RunSummary {
  const buildUrlEnv = params.options.buildUrlEnv ?? 'BUILD_URL';
  const buildIdEnv = params.options.buildIdEnv ?? 'BUILD_TAG';
  const branchEnv = params.options.branchEnv ?? 'BRANCH_NAME';
  const commitEnv = params.options.commitEnv ?? 'GIT_COMMIT';
  const history = params.historyDiff;
  const hasFailures = params.counts.failed + params.counts.timedOut + params.counts.interrupted > 0;

  return {
    schemaVersion: '1.0',
    projectName: params.options.projectName,
    generatedAt: new Date().toISOString(),
    run: {
      status: hasFailures ? 'failed' : 'passed',
      buildId: process.env[buildIdEnv],
      buildUrl: process.env[buildUrlEnv],
      branch: process.env[branchEnv],
      commit: process.env[commitEnv],
    },
    counts: params.counts,
    projects: [],
    history: {
      enabled: Boolean(params.options.enableHistoryDiff),
      previousBuildId: undefined,
      newFailures: history?.newFailures.length ?? 0,
      fixedFailures: history?.fixedFailures.length ?? 0,
      stillFailing: history?.stillFailing.length ?? 0,
    },
    artifacts: {
      blobReportDir: 'blob-report',
      playwrightHtmlDir: 'playwright-report',
      testResultsDir: 'test-results',
      junitPath: 'junit/results.xml',
      internalReportDir: 'internal-report',
    },
    failures: {
      totalGroups: params.groupedFailures.length,
      topFingerprint: params.groupedFailures[0]?.fingerprint,
    },
  };
}

export function buildFailuresSummary(options: PrivateReporterOptions, groups: FailureGroup[]): FailuresSummary {
  return {
    schemaVersion: '1.0',
    projectName: options.projectName,
    generatedAt: new Date().toISOString(),
    groups,
  };
}
