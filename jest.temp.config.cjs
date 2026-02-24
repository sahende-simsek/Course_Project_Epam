module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: false,
  coverageThreshold: {
    global: {
      branches: 0,
    },
  },
  verbose: true,
};