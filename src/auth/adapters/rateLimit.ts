// Simple in-memory rate limiter for demo/testing. Replace with distributed store in prod.
const ipMap: Map<string, { count: number; firstAt: number }> = new Map();

export function rateLimit(ip: string, limit = 5, windowMs = 60 * 1000) {
  const now = Date.now();
  const rec = ipMap.get(ip) || { count: 0, firstAt: now };
  if (now - rec.firstAt > windowMs) {
    rec.count = 1;
    rec.firstAt = now;
  } else {
    rec.count += 1;
  }
  ipMap.set(ip, rec);
  return rec.count <= limit;
}

export function resetRateLimit() { ipMap.clear(); }

export default { rateLimit, resetRateLimit };
