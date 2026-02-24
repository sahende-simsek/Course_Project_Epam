"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const refreshService = __importStar(require("../../src/auth/domain/refreshService"));
const refreshRepo_1 = __importDefault(require("../../src/auth/infra/refreshRepo"));
describe('refreshService branches', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('throws 401 for missing record', async () => {
        jest.spyOn(refreshRepo_1.default, 'findByTokenId').mockResolvedValue(null);
        await expect(refreshService.rotateRefreshToken('nope')).rejects.toMatchObject({ message: expect.stringContaining('Invalid refresh token') });
    });
    it('handles revoked record as replay and revokes all', async () => {
        jest.spyOn(refreshRepo_1.default, 'findByTokenId').mockResolvedValue({ id: 'r1', userId: 'u1', revoked: true, expiresAt: new Date(Date.now() + 1000) });
        const revokeSpy = jest.spyOn(refreshRepo_1.default, 'revokeAllForUser').mockResolvedValue(true);
        await expect(refreshService.rotateRefreshToken('r1')).rejects.toMatchObject({ message: expect.stringContaining('replay') });
        expect(revokeSpy).toHaveBeenCalledWith('u1');
    });
    it('throws 401 for expired token', async () => {
        jest.spyOn(refreshRepo_1.default, 'findByTokenId').mockResolvedValue({ id: 'r1', userId: 'u1', revoked: false, expiresAt: new Date(Date.now() - 1000) });
        await expect(refreshService.rotateRefreshToken('r1')).rejects.toMatchObject({ message: expect.stringContaining('expired') });
    });
});
