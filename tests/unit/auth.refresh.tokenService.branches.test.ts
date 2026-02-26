import { generateAccessToken } from '../../src/auth/domain/tokenService';

describe('tokenService branches (auth.refresh subset)', () => {
  const originalEnv = process.env.JWT_SECRET;

  afterEach(() => {
    process.env.JWT_SECRET = originalEnv;
  });

  it('falls back to default secret when JWT_SECRET is not set', () => {
    delete process.env.JWT_SECRET;
    const out = generateAccessToken({ id: 'u1', email: 'a@b.com' } as any);
    expect(out).toHaveProperty('token');
  });

  it('works when JWT_SECRET is set explicitly', () => {
    process.env.JWT_SECRET = 'test-secret';
    const out = generateAccessToken({ id: 'u2', email: 'b@b.com' } as any);
    expect(out).toHaveProperty('token');
  });
});
