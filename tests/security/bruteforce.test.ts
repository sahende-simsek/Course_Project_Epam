import { rateLimit, resetRateLimit } from '../../src/auth/adapters/rateLimit';

describe('security: bruteforce (T026)', () => {
  beforeEach(() => resetRateLimit());

  it('allows under-limit attempts and blocks over-limit', () => {
    const ip = '1.2.3.4';
    for (let i = 0; i < 5; i++) expect(rateLimit(ip)).toBe(true);
    // 6th attempt blocked
    expect(rateLimit(ip)).toBe(false);
  });
});
