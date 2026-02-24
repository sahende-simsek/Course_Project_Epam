import refreshRepo from '../../src/auth/infra/refreshRepo';
import { rotateRefreshToken } from '../../src/auth/domain/refreshService';

describe('integration: auth.refresh (T022)', () => {
  beforeEach(() => {
    // mock refreshRepo behavior
    (refreshRepo as any).findByTokenId = jest.fn(async (tokenId: string) => ({ id: 'r1', tokenId, userId: 'u1', revoked: false, expiresAt: new Date(Date.now() + 10000) }));
    (refreshRepo as any).createRotatedToken = jest.fn(async (parentId: string, userId: string) => ({ tokenId: 'r2', expiresAt: new Date(Date.now() + 10000) }));
    (refreshRepo as any).revokeAllForUser = jest.fn(async () => true);
  });

  it('rotates a refresh token and revokes the previous one', async () => {
    const oldTokenId = 'old-token-123';
    const { access, refresh } = await rotateRefreshToken(oldTokenId, '1.2.3.4', 'UA-Test');
    expect(access).toHaveProperty('token');
    expect(refresh).toHaveProperty('tokenId');
    expect(refresh.tokenId).toBe('r2');
    expect((refreshRepo as any).createRotatedToken).toHaveBeenCalledWith('r1', 'u1', expect.any(Date), '1.2.3.4', 'UA-Test');
  });
});
