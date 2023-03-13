module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['@vue/typescript/recommended'],
  plugins: ['eslint-plugin-prettier', 'eslint-plugin-vue'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  ignorePatterns: ['src/assets/lib'],
  rules: {
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-cycle': 'off',
    'vue/script-setup-uses-vars': 'error',
    '@typescript-eslint/no-unused-vars': 'warn',
    'vue/no-unused-components': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    '@typescript-eslint/no-explicit-any': ['off'],
    'prettier/prettier': [
      'warn',
      {
        endOfLine: 'auto',
        arrowParens: 'always',
        bracketSpacing: true,
        bracketLine: false,
        useTabs: false,
        singleQuote: true,
        singleAttributePerLine: true,
      },
    ],
    'vue/multi-word-component-names': 'off',
  },
};
