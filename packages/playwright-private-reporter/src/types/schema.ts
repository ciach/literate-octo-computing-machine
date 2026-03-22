export type PrivateReporterOptions = {
  projectName: string;
  outputDir?: string;
  summaryTitle?: string;
  enableHistoryDiff?: boolean;
  ci?: boolean;
  buildUrlEnv?: string;
  buildIdEnv?: string;
  branchEnv?: string;
  commitEnv?: string;
};

export type AttachmentRecord = {
  name: string;
  contentType?: string;
  path?: string;
};

export type FailureTestRecord = {
  id: string;
  titlePath: string[];
  location?: string;
  retry: number;
  status: 'failed' | 'timedOut' | 'interrupted' | 'flaky';
  attachments: AttachmentRecord[];
};

export type FailureGroup = {
  fingerprint: string;
  title: string;
  normalizedMessage: string;
  firstMeaningfulStack?: string;
  testFile: string;
  projectName?: string;
  status: FailureTestRecord['status'];
  countInRun: number;
  tests: FailureTestRecord[];
  exampleAttachments: AttachmentRecord[];
  history?: {
    firstSeen?: string;
    lastSeen?: string;
    state: 'new' | 'still-failing' | 'fixed' | 'unknown';
  };
};

export type RunCounts = {
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  timedOut: number;
  interrupted: number;
};

export type RunSummary = {
  schemaVersion: '1.0';
  projectName: string;
  generatedAt: string;
  run: {
    status: 'passed' | 'failed' | 'partial';
    buildId?: string;
    buildUrl?: string;
    branch?: string;
    commit?: string;
  };
  counts: RunCounts;
  projects: Array<{
    name: string;
    counts: RunCounts;
  }>;
  history: {
    enabled: boolean;
    previousBuildId?: string;
    newFailures: number;
    fixedFailures: number;
    stillFailing: number;
  };
  artifacts: {
    blobReportDir: string;
    playwrightHtmlDir: string;
    testResultsDir: string;
    junitPath: string;
    internalReportDir: string;
  };
  failures: {
    totalGroups: number;
    topFingerprint?: string;
  };
};

export type FailuresSummary = {
  schemaVersion: '1.0';
  projectName: string;
  generatedAt: string;
  groups: FailureGroup[];
};

export type HistoryDiff = {
  newFailures: FailureGroup[];
  fixedFailures: FailureGroup[];
  stillFailing: FailureGroup[];
};
