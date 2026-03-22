# Playwright Private Reporter Build Spec

## Goals

Build a reusable TypeScript package that keeps Playwright reporting private inside Jenkins while still providing a good triage experience.

## Package scope

The first implementation lives in `packages/playwright-private-reporter` and exposes four entry points:

1. `withPrivateReporter(baseConfig, options)` for consumer repo configuration.
2. `PrivateReporter` for per-run JSON summary generation.
3. `generateReport` CLI for merge-time packaging and static summary generation.
4. History helpers for comparing the current run to a previous Jenkins artifact.

## v1 conventions

### Package name

- Public import: `@your-org/playwright-private-reporter`
- Workspace path: `packages/playwright-private-reporter`

### Output directories

- `blob-report/` for Playwright blob archives.
- `playwright-report/` for merged HTML output.
- `test-results/` for traces, screenshots, and videos.
- `junit/results.xml` for Jenkins trend ingestion.
- `internal-report/run.json` for run metadata and aggregate counts.
- `internal-report/failures.json` for grouped failures and fingerprints.
- `internal-report/summary.md` for text summaries.
- `internal-report/summary.html` for the main Jenkins-facing report.

### Build metadata environment variables

- Build URL: `BUILD_URL`
- Build identifier: `BUILD_TAG`
- Branch: `BRANCH_NAME`
- Commit SHA: `GIT_COMMIT`

### History diff strategy

v1 compares the current run to the previous successful Jenkins build artifact, not workspace leftovers.

### Summary page constraints

`summary.html` is intentionally mostly static HTML and CSS so it works under Jenkins CSP without requiring custom policy changes.

## File-by-file scaffold

### Package root

- `package.json`: package metadata, scripts, exports, and peer dependencies.
- `tsconfig.json`: package-local TypeScript build settings.

### Source tree

- `src/index.ts`: public exports.
- `src/config/withPrivateReporter.ts`: reporter normalization and config defaults.
- `src/reporter/PrivateReporter.ts`: custom reporter implementation.
- `src/reporter/fingerprint.ts`: failure fingerprint helpers.
- `src/reporter/attachments.ts`: attachment normalization utilities.
- `src/reporter/summary.ts`: run and failure summary builders.
- `src/history/loadPrevious.ts`: previous artifact loading helpers.
- `src/history/diffRuns.ts`: current-vs-previous comparison logic.
- `src/cli/generateReport.ts`: summary generation CLI.
- `src/templates/summary.html.ts`: static Jenkins-safe HTML renderer.
- `src/types/schema.ts`: shared TypeScript types for JSON output.

### Supporting artifacts

- `schemas/run.schema.json`: JSON schema for `internal-report/run.json`.
- `schemas/failures.schema.json`: JSON schema for `internal-report/failures.json`.
- `examples/playwright.config.ts`: consumer usage example.
- `examples/Jenkinsfile`: Jenkins declarative pipeline example.

## JSON schema summary

### `run.json`

Top-level fields:

- `schemaVersion`
- `projectName`
- `generatedAt`
- `run`
- `counts`
- `projects`
- `history`
- `artifacts`
- `failures`

### `failures.json`

Top-level fields:

- `schemaVersion`
- `projectName`
- `generatedAt`
- `groups`

Each group stores:

- `fingerprint`
- `title`
- `normalizedMessage`
- `firstMeaningfulStack`
- `testFile`
- `projectName`
- `status`
- `countInRun`
- `tests`
- `exampleAttachments`
- `history`

## Initial implementation notes

- The custom reporter should wrap lifecycle work in defensive error handling because Playwright reporter exceptions are not surfaced reliably.
- The reporter should return `false` from `printsToStdio()` so the normal terminal reporter still works.
- Merge-time summary generation should work from either a reporter-emitted `run.json` or a merged Playwright JSON payload later, without changing the public API.
- The summary page should link to archived traces, screenshots, videos, JUnit XML, and the merged Playwright HTML report.

## Adoption path for a consumer repo

1. Add the package dependency.
2. Replace `defineConfig(...)` export with `withPrivateReporter(defineConfig(...), options)`.
3. Keep local development simple with list/html reporters outside CI.
4. In Jenkins, run Playwright with blob + junit + custom reporter, merge shards, run the CLI, then publish HTML and archive artifacts.
