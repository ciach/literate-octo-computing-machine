import { createHash } from 'node:crypto';

export type FingerprintParts = {
  testFile: string;
  titlePath: string[];
  projectName?: string;
  firstMeaningfulStack?: string;
  normalizedMessage: string;
  stepTitle?: string;
};

export function normalizeErrorMessage(message: string | undefined): string {
  if (!message) {
    return 'Unknown error';
  }

  return message
    .replace(/\b\d+ms\b/g, '<duration>')
    .replace(/https?:\/\/\S+/g, '<url>')
    .replace(/\/workspace\/[\w\-/\.]+/g, '<workspace-path>')
    .trim();
}

export function extractFirstMeaningfulStack(stack: string | undefined): string | undefined {
  if (!stack) {
    return undefined;
  }

  return stack
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 0 && !line.startsWith('Error:'));
}

export function createFailureFingerprint(parts: FingerprintParts): string {
  const payload = [
    parts.testFile,
    parts.titlePath.join(' › '),
    parts.projectName ?? '',
    parts.firstMeaningfulStack ?? '',
    parts.normalizedMessage,
    parts.stepTitle ?? '',
  ].join('||');

  return createHash('sha256').update(payload).digest('hex').slice(0, 16);
}
