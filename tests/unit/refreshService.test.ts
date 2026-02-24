import * as refreshService from '../../src/auth/domain/refreshService';
import refreshRepo from '../../src/auth/infra/refreshRepo';

describe('refreshService branches', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws 401 for missing record', async () => {
    jest.spyOn(refreshRepo, 'findByTokenId').mockResolvedValue(null as any);
    await expect(refreshService.rotateRefreshToken('nope')).rejects.toMatchObject({ message: expect.stringContaining('Invalid refresh token') });
  });

  it('handles revoked record as replay and revokes all', async () => {
    jest.spyOn(refreshRepo, 'findByTokenId').mockResolvedValue({ id: 'r1', userId: 'u1', revoked: true, expiresAt: new Date(Date.now() + 1000) } as any);
    const revokeSpy = jest.spyOn(refreshRepo, 'revokeAllForUser').mockResolvedValue(true as any);
    await expect(refreshService.rotateRefreshToken('r1')).rejects.toMatchObject({ message: expect.stringContaining('replay') });
    expect(revokeSpy).toHaveBeenCalledWith('u1');
  });

  it('throws 401 for expired token', async () => {
    jest.spyOn(refreshRepo, 'findByTokenId').mockResolvedValue({ id: 'r1', userId: 'u1', revoked: false, expiresAt: new Date(Date.now() - 1000) } as any);
    await expect(refreshService.rotateRefreshToken('r1')).rejects.toMatchObject({ message: expect.stringContaining('expired') });
  });
});
