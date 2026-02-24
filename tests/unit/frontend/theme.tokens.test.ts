import tokens from '../../../src/frontend/theme/tokens';

describe('theme tokens', () => {
  test('exports expected keys', () => {
    expect(tokens).toHaveProperty('colors');
    expect(tokens).toHaveProperty('spacing');
    expect(tokens).toHaveProperty('typography');
  });

  test('colors contain primary and text', () => {
    expect(tokens.colors).toHaveProperty('primary');
    expect(tokens.colors).toHaveProperty('text');
  });
});
