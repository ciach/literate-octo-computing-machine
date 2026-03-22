import type { FailureGroup, HistoryDiff } from '../types/schema.js';

export function diffFailureGroups(current: FailureGroup[], previous: FailureGroup[]): HistoryDiff {
  const previousByFingerprint = new Map(previous.map((group) => [group.fingerprint, group]));
  const currentByFingerprint = new Map(current.map((group) => [group.fingerprint, group]));

  const newFailures = current.filter((group) => !previousByFingerprint.has(group.fingerprint));
  const stillFailing = current.filter((group) => previousByFingerprint.has(group.fingerprint));
  const fixedFailures = previous.filter((group) => !currentByFingerprint.has(group.fingerprint));

  return {
    newFailures,
    fixedFailures,
    stillFailing,
  };
}
