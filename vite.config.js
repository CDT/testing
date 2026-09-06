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
      },
    },
  },
});
