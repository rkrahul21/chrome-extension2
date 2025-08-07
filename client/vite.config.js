import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'copy-manifest',
      writeBundle() {
        copyFileSync(
          resolve(__dirname, 'manifest.json'),
          resolve(__dirname, 'dist/manifest.json')
        );
        copyFileSync(
          resolve(__dirname, 'background.js'),
          resolve(__dirname, 'dist/background.js')
        );
        copyFileSync(
          resolve(__dirname, 'src/content.js'),
          resolve(__dirname, 'dist/content.js')
        );
      }
    }
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: resolve(__dirname, 'index.html')
    }
  }
});