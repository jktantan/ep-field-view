import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// 中文：Playground / 开发演示服务器。
// English: Playground / development demo server.
export default defineConfig(({ command }) => ({
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
  css: {
    // 中文：开发服务器（`pnpm dev`）为 CSS 生成 sourcemap，方便在浏览器中
    // 定位样式来源；脚本的 sourcemap 由 Vite 开发服务器默认提供。
    // English: The dev server (`pnpm dev`) emits CSS sourcemaps so styles can
    // be traced in the browser; script sourcemaps are provided by Vite's dev
    // server by default.
    devSourcemap: command === 'serve'
  },
  build: {
    outDir: resolve(import.meta.dirname, '../dist-playground'),
    emptyOutDir: true,
    // 中文：构建产物（含发布包）不带 sourcemap。
    // English: Build output, including the published package, ships without
    // sourcemaps.
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        stress: resolve(import.meta.dirname, 'stress.html')
      }
    }
  }
}))
