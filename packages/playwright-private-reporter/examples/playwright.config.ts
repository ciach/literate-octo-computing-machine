import { defineConfig } from '@playwright/test';
import { withPrivateReporter } from '@your-org/playwright-private-reporter';

export default withPrivateReporter(
  defineConfig({
    testDir: './tests',
    fullyParallel: true,
    retries: process.env.CI ? 1 : 0,
    use: {
      baseURL: process.env.BASE_URL,
    },
  }),
  {
    projectName: 'payments-ui',
    outputDir: 'artifacts',
    summaryTitle: 'Payments UI Playwright Summary',
    enableHistoryDiff: true,
  },
);
