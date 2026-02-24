"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const refreshRepo_1 = __importDefault(require("../../src/auth/infra/refreshRepo"));
const prismaClient_1 = __importDefault(require("../../src/auth/infra/prismaClient"));
describe('refreshRepo unit', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('createRefreshToken returns tokenId and expiresAt', async () => {
        prismaClient_1.default.refreshToken = {
            create: jest.fn(async ({ data }) => ({ tokenId: 'tok1', expiresAt: data.expiresAt })),
        };
        const out = await refreshRepo_1.default.createRefreshToken('u1', new Date(Date.now() + 1000));
        expect(out.tokenId).toBe('tok1');
    });
    it('createRotatedToken creates child and revokes parent', async () => {
        prismaClient_1.default.refreshToken = {
            create: jest.fn(async ({ data }) => ({ tokenId: 'tok2', expiresAt: data.expiresAt })),
            update: jest.fn(async () => ({})),
        };
        const res = await refreshRepo_1.default.createRotatedToken('parent-id', 'u1', new Date(Date.now() + 1000));
        expect(res.tokenId).toBe('tok2');
        expect(prismaClient_1.default.refreshToken.update).toHaveBeenCalled();
    });
    it('revokeAllForUser updates many', async () => {
        prismaClient_1.default.refreshToken = { updateMany: jest.fn(async () => ({ count: 2 })) };
        const out = await refreshRepo_1.default.revokeAllForUser('u1');
        expect(prismaClient_1.default.refreshToken.updateMany).toHaveBeenCalledWith({ where: { userId: 'u1' }, data: { revoked: true } });
    });
});
