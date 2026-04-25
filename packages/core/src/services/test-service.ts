import { testResultRepo } from '../repositories/test-result-repo';
import { testFileRepo } from '../repositories/test-file-repo';
import { activityService } from '../activity/activity-service';
import { detectFramework } from '../testing/framework-adapter';
import { testRunner } from '../testing/test-runner';
import { coverageService } from '../testing/coverage-service';
import type { TestResult, TDDConfig } from '../types/testing';
import fs from 'fs';
import path from 'path';

const DEFAULT_CONFIG: TDDConfig = {
  framework: 'auto',
  coverageTool: 'auto',
  thresholds: { enabled: true, minCoverageOnChangedFiles: 80, failOnDrop: true, warnOnDrop: true },
  refactorPassEnabled: true,
  failOnFlaky: false,
  maxFlakyRetries: 3,
  mutationTestingEnabled: false,
};

export const testService = {
  getConfig(): TDDConfig {
    try {
      const configPath = path.join(process.cwd(), '.decidr', 'config.json');
      if (fs.existsSync(configPath)) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(configPath, 'utf-8')) };
      }
    } catch {}
    return DEFAULT_CONFIG;
  },

  saveConfig(config: Partial<TDDConfig>): TDDConfig {
    const configDir = path.join(process.cwd(), '.decidr');
    if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
    const current = this.getConfig();
    const updated = { ...current, ...config };
    fs.writeFileSync(path.join(configDir, 'config.json'), JSON.stringify(updated, null, 2));
    return updated;
  },

  async run(ticketId: string, triggeredBy: 'agent' | 'user' | 'hook' = 'user'): Promise<TestResult> {
    const config = this.getConfig();
    const adapter = detectFramework(process.cwd());

    if (!adapter) {
      const result = await testResultRepo.create({
        ticketId, framework: 'jest', totalTests: 0, passed: 0, failed: 0, skipped: 0,
        durationMs: 0, coveragePercent: null, coverageDelta: null,
        failures: null, coverageDetail: null, stdout: 'No test framework detected',
        stderr: '', isFlaky: false, flakyCount: 0, runNumber: 1, triggeredBy, agentRunId: null,
      });
      return result;
    }

    const command = adapter.runCommand({ coverage: true });
    const { stdout, stderr, exitCode, durationMs } = await testRunner.execute(command);
    const parsed = adapter.parseResults(stdout, stderr);

    const previous = await testResultRepo.findLatestByTicket(ticketId);
    const coverageDelta = coverageService.delta(previous?.coveragePercent ?? null, null);

    const isFlaky = exitCode !== 0 && parsed.passed > 0;

    const result = await testResultRepo.create({
      ticketId, framework: adapter.name,
      totalTests: parsed.total, passed: parsed.passed, failed: parsed.failed, skipped: parsed.skipped,
      durationMs, coveragePercent: null, coverageDelta,
      failures: parsed.failures.length > 0 ? parsed.failures : null,
      coverageDetail: null, stdout, stderr, isFlaky, flakyCount: isFlaky ? 1 : 0,
      runNumber: (previous?.runNumber ?? 0) + 1, triggeredBy, agentRunId: null,
    });

    activityService.log({ ticketId, actorType: 'system', actionType: 'tests_run', payload: { total: parsed.total, passed: parsed.passed, failed: parsed.failed } }).catch(() => {});
    return result;
  },

  async getLatest(ticketId: string): Promise<TestResult | null> {
    return testResultRepo.findLatestByTicket(ticketId);
  },

  async getHistory(ticketId: string): Promise<TestResult[]> {
    return testResultRepo.findAllByTicket(ticketId);
  },

  async getFlaky(): Promise<TestResult[]> {
    return testResultRepo.findFlaky();
  },

  async getFiles(ticketId: string) {
    return testFileRepo.findByTicket(ticketId);
  },
};
