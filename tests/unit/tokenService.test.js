"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tokenService_1 = require("../../src/auth/domain/tokenService");
describe('tokenService', () => {
    test('generateAccessToken returns token and expiresIn', () => {
        const user = { id: 'u-1', email: 'a@b.com' };
        const result = (0, tokenService_1.generateAccessToken)(user);
        expect(result).toHaveProperty('token');
        expect(typeof result.expiresIn).toBe('number');
    });
});
