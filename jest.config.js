const path = require('path');

/** @type {import('jest').Config} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
module.exports = {
  clearMocks: true,
  collectCoverageFrom: ['**/src/**/*.component.tsx', '!**/node_modules/**', '!**/src/declarations.d.ts', '!**/e2e/**'],
  transform: {
    '^.+\\.[jt]sx?$': ['@swc/jest'],
  },
  transformIgnorePatterns: ['/node_modules/(?!@openmrs|.+\\.pnp\\.[^\\/]+$)'],
  moduleNameMapper: {
    '@openmrs/esm-framework': '@openmrs/esm-framework/mock',
    '\\.(s?css)$': 'identity-obj-proxy',
    '^lodash-es/(.*)$': 'lodash/$1',
    '^lodash-es$': 'lodash',
    '^@tools$': path.resolve(__dirname, 'tools'),
    '^@tools/(.*)$': path.resolve(__dirname, 'tools', '$1'),
    '^@mocks$': path.resolve(__dirname, '__mocks__'),
    '^@mocks/(.*)$': path.resolve(__dirname, '__mocks__', '$1'),
    '^dexie$': require.resolve('dexie'),
    '^react-i18next$': path.resolve(__dirname, '__mocks__', 'react-i18next.js'),
  },
  setupFilesAfterEnv: ['<rootDir>/tools/setup-tests.ts'],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/', // Ignore the e2e directory containing Playwright tests
  ],
};
