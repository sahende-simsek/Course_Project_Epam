"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const refreshRepo_1 = __importDefault(require("../../src/auth/infra/refreshRepo"));
const refreshService_1 = require("../../src/auth/domain/refreshService");
describe('integration: auth.refresh (T022)', () => {
    beforeEach(() => {
        // mock refreshRepo behavior
        refreshRepo_1.default.findByTokenId = jest.fn(async (tokenId) => ({ id: 'r1', tokenId, userId: 'u1', revoked: false, expiresAt: new Date(Date.now() + 10000) }));
        refreshRepo_1.default.createRotatedToken = jest.fn(async (parentId, userId) => ({ tokenId: 'r2', expiresAt: new Date(Date.now() + 10000) }));
        refreshRepo_1.default.revokeAllForUser = jest.fn(async () => true);
    });
    it('rotates a refresh token and revokes the previous one', async () => {
        const oldTokenId = 'old-token-123';
        const { access, refresh } = await (0, refreshService_1.rotateRefreshToken)(oldTokenId, '1.2.3.4', 'UA-Test');
        expect(access).toHaveProperty('token');
        expect(refresh).toHaveProperty('tokenId');
        expect(refresh.tokenId).toBe('r2');
        expect(refreshRepo_1.default.createRotatedToken).toHaveBeenCalledWith('r1', 'u1', expect.any(Date), '1.2.3.4', 'UA-Test');
    });
});
