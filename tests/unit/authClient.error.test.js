"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authClient_1 = __importDefault(require("../../src/frontend/lib/authClient"));
describe('AuthClient error handling', () => {
    const originalFetch = global.fetch;
    afterEach(() => {
        global.fetch = originalFetch;
        jest.resetAllMocks();
    });
    test('login throws when fetch rejects', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('network'));
        await expect(authClient_1.default.login('a@b.com', 'p')).rejects.toThrow(/network/);
    });
});
