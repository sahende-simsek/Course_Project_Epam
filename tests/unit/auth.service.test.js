"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tokenService_1 = require("../../src/auth/domain/tokenService");
describe('auth service (T013)', () => {
    it('generates access token payload', () => {
        const res = (0, tokenService_1.generateAccessToken)({ id: 'user-id-1', email: 'a@b.com' });
        expect(res).toHaveProperty('token');
        expect(res).toHaveProperty('expiresIn');
    });
});
