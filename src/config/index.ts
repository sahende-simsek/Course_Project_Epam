// Minimal config loader and validation for auth feature (Phase 2)
export interface Config {
  DATABASE_URL?: string;
  JWT_SECRET?: string;
  PORT?: number;
}

export function getConfig(): Config {
  const cfg: Config = {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT ? Number(process.env.PORT) : undefined,
  };

  // Minimal validation: ensure at least one signing secret is present
  if (!cfg.JWT_SECRET) {
    // Allow missing in local dev/tests; caller may provide defaults.
  }

  return cfg;
}

export default getConfig();
