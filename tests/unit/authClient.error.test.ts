import AuthClient from '../../src/frontend/lib/authClient';

describe('AuthClient error handling', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  test('login throws when fetch rejects', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network'));
    await expect(AuthClient.login('a@b.com', 'p')).rejects.toThrow(/network/);
  });
});
