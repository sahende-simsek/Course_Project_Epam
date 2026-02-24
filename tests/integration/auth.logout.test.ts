import refreshRepo from '../../src/auth/infra/refreshRepo';
import { revokeAllRefreshTokensForUser } from '../../src/auth/domain/refreshService';

describe('integration: auth.logout (T019)', () => {
  beforeEach(() => {
    (refreshRepo as any).revokeAllForUser = jest.fn(async () => true);
    (refreshRepo as any).findByTokenId = jest.fn(async (tokenId: string) => ({ tokenId, revoked: true }));
  });

  it('revokes all refresh tokens for a user on logout', async () => {
    const userId = 'u-logout-1';
    await revokeAllRefreshTokensForUser(userId);
    expect((refreshRepo as any).revokeAllForUser).toHaveBeenCalledWith(userId);
    const ra = await (refreshRepo as any).findByTokenId('anything');
    expect(ra.revoked).toBe(true);
  });
});
