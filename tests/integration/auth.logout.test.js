"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const refreshRepo_1 = __importDefault(require("../../src/auth/infra/refreshRepo"));
const refreshService_1 = require("../../src/auth/domain/refreshService");
describe('integration: auth.logout (T019)', () => {
    beforeEach(() => {
        refreshRepo_1.default.revokeAllForUser = jest.fn(async () => true);
        refreshRepo_1.default.findByTokenId = jest.fn(async (tokenId) => ({ tokenId, revoked: true }));
    });
    it('revokes all refresh tokens for a user on logout', async () => {
        const userId = 'u-logout-1';
        await (0, refreshService_1.revokeAllRefreshTokensForUser)(userId);
        expect(refreshRepo_1.default.revokeAllForUser).toHaveBeenCalledWith(userId);
        const ra = await refreshRepo_1.default.findByTokenId('anything');
        expect(ra.revoked).toBe(true);
    });
});
