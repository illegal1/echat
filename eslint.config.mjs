import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import pluginN from 'eslint-plugin-n';
import pluginPromise from 'eslint-plugin-promise';
import importPlugin from 'eslint-plugin-import';
import prettierConfig from './.prettierrc.js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.js'],
    plugins: {
      n: pluginN,
      prettier: eslintPluginPrettierRecommended.plugins.prettier,
    },
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
    },
    rules: {
      'no-console': 'warn',
      'n/no-unsupported-features/es-syntax': ['error', { version: '>=18.0.0' }],
      'n/no-missing-require': 'error',
      'n/no-unpublished-require': 'error',
      'n/no-extraneous-require': 'error',
      'prettier/prettier': [
        'error',
        {
          ...prettierConfig,
        },
      ],
    },
  },
  pluginPromise.configs['flat/recommended'],
  importPlugin.flatConfigs.recommended,
  pluginJs.configs.recommended,
  eslintPluginPrettierRecommended,
  eslintConfigPrettier,
];
