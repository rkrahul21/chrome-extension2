import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

import tailwindcss from '@tailwindcss/vite'



const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    {
      name: 'copy-manifest',
      writeBundle() {
        // Copy manifest.json from root to dist folder
        copyFileSync(
          resolve(__dirname, '../manifest.json'),
          resolve(__dirname, 'dist/manifest.json')
        )
      }
    }
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  }
})