/** @type {import("eslint").Linter.Config} */
const config = {
  extends: [
    'turbo',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'prettier',
  ],
  env: {
    es2022: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
  },
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    'turbo/no-undeclared-env-vars': 'off',
    '@typescript-eslint/array-type': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-misused-promises': [
      2,
      { checksVoidReturn: { attributes: false } },
    ],
  },
  ignorePatterns: [
    '**/.eslintrc.cjs',
    '**/*.config.js',
    '**/*.config.cjs',
    '.next',
    'dist',
    'pnpm-lock.yaml',
  ],
  reportUnusedDisableDirectives: true,
};

module.exports = config;