describe('config loader branches', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('returns config when JWT_SECRET missing (branch)', () => {
    delete process.env.JWT_SECRET;
    const cfg = require('../../src/config/index').getConfig();
    expect(cfg).toHaveProperty('JWT_SECRET');
  });

  it('parses PORT env var', () => {
    process.env.PORT = '4000';
    const cfg = require('../../src/config/index').getConfig();
    expect(cfg.PORT).toBe(4000);
  });
});
