import openmrs from '@openmrs/eslint-config';

export default [
  { ignores: ['dist/**', 'coverage/**'] },
  ...openmrs,
  {
    rules: {
      // Rules this repo enforces where the shared config turns them off. Its
      // ban-types: off line no longer names a rule that exists on v8, so the
      // three rules it was split into were being enforced.
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',
      '@typescript-eslint/triple-slash-reference': 'error',
      'no-extra-boolean-cast': 'error',
      'no-prototype-builtins': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-useless-escape': 'error',
      'prefer-const': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    // Playwright fixtures take a callback named `use` and call it, which
    // eslint-plugin-react-hooks reads as React's `use` hook.
    files: ['e2e/**'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
];
