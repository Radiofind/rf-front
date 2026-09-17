const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettier = require('eslint-config-prettier/flat');

module.exports = tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.angular/**',
      '**/coverage/**',
      '**/out-tsc/**',
    ],
  },

  {
    files: ['**/*.{js,cjs,mjs,ts}'],
    extends: [eslint.configs.recommended],
  },

  {
    files: ['**/*.cjs', 'eslint.config.js', '.prettierrc.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'writable',
        exports: 'writable',
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
  },

  {
    files: ['**/*.ts'],

    extends: [
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      ...angular.configs.tsRecommended,
    ],

    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },

    processor: angular.processInlineTemplates,

    rules: {
      '@typescript-eslint/no-explicit-any': 'error',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],

      '@typescript-eslint/no-inferrable-types': 'off',

      '@typescript-eslint/no-unnecessary-condition': 'warn',

      '@angular-eslint/component-class-suffix': 'error',

      '@angular-eslint/directive-class-suffix': 'error',

      '@angular-eslint/no-empty-lifecycle-method': 'error',

      '@angular-eslint/no-output-native': 'error',

      '@angular-eslint/use-lifecycle-interface': 'error',

      '@angular-eslint/prefer-inject': 'warn',

      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],

      'no-debugger': 'error',

      'no-alert': 'error',

      'prefer-const': 'error',
    },
  },

  {
    files: ['**/*.html'],

    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],

    rules: {
      '@angular-eslint/template/no-negated-async': 'error',

      '@angular-eslint/template/eqeqeq': 'error',

      '@angular-eslint/template/no-any': 'error',

      '@angular-eslint/template/conditional-complexity': [
        'warn',
        {
          maxComplexity: 5,
        },
      ],
    },
  },

  {
    files: ['**/*.spec.ts'],

    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',

      'no-console': 'off',

      '@typescript-eslint/no-unsafe-member-access': 'off',

      '@typescript-eslint/no-unsafe-call': 'off',

      '@typescript-eslint/no-unsafe-assignment': 'off',

      '@typescript-eslint/no-unsafe-argument': 'off',

      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  {
    files: ['e2e/**/*.ts'],

    rules: {
      'no-empty-pattern': 'off',
    },
  },

  prettier,
);
