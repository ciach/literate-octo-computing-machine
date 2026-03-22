export { withPrivateReporter } from './config/withPrivateReporter.js';
export { PrivateReporter } from './reporter/PrivateReporter.js';
export { createFailureFingerprint, extractFirstMeaningfulStack, normalizeErrorMessage } from './reporter/fingerprint.js';
export { generateReport } from './cli/generateReport.js';
export { diffFailureGroups } from './history/diffRuns.js';
export { loadPreviousFailuresSummary, loadPreviousRunSummary } from './history/loadPrevious.js';
export type {
  AttachmentRecord,
  FailureGroup,
  FailuresSummary,
  HistoryDiff,
  PrivateReporterOptions,
  RunSummary,
} from './types/schema.js';
export { PrivateReporter as default } from './reporter/PrivateReporter.js';
