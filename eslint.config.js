import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tseslint from 'typescript-eslint'
import prettierConfig from '@vue/eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/assets/lib/**',
      '*.config.js',
      '*.config.ts',
    ],
  },
  ...vue.configs['flat/recommended'],
  ...tseslint.configs.recommended,
  {
    files: ['**/*.vue', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        sourceType: 'module',
        ecmaVersion: 2022,
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-unused-components': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-shadow': 'error',
      'no-shadow': 'off',
      'prettier/prettier': [
        'warn',
        {
          endOfLine: 'auto',
          arrowParens: 'always',
          bracketSpacing: true,
          useTabs: false,
          singleQuote: true,
          singleAttributePerLine: true,
        },
      ],
    },
  },
  prettierConfig,
]
