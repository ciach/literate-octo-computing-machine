import { existsSync, readFileSync } from 'node:fs';

const files = [
  'README.md',
  'packages/playwright-private-reporter/examples/playwright.config.ts',
  'packages/playwright-private-reporter/examples/Jenkinsfile',
  'packages/playwright-private-reporter/README.md',
  'docs/playwright-private-reporter-build-spec.md'
];

for (const file of files) {
  if (!existsSync(file)) {
    throw new Error(`missing expected file: ${file}`);
  }

  const contents = readFileSync(file, 'utf8').trim();
  if (!contents) {
    throw new Error(`file is empty: ${file}`);
  }

  console.log(`checked ${file}`);
}
