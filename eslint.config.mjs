import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import next from 'eslint-config-next/core-web-vitals';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'coverage/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...next,
  prettier,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Applications must never reach into the data files directly. Everything
      // goes through lib/content so the V2 database swap stays contained.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/data/*', '**/data/projects/*'],
              message:
                'Import content through @/lib/content instead. Direct data imports break the V2 database swap seam.',
            },
          ],
        },
      ],
    },
  },
  {
    // The content layer is the one place allowed to touch the data files.
    files: ['src/lib/content/**', 'src/data/**', 'tools/**'],
    rules: { 'no-restricted-imports': 'off' },
  },
);
