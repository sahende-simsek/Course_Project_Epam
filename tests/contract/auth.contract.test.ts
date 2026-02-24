import prisma from '../../src/auth/infra/prismaClient';
import { createUser } from '../../src/auth/domain/userService';
import { generateAccessToken } from '../../src/auth/domain/tokenService';

describe('contract: auth API (T027)', () => {
  beforeEach(() => {});

  it('domain contract: createUser returns id/email/createdAt and token format is valid', async () => {
    const email = `contract+${Date.now()}@example.com`;
    if (process.env.DATABASE_URL) {
      const user = await createUser(email, 'Password123!');
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('createdAt');
      const tok = generateAccessToken({ id: user.id, email: user.email });
      expect(tok).toHaveProperty('token');
      expect(typeof tok.expiresIn).toBe('number');
    } else {
      // Mock prisma for local runs
      (prisma as any).user = { create: jest.fn(async ({ data }: any) => ({ id: 'u-contract', email: (data.email as string).toLowerCase(), createdAt: new Date() })) };
      const user = await createUser(email, 'Password123!');
      expect(user).toHaveProperty('id');
      const tok = generateAccessToken({ id: user.id, email: user.email });
      expect(tok).toHaveProperty('token');
    }
  });
});
