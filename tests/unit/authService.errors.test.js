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
describe('authService errors', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('throws 401 when user not found', async () => {
        prismaClient_1.default.user = { findUnique: jest.fn(async () => null) };
        await expect((0, authService_1.verifyCredentials)('nope@example.com', 'x')).rejects.toMatchObject({ message: expect.stringContaining('Invalid credentials') });
    });
    it('throws 401 when password mismatch', async () => {
        prismaClient_1.default.user = { findUnique: jest.fn(async () => ({ id: 'u1', email: 'u1@example.com', passwordHash: 'h' })), update: jest.fn() };
        jest.spyOn(hash, 'verifyPassword').mockResolvedValue(false);
        await expect((0, authService_1.verifyCredentials)('u1@example.com', 'bad')).rejects.toMatchObject({ message: expect.stringContaining('Invalid credentials') });
    });
});
