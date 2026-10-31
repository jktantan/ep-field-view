import { resolve } from 'node:path'
import { defineConfig } from 'vite'

/**
 * 中文：Nuxt 模块是独立 ESM 入口，运行时由 Nuxt 提供 `@nuxt/kit`。
 * 主构建负责 d.ts，本构建只补充 `dist/nuxt.mjs`。
 *
 * English: The Nuxt module is a separate ESM entry and relies on Nuxt's
 * `@nuxt/kit` at runtime. The main build emits d.ts; this build only adds
 * `dist/nuxt.mjs`.
 */
export default defineConfig({
  build: {
    target: 'es2022',
    emptyOutDir: false,
    minify: false,
    lib: {
      entry: resolve(import.meta.dirname, 'src/nuxt.ts'),
      formats: ['es'],
      fileName: () => 'nuxt.mjs'
    },
    rollupOptions: {
      external: ['@nuxt/kit', 'vue', 'element-plus', 'dayjs'],
      output: { exports: 'named' }
    }
  }
})
