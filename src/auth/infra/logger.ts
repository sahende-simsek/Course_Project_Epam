// Minimal structured logger wrapper for auth feature (Phase 2)
export function info(message: string, meta?: Record<string, unknown>) {
  console.log(JSON.stringify({ level: 'info', message, ...meta }));
}

export function warn(message: string, meta?: Record<string, unknown>) {
  console.warn(JSON.stringify({ level: 'warn', message, ...meta }));
}

export function error(message: string, meta?: Record<string, unknown>) {
  console.error(JSON.stringify({ level: 'error', message, ...meta }));
}

const logger = { info, warn, error };
export default logger;
