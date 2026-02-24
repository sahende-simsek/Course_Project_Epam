import { generateAccessToken } from '../../src/auth/domain/tokenService';

describe('auth service (T013)', () => {
  it('generates access token payload', () => {
    const res = generateAccessToken({ id: 'user-id-1', email: 'a@b.com' });
    expect(res).toHaveProperty('token');
    expect(res).toHaveProperty('expiresIn');
  });
});
