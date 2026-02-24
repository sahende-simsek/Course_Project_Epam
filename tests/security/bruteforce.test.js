"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rateLimit_1 = require("../../src/auth/adapters/rateLimit");
describe('security: bruteforce (T026)', () => {
    beforeEach(() => (0, rateLimit_1.resetRateLimit)());
    it('allows under-limit attempts and blocks over-limit', () => {
        const ip = '1.2.3.4';
        for (let i = 0; i < 5; i++)
            expect((0, rateLimit_1.rateLimit)(ip)).toBe(true);
        // 6th attempt blocked
        expect((0, rateLimit_1.rateLimit)(ip)).toBe(false);
    });
});
