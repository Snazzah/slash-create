module.exports = {
  env: {
    commonjs: true,
    es6: true,
    es2020: true,
    node: true,
    browser: true
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  globals: {},
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'prettier/prettier': [
      'warn',
      {
        arrowParens: 'always',
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        useTabs: false,
        trailingComma: 'none',
        printWidth: 120
      }
    ],
    'no-cond-assign': [2, 'except-parens'],
    'no-unused-vars': 0,
    '@typescript-eslint/no-unused-vars': 1,
    'no-empty': [
      'error',
      {
        allowEmptyCatch: true
      }
    ],
    'prefer-const': [
      'warn',
      {
        destructuring: 'all'
      }
    ],
    'spaced-comment': 'warn'
  },
  overrides: [
    {
      files: ['test/**/*.ts'],
      globals: {
        describe: true,
        it: true,
        beforeEach: true
      }
    }
  ]
};
