# @your-org/playwright-private-reporter

Private Jenkins-first Playwright reporting utilities.

## What it gives you

- A `withPrivateReporter()` config wrapper for Playwright projects.
- A `PrivateReporter` implementation that emits `run.json`, `failures.json`, and `health.json`.
- A `generateReport` CLI that creates `summary.md` and a static `summary.html` suitable for Jenkins HTML Publisher.
- JSON schemas and examples for Jenkins + Playwright adoption.

## Installation

Add the package to a Playwright repo:

```bash
npm install --save-dev @your-org/playwright-private-reporter @playwright/test
```

If your CI image does not already include browsers, install them as part of setup:

```bash
npx playwright install --with-deps
```

## Consumer quick start

### 1. Wrap your Playwright config

```ts
import { defineConfig } from '@playwright/test';
import { withPrivateReporter } from '@your-org/playwright-private-reporter';

export default withPrivateReporter(
  defineConfig({
    testDir: './tests',
    use: {
      trace: 'retain-on-failure',
      screenshot: 'only-on-failure',
      video: 'retain-on-failure',
    },
  }),
  {
    projectName: 'payments-ui',
    outputDir: 'artifacts',
    enableHistoryDiff: true,
  },
);
```

See the full example in `examples/playwright.config.ts`.

### 2. Run Playwright locally

```bash
npx playwright test
npx playwright show-report
```

Local runs keep developer-friendly terminal/html reporters. CI adds blob + JUnit + the private reporter automatically.

### 3. Generate the Jenkins artifacts in CI

Run tests first:

```bash
npx playwright test
```

Merge sharded blob reports into HTML:

```bash
npx playwright merge-reports --reporter html ./all-blob-reports
```

Generate the private summary artifacts:

```bash
node ./node_modules/@your-org/playwright-private-reporter/dist/cli/generateReport.js
```

### 4. Publish from Jenkins

Use the example pipeline in `examples/Jenkinsfile` to:

- publish JUnit XML,
- publish `artifacts/internal-report/summary.html`,
- publish the merged `playwright-report/index.html`, and
- archive traces, screenshots, videos, blob zips, and XML.

## Output files

After a CI run, expect these artifacts:

- `blob-report/`
- `playwright-report/`
- `artifacts/test-results/`
- `junit/results.xml`
- `artifacts/internal-report/run.json`
- `artifacts/internal-report/failures.json`
- `artifacts/internal-report/health.json`
- `artifacts/internal-report/summary.md`
- `artifacts/internal-report/summary.html`

## How to test this package in this repo right now

From the repository root:

```bash
npm run check:schemas
npm run check:examples
npm run test:private-reporter
```

What those do:

- `check:schemas` parses the JSON schemas.
- `check:examples` verifies the example/docs files exist.
- `test:private-reporter` builds the package and runs the node-based tests for:
  - `withPrivateReporter()` reporter injection,
  - `PrivateReporter` artifact generation, and
  - `generateReport` history-diff summary generation.

## Smoke test in a consumer repo

Once installed in an actual Playwright project:

1. add `withPrivateReporter(...)` to your `playwright.config.ts`,
2. run `npx playwright test`,
3. confirm `junit/results.xml` and `artifacts/internal-report/*.json` exist,
4. merge blob reports if you shard on CI, and
5. run `node ./node_modules/@your-org/playwright-private-reporter/dist/cli/generateReport.js` to produce `summary.md` and `summary.html`.

## Example files

- Playwright config example: `examples/playwright.config.ts`
- Jenkins pipeline example: `examples/Jenkinsfile`
- Architecture/build spec: `../../docs/playwright-private-reporter-build-spec.md`
