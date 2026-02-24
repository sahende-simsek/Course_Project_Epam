"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaClient_1 = __importDefault(require("../../src/auth/infra/prismaClient"));
const userService_1 = require("../../src/auth/domain/userService");
describe('integration: auth.register (T012)', () => {
    beforeEach(() => { });
    it('registers a new user and prevents duplicates (DB when available, otherwise mocked)', async () => {
        const email = `regtest+${Date.now()}@example.com`;
        if (process.env.DATABASE_URL) {
            const created = await (0, userService_1.createUser)(email, 'Password123!');
            expect(created).toHaveProperty('id');
            expect(created.email).toBe(email.toLowerCase());
            await expect((0, userService_1.createUser)(email, 'Password123!')).rejects.toMatchObject({ message: expect.stringContaining('Conflict') });
        }
        else {
            // mocked behavior for local dev without DB
            let called = 0;
            prismaClient_1.default.user = {
                create: jest.fn(async ({ data }) => {
                    called += 1;
                    if (called > 1) {
                        const e = new Error('Unique constraint');
                        e.code = 'P2002';
                        throw e;
                    }
                    return { id: 'u1', email: data.email.toLowerCase(), createdAt: new Date() };
                }),
            };
            const created = await (0, userService_1.createUser)(email, 'Password123!');
            expect(created).toHaveProperty('id');
            await expect((0, userService_1.createUser)(email, 'Password123!')).rejects.toMatchObject({ message: expect.stringContaining('Conflict') });
        }
    });
});
