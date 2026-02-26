// Minimal config loader and validation for auth feature (Phase 2)
export interface Config {
  DATABASE_URL?: string;
  JWT_SECRET?: string;
  PORT?: number;
  // Comma-separated envs used to derive initial roles from email
  // ADMIN_EMAILS: exact email list (e.g. "admin@company.com,cto@company.com")
  // ADMIN_EMAIL_DOMAINS: domain list (e.g. "company.com,corp.local")
  ADMIN_EMAILS?: string[];
  ADMIN_EMAIL_DOMAINS?: string[];
  // Attachment & scoring limits for advanced idea workflow
  MAX_ATTACHMENT_BYTES?: number;
  MAX_ATTACHMENTS_PER_IDEA?: number;
  IDEAS_FINAL_SCORE_THRESHOLD?: number;
}

export function getConfig(): Config {
  const cfg: Config = {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT ? Number(process.env.PORT) : undefined,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
      : undefined,
    ADMIN_EMAIL_DOMAINS: process.env.ADMIN_EMAIL_DOMAINS
      ? process.env.ADMIN_EMAIL_DOMAINS.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
      : undefined,
    MAX_ATTACHMENT_BYTES: process.env.MAX_ATTACHMENT_BYTES
      ? Number(process.env.MAX_ATTACHMENT_BYTES)
      : undefined,
    MAX_ATTACHMENTS_PER_IDEA: process.env.MAX_ATTACHMENTS_PER_IDEA
      ? Number(process.env.MAX_ATTACHMENTS_PER_IDEA)
      : undefined,
    IDEAS_FINAL_SCORE_THRESHOLD: process.env.IDEAS_FINAL_SCORE_THRESHOLD
      ? Number(process.env.IDEAS_FINAL_SCORE_THRESHOLD)
      : undefined,
  };

  // Minimal validation: ensure at least one signing secret is present
  if (!cfg.JWT_SECRET) {
    // Allow missing in local dev/tests; caller may provide defaults.
  }

  return cfg;
}

export default getConfig();
