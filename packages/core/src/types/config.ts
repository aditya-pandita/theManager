export interface AppConfig {
  databaseUrl: string;
  port: number;
  anthropicApiKey: string | undefined;
  hooksDir: string;
  decidrDir: string;
}

export function resolveConfig(): AppConfig {
  return {
    databaseUrl:
      process.env.DATABASE_URL ??
      'postgresql://decidr_code:decidr_code_dev@localhost:5434/decidr_code',
    port: parseInt(process.env.PORT ?? '3117', 10),
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    hooksDir: process.env.HOOKS_DIR ?? './hooks',
    decidrDir: process.env.DECIDR_DIR ?? './.decidr',
  };
}
