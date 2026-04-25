import fs from 'fs';
import path from 'path';
import type { TestFramework } from '../types/testing';

export interface FrameworkAdapter {
  name: TestFramework;
  detect(projectPath: string): boolean;
  runCommand(options: { coverage: boolean; filter?: string }): string;
  parseResults(stdout: string, stderr: string): {
    total: number; passed: number; failed: number; skipped: number;
    failures: Array<{ testName: string; suiteName: string; expected: string; actual: string; error: string; stackTrace: string; file: string; line: number }>;
  };
}

const jestAdapter: FrameworkAdapter = {
  name: 'jest',
  detect(p) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(p, 'package.json'), 'utf-8'));
      return !!(pkg.dependencies?.jest || pkg.devDependencies?.jest || pkg.dependencies?.['@jest/core'] || pkg.devDependencies?.['@jest/core'])
        || fs.existsSync(path.join(p, 'jest.config.js')) || fs.existsSync(path.join(p, 'jest.config.ts'));
    } catch { return false; }
  },
  runCommand({ coverage, filter }) {
    return `npx jest ${filter ? `--testNamePattern="${filter}"` : ''} ${coverage ? '--coverage' : ''} --json`;
  },
  parseResults(stdout) {
    try {
      const data = JSON.parse(stdout);
      const failures = (data.testResults ?? []).flatMap((suite: any) =>
        (suite.testResults ?? []).filter((t: any) => t.status === 'failed').map((t: any) => ({
          testName: t.fullName, suiteName: suite.testFilePath, expected: '', actual: '',
          error: t.failureMessages?.join('\n') ?? '', stackTrace: '', file: suite.testFilePath, line: 0,
        }))
      );
      return { total: data.numTotalTests ?? 0, passed: data.numPassedTests ?? 0, failed: data.numFailedTests ?? 0, skipped: data.numPendingTests ?? 0, failures };
    } catch { return { total: 0, passed: 0, failed: 0, skipped: 0, failures: [] }; }
  },
};

const vitestAdapter: FrameworkAdapter = {
  name: 'vitest',
  detect(p) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(p, 'package.json'), 'utf-8'));
      return !!(pkg.dependencies?.vitest || pkg.devDependencies?.vitest)
        || fs.existsSync(path.join(p, 'vitest.config.ts')) || fs.existsSync(path.join(p, 'vitest.config.js'));
    } catch { return false; }
  },
  runCommand({ coverage, filter }) {
    return `npx vitest run ${filter ? `--reporter=json -t "${filter}"` : '--reporter=json'} ${coverage ? '--coverage' : ''}`;
  },
  parseResults(stdout) {
    try {
      const data = JSON.parse(stdout);
      return { total: data.numTotalTests ?? 0, passed: data.numPassedTests ?? 0, failed: data.numFailedTests ?? 0, skipped: 0, failures: [] };
    } catch { return { total: 0, passed: 0, failed: 0, skipped: 0, failures: [] }; }
  },
};

const adapters: FrameworkAdapter[] = [jestAdapter, vitestAdapter];

export function detectFramework(projectPath: string): FrameworkAdapter | null {
  return adapters.find((a) => a.detect(projectPath)) ?? null;
}

export { jestAdapter, vitestAdapter };
