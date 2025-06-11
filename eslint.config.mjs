import globals from 'globals'
import pluginJs from '@eslint/js'
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended'
import babelParser from '@babel/eslint-parser'

/** @type {import('eslint').Linter.Config[]} */
export default [
  pluginJs.configs.recommended,
  eslintPluginPrettier,
  {
    rules: {
      'prettier/prettier': [
        'error',
        {
          trailingComma: 'es5',
          singleQuote: true,
          tabWidth: 2,
          semi: false,
          printWidth: 100,
          endOfLine: 'auto',
        },
      ],
      'no-unused-vars': [
        'error',
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: 'res|next|^err|^_',
        },
      ],
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'no-console': 'warn',
      'no-var': 'error',
      'lines-between-class-members': ['error', 'always'],
    },
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
      },
      globals: { ...globals.browser, ...globals.jest, ...globals.node, ...globals.amd },
    },
  },
]
