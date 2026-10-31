import { addPluginTemplate, defineNuxtModule } from '@nuxt/kit'
import type { EpFieldViewOptions } from './types'

/**
 * 中文：Nuxt 模块配置，与 `app.use(EpFieldView, options)` 的选项一致。
 *
 * English: Nuxt module options, identical to `app.use(EpFieldView, options)`.
 */
export type ModuleOptions = EpFieldViewOptions

declare module '@nuxt/schema' {
  interface NuxtConfig {
    /**
     * 中文：`ep-field-view/nuxt` 模块配置。
     *
     * English: Configuration for the `ep-field-view/nuxt` module.
     */
    epFieldView?: ModuleOptions
  }

  interface NuxtOptions {
    epFieldView?: ModuleOptions
  }
}

/**
 * 中文：Nuxt 3 / 4 模块。自动注册组件、引入样式，并把配置传给全局插件。
 *
 * ```ts
 * // nuxt.config.ts
 * export default defineNuxtConfig({
 *   modules: ['ep-field-view/nuxt'],
 *   epFieldView: { emptyText: '-', separator: '、' }
 * })
 * ```
 *
 * English: Nuxt 3 / 4 module. Registers the components, injects the stylesheet
 * and passes the options to the global plugin.
 */
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'ep-field-view',
    configKey: 'epFieldView',
    compatibility: { nuxt: '>=3.0.0' }
  },
  defaults: {},
  setup(options, nuxt) {
    if (!nuxt.options.css.includes('ep-field-view/style.css')) {
      nuxt.options.css.push('ep-field-view/style.css')
    }

    // 中文：让 Nitro 内联本包，避免与 Element Plus 形成重复的注入 key。
    // English: Inline this package in Nitro to avoid a duplicated injection key
    // with Element Plus.
    if (!nuxt.options.build.transpile.includes('ep-field-view')) {
      nuxt.options.build.transpile.push('ep-field-view')
    }

    addPluginTemplate({
      filename: 'ep-field-view.mjs',
      getContents: () => `import { defineNuxtPlugin } from '#app'
import EpFieldView from 'ep-field-view'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(EpFieldView, ${JSON.stringify(options ?? {})})
})
`
    })
  }
})
