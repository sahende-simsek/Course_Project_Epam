"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authClient_1 = __importDefault(require("../../../src/frontend/lib/authClient"));
describe('AuthClient', () => {
    const originalFetch = global.fetch;
    afterEach(() => {
        global.fetch = originalFetch;
        jest.resetAllMocks();
    });
    test('login calls /api/auth/login and returns json on success', async () => {
        const mockRes = { ok: true, json: async () => ({ access: 'token' }), status: 200 };
        global.fetch = jest.fn().mockResolvedValue(mockRes);
        const res = await authClient_1.default.login('a@b.com', 'pass');
        expect(global.fetch).toHaveBeenCalled();
        expect(res).toHaveProperty('access');
    });
    test('register throws on non-ok response', async () => {
        const mockRes = { ok: false, status: 400 };
        global.fetch = jest.fn().mockResolvedValue(mockRes);
        await expect(authClient_1.default.register('a@b.com', 'pass')).rejects.toThrow(/Register failed/);
    });
});
