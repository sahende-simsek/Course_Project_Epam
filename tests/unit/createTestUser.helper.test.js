"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('../../src/auth/infra/prismaClient', () => ({
    __esModule: true,
    prisma: {
        user: {
            create: jest.fn().mockResolvedValue({ id: 'u1', email: 'a@b.com' }),
        },
    },
    default: {
        user: {
            create: jest.fn().mockResolvedValue({ id: 'u1', email: 'a@b.com' }),
        },
    },
}));
jest.mock('../../src/auth/domain/hash', () => ({
    hashPassword: jest.fn().mockResolvedValue('hashed'),
}));
const createTestUser_1 = require("../../tests/helpers/createTestUser");
describe('createTestUser helper', () => {
    it('creates a test user via helper', async () => {
        const out = await (0, createTestUser_1.createTestUser)({ email: 'x@y.com', password: 'Password123!' });
        expect(out).toHaveProperty('user');
        expect(out).toHaveProperty('password');
    });
});
