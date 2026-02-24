jest.mock('../../src/auth/infra/prismaClient', () => ({
  __esModule: true,
  prisma: {
    user: {
      create: jest.fn().mockResolvedValue({ id: 'u1', email: 'a@b.com' }),
    },
  },
  default: {
    user: {
      create: jest.fn().mockResolvedValue({ id: 'u1', email: 'a@b.com' }),
    },
  },
}));

jest.mock('../../src/auth/domain/hash', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed'),
}));

import { createTestUser } from '../../tests/helpers/createTestUser';

describe('createTestUser helper', () => {
  it('creates a test user via helper', async () => {
    const out = await createTestUser({ email: 'x@y.com', password: 'Password123!' } as any);
    expect(out).toHaveProperty('user');
    expect(out).toHaveProperty('password');
  });
});
