import prisma from './prismaClient';
import { randomBytes } from 'crypto';

function genTokenId() {
  return randomBytes(32).toString('hex');
}

export async function createRefreshToken(userId: string, expiresAt: Date, ip?: string, userAgent?: string) {
  const tokenId = genTokenId();
  const record = await prisma.refreshToken.create({
    data: { tokenId, userId, expiresAt, ip, userAgent },
  });
  return { tokenId: record.tokenId, expiresAt: record.expiresAt };
}

export async function findByTokenId(tokenId: string) {
  return prisma.refreshToken.findUnique({ where: { tokenId } });
}

export async function revokeTokenById(tokenId: string) {
  return prisma.refreshToken.updateMany({ where: { tokenId }, data: { revoked: true } });
}

export async function revokeTokenRecord(id: string) {
  return prisma.refreshToken.updateMany({ where: { id }, data: { revoked: true } });
}

export async function createRotatedToken(parentId: string, userId: string, expiresAt: Date, ip?: string, userAgent?: string) {
  const tokenId = genTokenId();
  const record = await prisma.refreshToken.create({
    data: { tokenId, userId, expiresAt, ip, userAgent, parentTokenId: parentId },
  });
  await prisma.refreshToken.update({ where: { id: parentId }, data: { revoked: true, lastUsedAt: new Date() } }).catch(() => {});
  return { tokenId: record.tokenId, expiresAt: record.expiresAt };
}

export async function revokeAllForUser(userId: string) {
  return prisma.refreshToken.updateMany({ where: { userId }, data: { revoked: true } });
}

export default { createRefreshToken, findByTokenId, revokeTokenById, createRotatedToken, revokeAllForUser };
