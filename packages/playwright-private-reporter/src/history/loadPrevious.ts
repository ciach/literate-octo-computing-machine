import { readFile } from 'node:fs/promises';

import type { FailuresSummary, RunSummary } from '../types/schema.js';

export async function loadPreviousRunSummary(path: string): Promise<RunSummary | undefined> {
  try {
    const raw = await readFile(path, 'utf8');
    return JSON.parse(raw) as RunSummary;
  } catch {
    return undefined;
  }
}

export async function loadPreviousFailuresSummary(path: string): Promise<FailuresSummary | undefined> {
  try {
    const raw = await readFile(path, 'utf8');
    return JSON.parse(raw) as FailuresSummary;
  } catch {
    return undefined;
  }
}
