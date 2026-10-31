import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// 中文：Playground / 开发演示服务器。
// English: Playground / development demo server.
export default defineConfig({
  root: resolve(import.meta.dirname),
  plugins: [vue()],
  resolve: {
    alias: {
      'ep-field-view': resolve(import.meta.dirname, '../src/index.ts')
    }
  },
  server: {
    port: 5173,
    open: false
  },
  build: {
    outDir: resolve(import.meta.dirname, '../dist-playground'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        stress: resolve(import.meta.dirname, 'stress.html')
      }
    }
  }
})
