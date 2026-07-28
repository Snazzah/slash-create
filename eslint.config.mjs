import eslint from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
  {
    ignores: ['docs/**', 'lib/**']
  },
  eslint.configs.recommended,
  prettierRecommended,
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.es2020,
        ...globals.node
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: false
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
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
      'no-dupe-class-members': 0,
      '@typescript-eslint/no-unused-vars': [
        1,
        {
          caughtErrors: 'none'
        }
      ],
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
      'spaced-comment': 'warn',
      'no-unassigned-vars': 0,
      'no-useless-assignment': 0,
      'preserve-caught-error': 0
    }
  },
  {
    files: ['test/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.mocha
      }
    }
  }
];
