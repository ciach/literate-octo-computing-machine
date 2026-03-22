declare module '@playwright/test' {
  export type ReporterDescription = [string, unknown?];

  export type PlaywrightTestConfig = {
    reporter?: ReporterDescription | ReporterDescription[];
    outputDir?: string;
    use?: Record<string, unknown>;
    [key: string]: unknown;
  };

  export function defineConfig(config: PlaywrightTestConfig): PlaywrightTestConfig;
}

declare module '@playwright/test/reporter' {
  export interface Reporter {
    onTestEnd?(test: TestCase, result: TestResult): void;
    onEnd?(): Promise<void> | void;
    printsToStdio?(): boolean;
  }

  export type TestError = {
    message?: string;
    stack?: string;
  };

  export type TestResult = {
    status: 'passed' | 'failed' | 'skipped' | 'timedOut' | 'interrupted';
    retry: number;
    error?: TestError;
    attachments: Array<{
      name: string;
      contentType?: string;
      path?: string;
    }>;
  };

  export type TestLocation = {
    file: string;
    line: number;
    column: number;
  };

  export type TestCase = {
    id: string;
    title: string;
    location: TestLocation;
    titlePath(): string[];
    parent: {
      project?(): {
        name?: string;
      };
    };
  };
}
