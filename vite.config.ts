import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: resolve(import.meta.dirname, 'tsconfig.json'),
      include: ['src'],
      insertTypesEntry: true,
      copyDtsFiles: true
    })
  ],
  build: {
    target: 'es2018',
    minify: 'terser',
    terserOptions: {
      // 中文：多轮压缩可进一步减小体积；注释会全部移除。
      // English: Extra passes shrink the bundle further; all comments are
      // removed.
      compress: { passes: 3 },
      format: { comments: false }
    },
    // 中文：发布包不生成 sourcemap，避免源码随 sourcesContent 泄漏并减小体积。
    // English: Never emit sourcemaps in the published package, so source code
    // is not exposed through `sourcesContent` and the tarball stays small.
    sourcemap: false,
    emptyOutDir: true,
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'EpFieldView',
      formats: ['es', 'umd'],
      fileName: (format) => (format === 'es' ? 'index.mjs' : 'index.umd.cjs'),
      cssFileName: 'style'
    },
    rollupOptions: {
      external: ['vue', 'element-plus', 'dayjs'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus',
          dayjs: 'dayjs'
        }
      }
    }
  }
})
