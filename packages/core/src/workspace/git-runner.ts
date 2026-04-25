import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface GitResult {
  ok: boolean;
  stdout: string;
  stderr: string;
}

function run(cwd: string, args: string[]): GitResult {
  try {
    const stdout = execFileSync('git', args, {
      cwd,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    });
    return { ok: true, stdout: stdout ?? '', stderr: '' };
  } catch (e: any) {
    const stderr = e?.stderr?.toString?.() ?? e?.message ?? String(e);
    const stdout = e?.stdout?.toString?.() ?? '';
    return { ok: false, stdout, stderr };
  }
}

export const gitRunner = {
  isRepo(cwd: string): boolean {
    return fs.existsSync(path.join(cwd, '.git'));
  },

  init(cwd: string, initialBranch = 'main'): GitResult {
    fs.mkdirSync(cwd, { recursive: true });
    return run(cwd, ['init', '-b', initialBranch]);
  },

  currentBranch(cwd: string): string | null {
    const r = run(cwd, ['rev-parse', '--abbrev-ref', 'HEAD']);
    return r.ok ? r.stdout.trim() : null;
  },

  branchExists(cwd: string, branchName: string): boolean {
    return run(cwd, ['rev-parse', '--verify', '--quiet', `refs/heads/${branchName}`]).ok;
  },

  checkoutBranch(cwd: string, branchName: string, createIfMissing = true): GitResult {
    if (this.branchExists(cwd, branchName)) {
      return run(cwd, ['checkout', branchName]);
    }
    if (!createIfMissing) {
      return { ok: false, stdout: '', stderr: `Branch ${branchName} does not exist` };
    }
    return run(cwd, ['checkout', '-b', branchName]);
  },

  /**
   * Stage paths and commit with the given message. Returns the new commit hash on success.
   * If there are no staged changes, returns ok:false with stderr explaining.
   */
  addAndCommit(
    cwd: string,
    paths: string[],
    message: string,
    author = 'Decidr Code <noreply@decidr.code>',
  ): GitResult & { hash?: string } {
    if (paths.length > 0) {
      const addRes = run(cwd, ['add', '--', ...paths]);
      if (!addRes.ok) return addRes;
    } else {
      const addRes = run(cwd, ['add', '-A']);
      if (!addRes.ok) return addRes;
    }

    // Skip commit if nothing to commit (avoids non-zero exit on empty diff)
    const status = run(cwd, ['status', '--porcelain']);
    if (status.ok && status.stdout.trim() === '') {
      return { ok: false, stdout: '', stderr: 'Nothing to commit (working tree clean)' };
    }

    const [name, emailMatch] = author.split('<');
    const email = emailMatch ? emailMatch.replace('>', '').trim() : 'noreply@decidr.code';
    const commitRes = run(cwd, [
      '-c', `user.name=${name.trim() || 'Decidr Code'}`,
      '-c', `user.email=${email}`,
      'commit', '-m', message,
    ]);
    if (!commitRes.ok) return commitRes;

    const hashRes = run(cwd, ['rev-parse', 'HEAD']);
    return { ...commitRes, hash: hashRes.ok ? hashRes.stdout.trim() : undefined };
  },

  diff(cwd: string, ref?: string): GitResult {
    return run(cwd, ref ? ['diff', ref] : ['diff', '--cached']);
  },
};
