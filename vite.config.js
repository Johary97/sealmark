import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@theme': path.resolve(__dirname, 'src/theme'),
      '@themes': path.resolve(__dirname, 'src/themes'),
      '@i18n': path.resolve(__dirname, 'src/i18n')
    }
  },
  optimizeDeps: {
    include: ['pdfjs-dist/build/pdf.mjs']
  }
})
