import refreshRepo from '../infra/refreshRepo';
import { generateAccessToken } from './tokenService';
import type { HttpError } from './types';

const REFRESH_TTL_MS = 7 * 24 * 3600 * 1000; // 7 days

export async function rotateRefreshToken(oldTokenId: string, ip?: string, userAgent?: string) {
  const rec = await refreshRepo.findByTokenId(oldTokenId);
  if (!rec) {
  const e = new Error('Invalid refresh token') as HttpError;
  e.status = 401;
  throw e;
  }
  if (rec.revoked) {
    // replay detected — revoke all for user
    await refreshRepo.revokeAllForUser(rec.userId);
  const e = new Error('Refresh token replay detected') as HttpError;
  e.status = 403;
  throw e;
  }
  if (rec.expiresAt < new Date()) {
  const e = new Error('Refresh token expired') as HttpError;
  e.status = 401;
  throw e;
  }

  // create rotated
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);
  const rotated = await refreshRepo.createRotatedToken(rec.id, rec.userId, expiresAt, ip, userAgent);

  // issue new access token
  const access = generateAccessToken({ id: rec.userId });
  return { access, refresh: rotated };
}

export async function revokeAllRefreshTokensForUser(userId: string) {
  return refreshRepo.revokeAllForUser(userId);
}

export default { rotateRefreshToken, revokeAllRefreshTokensForUser };

