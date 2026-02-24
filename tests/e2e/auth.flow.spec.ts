import { test, expect } from '@playwright/test';

// Create a simple in-memory mock for prisma client so E2E runs without a real DB.
const users: Record<string, any> = {};
const refreshTokens: Record<string, any> = {};
let userCounter = 1;
let refreshCounter = 1;

const mockPrisma = {
  prisma: {
    user: {
      create: async ({ data }: any) => {
        const id = `u-${userCounter++}`;
        const rec = { id, email: data.email, passwordHash: data.passwordHash, createdAt: new Date() };
        users[id] = rec;
        users[data.email] = rec;
        return rec;
      },
      findUnique: async ({ where }: any) => {
        if (where.email) return users[where.email] ?? null;
        if (where.id) return users[where.id] ?? null;
        return null;
      },
      update: async ({ where, data }: any) => {
        const u = users[where.id];
        if (u) Object.assign(u, data);
        return u;
      },
      delete: async ({ where }: any) => {
        const u = users[where.id];
        if (u) {
          delete users[u.email];
          delete users[where.id];
        }
        return u;
      },
    },
    refreshToken: {
      create: async ({ data }: any) => {
        const id = `r-${refreshCounter++}`;
        const rec = { id, tokenId: data.tokenId ?? `t-${id}`, userId: data.userId, expiresAt: data.expiresAt, revoked: false };
        refreshTokens[rec.tokenId] = rec;
        return rec;
      },
      findUnique: async ({ where }: any) => {
        return refreshTokens[where.tokenId] ?? null;
      },
      update: async ({ where, data }: any) => {
        const byId = Object.values(refreshTokens).find((r: any) => r.id === where.id);
        if (byId) Object.assign(byId, data);
        return byId;
      },
      updateMany: async ({ where, data }: any) => {
        let count = 0;
        Object.values(refreshTokens).forEach((r: any) => {
          if ((where.tokenId && r.tokenId === where.tokenId) || (where.userId && r.userId === where.userId) || (where.id && r.id === where.id)) {
            Object.assign(r, data);
            count++;
          }
        });
        return { count };
      },
    },
  },
  default: {},
};

// expose both named and default exports like the real module
mockPrisma.default = mockPrisma.prisma;

// Use TEST_USE_INMEMORY env flag so the app's prismaClient exports an in-memory stub.
process.env.TEST_USE_INMEMORY = '1';

const { createUser } = require('../../src/auth/domain/userService');
const { verifyCredentials } = require('../../src/auth/domain/authService');
const refreshRepo = require('../../src/auth/infra/refreshRepo');
const { rotateRefreshToken, revokeAllRefreshTokensForUser } = require('../../src/auth/domain/refreshService');
const prisma = require('../../src/auth/infra/prismaClient').prisma;

test.describe('E2E auth flow', () => {
  test('register -> login -> refresh -> logout', async () => {
    const email = `e2e+${Date.now()}@example.com`;
    const password = 'Password123!';

    // Register
    const user = await createUser(email, password);
    expect(user).toHaveProperty('id');

    // Login (verify credentials)
    const verified = await verifyCredentials(email, password);
    expect(verified).toHaveProperty('id');

    // Create a refresh token record (simulate cookie issuance)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const created = await refreshRepo.createRefreshToken(user.id, expiresAt);
    expect(created).toHaveProperty('tokenId');

    // Refresh: rotate the token and get new access token
    const rotated = await rotateRefreshToken(created.tokenId);
    expect(rotated).toHaveProperty('access');
    expect(rotated.access).toHaveProperty('token');

    // Logout: revoke all tokens for user
    await revokeAllRefreshTokensForUser(user.id);

    // After revoke, the token should be marked revoked
    const rec = await refreshRepo.findByTokenId(created.tokenId);
    expect(rec?.revoked).toBeTruthy();

    // Cleanup user
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
  });
});
