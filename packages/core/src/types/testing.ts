export type TestFramework = 'jest' | 'vitest' | 'pytest' | 'go_test';
export type TDDPhase      = 'red' | 'green' | 'refactor';

export interface TestFailure {
  testName:   string;
  suiteName:  string;
  expected:   string;
  actual:     string;
  error:      string;
  stackTrace: string;
  file:       string;
  line:       number;
}

export interface CoverageFile {
  path:            string;
  coveragePercent: number;
  uncoveredLines:  number[];
}

export interface TestResult {
  id:              number;
  ticketId:        string;
  framework:       TestFramework;
  totalTests:      number;
  passed:          number;
  failed:          number;
  skipped:         number;
  durationMs:      number | null;
  coveragePercent: number | null;
  coverageDelta:   number | null;
  failures:        TestFailure[] | null;
  coverageDetail:  CoverageFile[] | null;
  stdout:          string | null;
  stderr:          string | null;
  isFlaky:         boolean;
  flakyCount:      number;
  runNumber:       number;
  triggeredBy:     string | null;
  agentRunId:      number | null;
  createdAt:       Date;
}

export type NewTestResult = Omit<TestResult, 'id' | 'createdAt'>;

export interface TestFile {
  id:        number;
  ticketId:  string;
  filePath:  string;
  content:   string;
  framework: TestFramework;
  agent:     string;
  version:   number;
  createdAt: Date;
}

export interface TDDConfig {
  framework:               TestFramework | 'auto';
  coverageTool:            'istanbul' | 'lcov' | 'coverage_py' | 'auto';
  thresholds: {
    enabled:                    boolean;
    minCoverageOnChangedFiles:   number;
    failOnDrop:                  boolean;
    warnOnDrop:                  boolean;
  };
  refactorPassEnabled:     boolean;
  failOnFlaky:             boolean;
  maxFlakyRetries:         number;
  mutationTestingEnabled:  boolean;
}
