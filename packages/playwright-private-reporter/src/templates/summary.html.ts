import type { FailuresSummary, RunSummary } from '../types/schema.js';

function escapeHtml(value: string | undefined): string {
  return (value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderSummaryHtml(run: RunSummary, failures: FailuresSummary): string {
  const failureItems = failures.groups
    .slice(0, 10)
    .map(
      (group) => `
        <li>
          <strong>${escapeHtml(group.title)}</strong>
          <div>Fingerprint: <code>${escapeHtml(group.fingerprint)}</code></div>
          <div>Occurrences: ${group.countInRun}</div>
          <div>${escapeHtml(group.normalizedMessage)}</div>
        </li>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(run.projectName)} test summary</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 2rem; color: #1f2937; }
      .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; }
      .card { border: 1px solid #d1d5db; border-radius: 8px; padding: 1rem; background: #fff; }
      code { background: #f3f4f6; padding: 0.1rem 0.3rem; border-radius: 4px; }
      ul { padding-left: 1.25rem; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(run.projectName)} Playwright Summary</h1>
    <p>Status: <strong>${escapeHtml(run.run.status)}</strong></p>
    <div class="grid">
      <div class="card"><div>Passed</div><strong>${run.counts.passed}</strong></div>
      <div class="card"><div>Failed</div><strong>${run.counts.failed}</strong></div>
      <div class="card"><div>Skipped</div><strong>${run.counts.skipped}</strong></div>
      <div class="card"><div>Flaky</div><strong>${run.counts.flaky}</strong></div>
    </div>
    <h2>Build metadata</h2>
    <ul>
      <li>Build ID: ${escapeHtml(run.run.buildId)}</li>
      <li>Branch: ${escapeHtml(run.run.branch)}</li>
      <li>Commit: ${escapeHtml(run.run.commit)}</li>
      <li>Build URL: ${run.run.buildUrl ? `<a href="${escapeHtml(run.run.buildUrl)}">${escapeHtml(run.run.buildUrl)}</a>` : 'n/a'}</li>
    </ul>
    <h2>Failure groups</h2>
    <ul>${failureItems || '<li>No failing groups 🎉</li>'}</ul>
    <h2>Artifacts</h2>
    <ul>
      <li><a href="../playwright-report/index.html">Merged Playwright HTML report</a></li>
      <li><a href="../junit/results.xml">JUnit XML</a></li>
      <li><a href="../test-results/">Test results attachments</a></li>
    </ul>
  </body>
</html>`;
}
