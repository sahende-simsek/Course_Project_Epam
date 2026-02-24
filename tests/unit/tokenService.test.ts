import { generateAccessToken } from '../../src/auth/domain/tokenService';

describe('tokenService', () => {
  test('generateAccessToken returns token and expiresIn', () => {
    const user = { id: 'u-1', email: 'a@b.com' };
    const result = generateAccessToken(user as any);
    expect(result).toHaveProperty('token');
    expect(typeof result.expiresIn).toBe('number');
  });
});
