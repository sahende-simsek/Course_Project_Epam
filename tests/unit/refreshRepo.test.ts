import refreshRepo from '../../src/auth/infra/refreshRepo';
import prisma from '../../src/auth/infra/prismaClient';

describe('refreshRepo unit', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('createRefreshToken returns tokenId and expiresAt', async () => {
    (prisma as any).refreshToken = {
      create: jest.fn(async ({ data }: any) => ({ tokenId: 'tok1', expiresAt: data.expiresAt })),
    };
    const out = await refreshRepo.createRefreshToken('u1', new Date(Date.now() + 1000));
    expect(out.tokenId).toBe('tok1');
  });

  it('createRotatedToken creates child and revokes parent', async () => {
    (prisma as any).refreshToken = {
      create: jest.fn(async ({ data }: any) => ({ tokenId: 'tok2', expiresAt: data.expiresAt })),
      update: jest.fn(async () => ({})),
    };
    const res = await refreshRepo.createRotatedToken('parent-id', 'u1', new Date(Date.now() + 1000));
    expect(res.tokenId).toBe('tok2');
    expect((prisma as any).refreshToken.update).toHaveBeenCalled();
  });

  it('revokeAllForUser updates many', async () => {
    (prisma as any).refreshToken = { updateMany: jest.fn(async () => ({ count: 2 })) };
    const out = await refreshRepo.revokeAllForUser('u1');
    expect((prisma as any).refreshToken.updateMany).toHaveBeenCalledWith({ where: { userId: 'u1' }, data: { revoked: true } });
  });
});
