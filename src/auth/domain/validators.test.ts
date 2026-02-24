import { validateEmail, validatePassword } from './validators';

describe('validators (T008)', () => {
  it('normalizes and validates email (should fail until implemented)', () => {
    const input = 'User@Example.COM';
    // Expected normalized result from spec: lowercase
    expect(validateEmail(input)).toBe('user@example.com');
  });

  it('rejects short passwords (should fail until implemented)', () => {
    expect(validatePassword('short')).toBe(false);
  });
});
