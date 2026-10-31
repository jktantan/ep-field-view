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
    sourcemap: true,
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
