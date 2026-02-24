module.exports = {
  mutator: 'javascript',
  packageManager: 'npm',
  reporters: ['clear-text', 'progress', 'html'],
  testRunner: 'jest',
  jest: {
    projectType: 'custom',
  },
  mutate: ['src/**/*.ts', '!src/**/index.ts'],
  thresholds: { high: 80, low: 60, break: 75 },
};
/** Minimal Stryker configuration for TypeScript + Jest */
module.exports = function(config) {
  config.set({
    mutate: ['src/**/*.ts', '!src/**/*.d.ts'],
    mutator: 'typescript',
    packageManager: 'npm',
    testRunner: 'jest',
    jest: {
      projectType: 'custom',
      config: require('./jest.config.js')
    },
    reporters: ['clear-text', 'progress', 'html'],
    coverageAnalysis: 'perTest',
    thresholds: { high: 80, low: 60, break: 75 }
  });
};
