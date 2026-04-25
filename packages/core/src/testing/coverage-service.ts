import fs from 'fs';
import path from 'path';
import type { CoverageFile } from '../types/testing';

export const coverageService = {
  parseLcov(reportPath: string): { overall: number; files: CoverageFile[] } {
    try {
      const content = fs.readFileSync(reportPath, 'utf-8');
      const files: CoverageFile[] = [];
      let currentFile = '';
      let found = 0, total = 0;

      for (const line of content.split('\n')) {
        if (line.startsWith('SF:')) currentFile = line.slice(3).trim();
        if (line.startsWith('LF:')) total += parseInt(line.slice(3)) || 0;
        if (line.startsWith('LH:')) found += parseInt(line.slice(3)) || 0;
        if (line === 'end_of_record' && currentFile) {
          files.push({ path: currentFile, coveragePercent: 0, uncoveredLines: [] });
          currentFile = '';
        }
      }

      const overall = total > 0 ? Math.round((found / total) * 100) : 0;
      return { overall, files };
    } catch {
      return { overall: 0, files: [] };
    }
  },

  delta(previous: number | null, current: number | null): number {
    if (previous == null || current == null) return 0;
    return Math.round((current - previous) * 100) / 100;
  },
};
