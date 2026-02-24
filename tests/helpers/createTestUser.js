"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestUser = void 0;
const prismaClient_1 = require("../../src/auth/infra/prismaClient");
const hash_1 = require("../../src/auth/domain/hash");
async function createTestUser(attrs) {
    const email = attrs?.email ?? `test+${Date.now()}@example.com`;
    const password = attrs?.password ?? 'Password123!';
    const hashed = await (0, hash_1.hashPassword)(password);
    const user = await prismaClient_1.prisma.user.create({
        data: {
            email,
            passwordHash: hashed,
        },
    });
    return { user, password };
}
exports.createTestUser = createTestUser;
exports.default = createTestUser;
