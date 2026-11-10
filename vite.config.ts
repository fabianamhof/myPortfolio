import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        tools: fileURLToPath(new URL('./tools.html', import.meta.url)),
        qr: fileURLToPath(new URL('./qr-code-generator.html', import.meta.url)),
        compressor: fileURLToPath(new URL('./image-compressor.html', import.meta.url))
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
