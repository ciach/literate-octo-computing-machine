import { readFileSync } from 'node:fs';

const files = [
  'packages/playwright-private-reporter/schemas/run.schema.json',
  'packages/playwright-private-reporter/schemas/failures.schema.json'
];

for (const file of files) {
  JSON.parse(readFileSync(file, 'utf8'));
  console.log(`validated ${file}`);
}
