import { verifyCredentials } from '../../src/auth/domain/authService';
import prisma from '../../src/auth/infra/prismaClient';
import * as hash from '../../src/auth/domain/hash';

describe('authService errors', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws 401 when user not found', async () => {
    (prisma as any).user = { findUnique: jest.fn(async () => null) };
    await expect(verifyCredentials('nope@example.com', 'x')).rejects.toMatchObject({ message: expect.stringContaining('Invalid credentials') });
  });

  it('throws 401 when password mismatch', async () => {
    (prisma as any).user = { findUnique: jest.fn(async () => ({ id: 'u1', email: 'u1@example.com', passwordHash: 'h' })), update: jest.fn() };
    jest.spyOn(hash, 'verifyPassword').mockResolvedValue(false as any);
    await expect(verifyCredentials('u1@example.com', 'bad')).rejects.toMatchObject({ message: expect.stringContaining('Invalid credentials') });
  });
});
