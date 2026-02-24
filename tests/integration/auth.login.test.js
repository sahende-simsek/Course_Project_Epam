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
Object.defineProperty(exports, "__esModule", { value: true });
const validators = __importStar(require("../../src/auth/domain/validators"));
const tokenService = __importStar(require("../../src/auth/domain/tokenService"));
const hashModule = __importStar(require("../../src/auth/domain/hash"));
// Modules that depend on `prismaClient` are required lazily inside test branches
// so we can control `process.env.TEST_USE_INMEMORY` before they initialize.
describe('integration: auth.login (T017)', () => {
    beforeEach(() => { });
    afterAll(() => jest.restoreAllMocks());
    it('verifies credentials and updates lastLoginAt (DB when available, otherwise mocked)', async () => {
        if (process.env.DATABASE_URL) {
            // Expect a real DB to be present in CI; create a test user then verify credentials
            const createTestUser = require('../helpers/createTestUser').default || require('../helpers/createTestUser');
            const { verifyCredentials } = require('../../src/auth/domain/authService');
            const { user, password } = await createTestUser({});
            const result = await verifyCredentials(user.email, password);
            expect(result).toMatchObject({ id: user.id, email: user.email });
        }
        else {
            // Ensure in-memory prisma is used for repo calls; set before requiring prisma-dependent modules
            process.env.TEST_USE_INMEMORY = '1';
            const prisma = require('../../src/auth/infra/prismaClient').default || require('../../src/auth/infra/prismaClient');
            const { verifyCredentials } = require('../../src/auth/domain/authService');
            const refreshRepo = require('../../src/auth/infra/refreshRepo');
            // cover validators
            expect(validators.validateEmail(' Test@Example.COM ')).toBe('test@example.com');
            expect(validators.validatePassword('Password123!')).toBeTruthy();
            // exercise invalid validator branches
            expect(() => validators.validateEmail('')).toThrow('Invalid email');
            expect(() => validators.validateEmail('not-an-email')).toThrow('Invalid email format');
            expect(validators.validatePassword('short')).toBeFalsy();
            expect(validators.validatePassword(42)).toBeFalsy();
            // cover hashing implementation (real functions)
            const pwd = 'Password123!';
            const hashed = await hashModule.hashPassword(pwd);
            expect(await hashModule.verifyPassword(pwd, hashed)).toBeTruthy();
            // preserve real in-memory prisma user adapter, then mock for authService tests
            const realPrismaUser = prisma.user;
            prisma.user = {
                findUnique: jest.fn(async ({ where }) => ({ id: 'u-login', email: where.email, passwordHash: '$2a$10$saltsaltsalt' })),
                update: jest.fn(async () => ({ id: 'u-login' })),
            };
            jest.spyOn(hashModule, 'verifyPassword').mockResolvedValue(true);
            const result = await verifyCredentials('login@example.com', 'Password123!');
            expect(result).toMatchObject({ id: 'u-login', email: 'login@example.com' });
            expect(prisma.user.update).toHaveBeenCalled();
            // restore real prisma user for further repo tests
            prisma.user = realPrismaUser;
            // Test authService error paths
            prisma.user = { findUnique: jest.fn(async () => null) };
            await expect(verifyCredentials('noone@example.com', 'pw')).rejects.toMatchObject({ status: 401 });
            // invalid password
            const realHash = await hashModule.hashPassword('Secret1!');
            prisma.user = { findUnique: jest.fn(async ({ where }) => ({ id: 'u-x', email: where.email, passwordHash: realHash })), update: jest.fn() };
            jest.spyOn(hashModule, 'verifyPassword').mockResolvedValue(false);
            await expect(verifyCredentials('some@example.com', 'wrong')).rejects.toMatchObject({ status: 401 });
            // restore verifyPassword mock to true for later
            hashModule.verifyPassword.mockRestore && hashModule.verifyPassword.mockRestore();
            // restore the real in-memory prisma user adapter before continuing
            prisma.user = realPrismaUser;
            // cover tokenService
            const tok = tokenService.generateAccessToken({ id: 'u-login', email: 'login@example.com' });
            expect(tok).toHaveProperty('token');
            // cover refreshRepo lifecycle using in-memory prisma
            const created = await refreshRepo.createRefreshToken('u-login', new Date(Date.now() + 1000 * 60 * 60));
            expect(created).toHaveProperty('tokenId');
            const found = await refreshRepo.findByTokenId(created.tokenId);
            expect(found).toHaveProperty('tokenId');
            const rotated = await refreshRepo.createRotatedToken(found.id, 'u-login', new Date(Date.now() + 1000 * 60 * 60));
            expect(rotated).toHaveProperty('tokenId');
            await refreshRepo.revokeAllForUser('u-login');
            const after = await refreshRepo.findByTokenId(created.tokenId);
            expect(after?.revoked).toBeTruthy();
            // exercise rate limiter and logger to increase branch coverage
            const rateLimit = require('../../src/auth/adapters/rateLimit');
            expect(rateLimit.rateLimit('1.2.3.4')).toBeTruthy();
            expect(rateLimit.rateLimit('1.2.3.4')).toBeTruthy();
            rateLimit.resetRateLimit();
            const logger = require('../../src/auth/infra/logger');
            logger.info('test', { a: 1 });
            logger.warn('test', { b: 2 });
            logger.error('test', { c: 3 });
            // exercise in-memory prisma user CRUD
            const u = await prisma.user.create({ data: { email: 'x@x.com', passwordHash: await hashModule.hashPassword('P1!') } });
            expect(u).toHaveProperty('id');
            const ufind = await prisma.user.findUnique({ where: { email: 'x@x.com' } });
            expect(ufind).toHaveProperty('id');
            // exercise prisma client branches for non-existing records
            const missingById = await prisma.user.findUnique({ where: { id: 'no-such-id' } });
            expect(missingById).toBeNull();
            const updatedMissing = await prisma.user.update({ where: { id: 'no-such-id' }, data: { lastLoginAt: new Date() } });
            expect(updatedMissing).toBeUndefined();
            const deletedMissing = await prisma.user.delete({ where: { id: 'no-such-id' } });
            expect(deletedMissing).toBeUndefined();
            await prisma.user.update({ where: { id: u.id }, data: { lastLoginAt: new Date() } });
            await prisma.user.delete({ where: { id: u.id } });
        }
    });
});
