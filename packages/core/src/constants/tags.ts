export const TAGS = [
  'bug',
  'feature',
  'refactor',
  'perf',
  'docs',
  'test',
  'style',
  'infra',
] as const;

export type TagName = (typeof TAGS)[number];
