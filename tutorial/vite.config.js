import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    port: 1234,
  },
  build: {
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL('./index.html', import.meta.url)),
        softwareTesting: fileURLToPath(new URL('./chapters/software-testing/index.html', import.meta.url)),
        unitTesting: fileURLToPath(new URL('./chapters/unit-testing/index.html', import.meta.url)),
        integrationTesting: fileURLToPath(new URL('./chapters/integration-testing/index.html', import.meta.url)),
        endToEndTesting: fileURLToPath(new URL('./chapters/end-to-end-testing/index.html', import.meta.url)),
        securityTesting: fileURLToPath(new URL('./chapters/security-testing/index.html', import.meta.url)),
        performanceTesting: fileURLToPath(new URL('./chapters/performance-testing/index.html', import.meta.url)),
        regressionTesting: fileURLToPath(new URL('./chapters/regression-testing/index.html', import.meta.url)),
      },
    },
  },
});
