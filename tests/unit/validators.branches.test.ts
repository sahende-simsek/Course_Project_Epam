import { validateEmail, validatePassword } from '../../src/auth/domain/validators';

describe('validators branches', () => {
  it('normalizes and validates a valid email', () => {
    const out = validateEmail('  TeSt@Example.COM ');
    expect(out).toBe('test@example.com');
  });

  it('throws on empty or invalid email', () => {
    expect(() => validateEmail('')).toThrow(/Invalid email/);
    expect(() => validateEmail('not-an-email')).toThrow(/Invalid email format/);
  });

  it('validates password length boundaries', () => {
    expect(validatePassword('short')).toBe(false);
    const ok = 'longenoughpassword';
    expect(validatePassword(ok)).toBe(true);
    const long = 'x'.repeat(129);
    expect(validatePassword(long)).toBe(false);
  });
});
