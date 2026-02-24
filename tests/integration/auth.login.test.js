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
const authService_1 = require("../../src/auth/domain/authService");
const prismaClient_1 = __importDefault(require("../../src/auth/infra/prismaClient"));
const hash = __importStar(require("../../src/auth/domain/hash"));
const createTestUser_1 = __importDefault(require("../helpers/createTestUser"));
describe('integration: auth.login (T017)', () => {
    beforeEach(() => { });
    afterAll(() => jest.restoreAllMocks());
    it('verifies credentials and updates lastLoginAt (DB when available, otherwise mocked)', async () => {
        if (process.env.DATABASE_URL) {
            // Expect a real DB to be present in CI; create a test user then verify credentials
            const { user, password } = await (0, createTestUser_1.default)({});
            const result = await (0, authService_1.verifyCredentials)(user.email, password);
            expect(result).toMatchObject({ id: user.id, email: user.email });
        }
        else {
            prismaClient_1.default.user = {
                findUnique: jest.fn(async ({ where }) => ({ id: 'u-login', email: where.email, passwordHash: '$2a$10$saltsaltsalt' })),
                update: jest.fn(async () => ({ id: 'u-login' })),
            };
            jest.spyOn(hash, 'verifyPassword').mockResolvedValue(true);
            const result = await (0, authService_1.verifyCredentials)('login@example.com', 'Password123!');
            expect(result).toMatchObject({ id: 'u-login', email: 'login@example.com' });
            expect(prismaClient_1.default.user.update).toHaveBeenCalled();
        }
    });
});
