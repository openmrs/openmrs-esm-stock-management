/** @type {import('jest').Config} */
import path from 'path';

module.exports = {
  clearMocks: true,
  collectCoverageFrom: ['**/src/**/*.component.tsx', '!**/node_modules/**', '!**/src/declarations.d.ts'],
  transform: {
    '^.+\\.tsx?$': ['@swc/jest'],
  },
  transformIgnorePatterns: ['/node_modules/(?!@openmrs)'],
  moduleNameMapper: {
    '@openmrs/esm-framework': '@openmrs/esm-framework/mock',
    '\\.(s?css)$': 'identity-obj-proxy',
    '^lodash-es/(.*)$': 'lodash/$1',
    '^lodash-es$': 'lodash',
    '^dexie$': require.resolve('dexie'),
    '^react-i18next$': path.resolve(__dirname, '__mocks__', 'react-i18next.js'),
  },
  setupFilesAfterEnv: ['<rootDir>/src/setup-tests.ts'],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
};
