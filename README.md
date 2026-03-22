# Playwright Private Reporter Workspace

This repository contains a Jenkins-first Playwright reporting package scaffold at `packages/playwright-private-reporter`.

## What is here

- `packages/playwright-private-reporter`: reusable TypeScript package.
- `docs/playwright-private-reporter-build-spec.md`: architecture and schema notes.
- `packages/playwright-private-reporter/examples`: starter Playwright and Jenkins examples.

## Quick start for this repo

### 1. Validate the schemas and examples

```bash
npm run check:schemas
npm run check:examples
```

### 2. Run the package test suite

```bash
npm run test:private-reporter
```

That script builds `packages/playwright-private-reporter` with `tsc` and then runs the node-based tests under `packages/playwright-private-reporter/tests`.

## Quick start for a consumer repo

1. Copy the example config from `packages/playwright-private-reporter/examples/playwright.config.ts`.
2. Follow the package installation and CI steps in `packages/playwright-private-reporter/README.md`.
3. Use the Jenkins pipeline example from `packages/playwright-private-reporter/examples/Jenkinsfile`.

## Repository test matrix

- `npm run check:schemas`: validates the JSON schema files parse correctly.
- `npm run check:examples`: confirms the example and documentation files exist.
- `npm run test:private-reporter`: builds the package and runs the red/green tests.
