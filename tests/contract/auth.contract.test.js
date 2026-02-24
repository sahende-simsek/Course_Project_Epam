"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaClient_1 = __importDefault(require("../../src/auth/infra/prismaClient"));
const userService_1 = require("../../src/auth/domain/userService");
const tokenService_1 = require("../../src/auth/domain/tokenService");
describe('contract: auth API (T027)', () => {
    beforeEach(() => { });
    it('domain contract: createUser returns id/email/createdAt and token format is valid', async () => {
        const email = `contract+${Date.now()}@example.com`;
        if (process.env.DATABASE_URL) {
            const user = await (0, userService_1.createUser)(email, 'Password123!');
            expect(user).toHaveProperty('id');
            expect(user).toHaveProperty('email');
            expect(user).toHaveProperty('createdAt');
            const tok = (0, tokenService_1.generateAccessToken)({ id: user.id, email: user.email });
            expect(tok).toHaveProperty('token');
            expect(typeof tok.expiresIn).toBe('number');
        }
        else {
            // Mock prisma for local runs
            prismaClient_1.default.user = { create: jest.fn(async ({ data }) => ({ id: 'u-contract', email: data.email.toLowerCase(), createdAt: new Date() })) };
            const user = await (0, userService_1.createUser)(email, 'Password123!');
            expect(user).toHaveProperty('id');
            const tok = (0, tokenService_1.generateAccessToken)({ id: user.id, email: user.email });
            expect(tok).toHaveProperty('token');
        }
    });
});
