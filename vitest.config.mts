import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Pas de CSS dans les tests : on ignore la config PostCSS du site
  css: { postcss: { plugins: [] } },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
