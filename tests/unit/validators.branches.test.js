"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validators_1 = require("../../src/auth/domain/validators");
describe('validators branches', () => {
    it('normalizes and validates a valid email', () => {
        const out = (0, validators_1.validateEmail)('  TeSt@Example.COM ');
        expect(out).toBe('test@example.com');
    });
    it('throws on empty or invalid email', () => {
        expect(() => (0, validators_1.validateEmail)('')).toThrow(/Invalid email/);
        expect(() => (0, validators_1.validateEmail)('not-an-email')).toThrow(/Invalid email format/);
    });
    it('validates password length boundaries', () => {
        expect((0, validators_1.validatePassword)('short')).toBe(false);
        const ok = 'longenoughpassword';
        expect((0, validators_1.validatePassword)(ok)).toBe(true);
        const long = 'x'.repeat(129);
        expect((0, validators_1.validatePassword)(long)).toBe(false);
    });
});
