import * as refreshService from '../../src/auth/domain/refreshService';
import refreshRepo from '../../src/auth/infra/refreshRepo';

describe('refreshService happy paths (auth.refresh subset)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('issues an initial refresh token for user', async () => {
    const spy = jest
      .spyOn(refreshRepo, 'createRefreshToken')
      .mockResolvedValue({ tokenId: 't-1', userId: 'u1', expiresAt: new Date() } as any);

    const result = await refreshService.issueRefreshTokenForUser('u1', '1.2.3.4', 'UA');
    expect(spy).toHaveBeenCalledWith('u1', expect.any(Date), '1.2.3.4', 'UA');
    expect(result).toHaveProperty('tokenId', 't-1');
  });

  it('revokeAllRefreshTokensForUser delegates to repo', async () => {
    const spy = jest.spyOn(refreshRepo, 'revokeAllForUser').mockResolvedValue(true as any);
    await refreshService.revokeAllRefreshTokensForUser('u2');
    expect(spy).toHaveBeenCalledWith('u2');
  });
});
