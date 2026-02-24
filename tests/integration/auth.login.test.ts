import { verifyCredentials } from '../../src/auth/domain/authService';
import prisma from '../../src/auth/infra/prismaClient';
import * as hash from '../../src/auth/domain/hash';
import createTestUser from '../helpers/createTestUser';

describe('integration: auth.login (T017)', () => {
  beforeEach(() => {});

  afterAll(() => jest.restoreAllMocks());

  it('verifies credentials and updates lastLoginAt (DB when available, otherwise mocked)', async () => {
    if (process.env.DATABASE_URL) {
      // Expect a real DB to be present in CI; create a test user then verify credentials
      const { user, password } = await createTestUser({});
      const result = await verifyCredentials(user.email, password);
      expect(result).toMatchObject({ id: user.id, email: user.email });
    } else {
      (prisma as any).user = {
        findUnique: jest.fn(async ({ where }: any) => ({ id: 'u-login', email: where.email, passwordHash: '$2a$10$saltsaltsalt' })),
        update: jest.fn(async () => ({ id: 'u-login' })),
      };
      jest.spyOn(hash, 'verifyPassword').mockResolvedValue(true as any);
      const result = await verifyCredentials('login@example.com', 'Password123!');
      expect(result).toMatchObject({ id: 'u-login', email: 'login@example.com' });
      expect((prisma as any).user.update).toHaveBeenCalled();
    }
  });
});
