import AuthClient from '../../../src/frontend/lib/authClient';

describe('AuthClient', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  test('login calls /api/auth/login and returns json on success', async () => {
    const mockRes = { ok: true, json: async () => ({ access: 'token' }), status: 200 } as any;
    global.fetch = jest.fn().mockResolvedValue(mockRes);

    const res = await AuthClient.login('a@b.com', 'pass');
    expect(global.fetch).toHaveBeenCalled();
    expect(res).toHaveProperty('access');
  });

  test('register throws on non-ok response', async () => {
    const mockRes = { ok: false, status: 400 } as any;
    global.fetch = jest.fn().mockResolvedValue(mockRes);

    await expect(AuthClient.register('a@b.com', 'pass')).rejects.toThrow(/Register failed/);
  });
});
