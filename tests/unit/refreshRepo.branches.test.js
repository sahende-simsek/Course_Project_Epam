"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('../../src/auth/infra/prismaClient', () => ({
    __esModule: true,
    prisma: {
        refreshToken: {
            create: jest.fn().mockResolvedValue({ tokenId: 'tok', expiresAt: new Date() }),
            update: jest.fn().mockResolvedValue({}),
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            findUnique: jest.fn().mockResolvedValue(null),
        },
    },
    default: {
        refreshToken: {
            create: jest.fn().mockResolvedValue({ tokenId: 'tok', expiresAt: new Date() }),
            update: jest.fn().mockResolvedValue({}),
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            findUnique: jest.fn().mockResolvedValue(null),
        },
    },
}));
const refreshRepo_1 = require("../../src/auth/infra/refreshRepo");
describe('refreshRepo branches', () => {
    it('createRefreshToken returns token info', async () => {
        const out = await (0, refreshRepo_1.createRefreshToken)('user1', new Date(), '1.2.3.4', 'ua');
        expect(out).toHaveProperty('tokenId');
    });
    it('createRotatedToken handles update error path (swallowed)', async () => {
        const prisma = require('../../src/auth/infra/prismaClient').default;
        prisma.refreshToken.update.mockRejectedValueOnce(new Error('boom'));
        const out = await (0, refreshRepo_1.createRotatedToken)('parent-id', 'user1', new Date(), 'ip', 'ua');
        expect(out).toHaveProperty('tokenId');
    });
    it('revoke functions call updateMany and return result', async () => {
        const r1 = await (0, refreshRepo_1.revokeTokenById)('tok');
        expect(r1).toHaveProperty('count');
        const r2 = await (0, refreshRepo_1.revokeTokenRecord)('id');
        expect(r2).toHaveProperty('count');
        const r3 = await (0, refreshRepo_1.revokeAllForUser)('user1');
        expect(r3).toHaveProperty('count');
    });
});
