export const TAGS = [
  'bug',
  'feature',
  'refactor',
  'docs',
  'test',
] as const;

export type TagName = (typeof TAGS)[number];
