import { hashPassword, verifyPassword } from './hash';

describe('hash (T009)', () => {
  it('hashes and verifies password (should fail until implemented)', async () => {
    const pwd = 'CorrectHorseBatteryStaple';
    const h = await hashPassword(pwd);
    expect(typeof h).toBe('string');
    expect(await verifyPassword(pwd, h)).toBe(true);
  });
});
