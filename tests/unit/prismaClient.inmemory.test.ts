describe('prismaClient in-memory stub', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.TEST_USE_INMEMORY = '1';
  });

  afterEach(() => {
    delete process.env.TEST_USE_INMEMORY;
    jest.resetModules();
  });

  it('provides user and refreshToken methods', async () => {
    const mod = require('../../src/auth/infra/prismaClient');
    const prisma = mod.prisma;
    const u = await prisma.user.create({ data: { email: 'a@b.com', passwordHash: 'h' } });
    expect(u).toHaveProperty('id');
    const found = await prisma.user.findUnique({ where: { email: 'a@b.com' } });
    expect(found).not.toBeNull();

    const expiresAt = new Date(Date.now() + 1000 * 60);
    const r = await prisma.refreshToken.create({ data: { userId: u.id, expiresAt } });
    expect(r).toHaveProperty('tokenId');
    const byToken = await prisma.refreshToken.findUnique({ where: { tokenId: r.tokenId } });
    expect(byToken).not.toBeNull();
    await prisma.refreshToken.updateMany({ where: { tokenId: r.tokenId }, data: { revoked: true } });
    const updated = await prisma.refreshToken.findUnique({ where: { tokenId: r.tokenId } });
    expect(updated.revoked).toBeTruthy();

    // exercise negative branches
    const notFound = await prisma.user.findUnique({ where: { id: 'no-such-id' } });
    expect(notFound).toBeNull();
    const updMissing = await prisma.user.update({ where: { id: 'no-such-id' }, data: { lastLoginAt: new Date() } });
    expect(updMissing).toBeUndefined();
    const delMissing = await prisma.user.delete({ where: { id: 'no-such-id' } });
    expect(delMissing).toBeUndefined();

    const updateNonMatch = await prisma.refreshToken.update({ where: { id: 'nope' }, data: { revoked: true } });
    expect(updateNonMatch).toBeUndefined();
    const bulk = await prisma.refreshToken.updateMany({ where: { tokenId: 'nope' }, data: { revoked: true } });
    expect(bulk).toHaveProperty('count');
  });
});
