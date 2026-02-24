// Validators implementation
export function validateEmail(email: string): string {
  if (!email || typeof email !== 'string') throw new Error('Invalid email');
  const normalized = email.trim().toLowerCase();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(normalized)) throw new Error('Invalid email format');
  return normalized;
}

export function validatePassword(password: string): boolean {
  if (!password || typeof password !== 'string') return false;
  const len = password.length;
  if (len < 8 || len > 128) return false;
  return true;
}
