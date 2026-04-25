import { execFile } from 'child_process';
import path from 'path';

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
}

export const testRunner = {
  async execute(command: string, cwd: string = process.cwd(), timeoutMs = 120000): Promise<RunResult> {
    return new Promise((resolve) => {
      const start = Date.now();
      const parts = command.split(' ');
      const bin = parts[0];
      const args = parts.slice(1);

      execFile(bin, args, { cwd, timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
        resolve({
          stdout: stdout ?? '',
          stderr: stderr ?? '',
          exitCode: err?.code ?? 0,
          durationMs: Date.now() - start,
        });
      });
    });
  },
};
