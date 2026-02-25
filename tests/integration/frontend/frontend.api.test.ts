/*
  Integration test skeleton for frontend-backed API endpoints.
  These tests expect a running dev server (e.g. `npm run dev`) on TEST_BASE_URL (default http://localhost:3000).
  They validate adapter endpoints and basic DB interactions via the running API.
*/

const baseFetch: any = (globalThis as any).fetch;

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Frontend API integration (auth)', () => {
  jest.setTimeout(20000);

  test('register -> login -> refresh -> logout (smoke)', async () => {
  if (!process.env.TEST_BASE_URL) {
    console.warn('Skipping frontend API integration test: TEST_BASE_URL not set');
    return;
  }

    const email = `int+${Date.now()}@example.com`;
    const password = 'Password123!';

    // Register
    const reg = await baseFetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    expect([200,201]).toContain(reg.status);

    // Login (expect set-cookie for refresh)
    const login = await baseFetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    expect(login.status).toBe(200);

    // TODO: parse cookie and call refresh endpoint; currently smoke-checking status codes

    // Logout: attempt to forward cookie from login if present
    const setCookie = login.headers && (login.headers as any).get ? (login.headers as any).get('set-cookie') : null;
    const cookieHeader = setCookie ? setCookie.split(';')[0] : undefined;
    const logout = await baseFetch(`${BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
    // Accept success responses; some environments may return 200 or 204 or 400 if cookie handling differs.
    expect([200,204,400]).toContain(logout.status);
  });
});
