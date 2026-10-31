import { addPluginTemplate, defineNuxtModule } from '@nuxt/kit'
import { ELEMENT_PLUS_STYLE_PATHS } from './nuxt-styles'
import type { EpFieldViewOptions } from './types'

/**
 * 中文：Nuxt 模块配置，在 `app.use(EpFieldView, options)` 的选项之外增加模块级开关。
 *
 * English: Nuxt module options: the `app.use(EpFieldView, options)` options plus
 * module-level switches.
 */
export interface ModuleOptions extends EpFieldViewOptions {
  /**
   * 中文：是否自动引入本包内部直接使用的 Element Plus 组件样式，默认 `true`。
   *
   * 这些组件（`ElFormItem` / `ElImage` / `ElRate` / `ElTag`）由包内源码直接
   * import，`@element-plus/nuxt` 的模板扫描看不到它们；关闭后需要宿主自行引入
   * `element-plus/es/components/{form-item,image,rate,tag}/style/css`。
   *
   * English: Whether to inject the Element Plus styles for components imported
   * directly by this package. Defaults to `true`.
   *
   * `ElFormItem` / `ElImage` / `ElRate` / `ElTag` are imported by the package
   * source, so `@element-plus/nuxt`'s template scanner cannot see them. When
   * disabled, the host must import
   * `element-plus/es/components/{form-item,image,rate,tag}/style/css` itself.
   */
  elementPlusStyles?: boolean
}

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

export { ELEMENT_PLUS_STYLE_COMPONENTS, ELEMENT_PLUS_STYLE_PATHS, getElementPlusStylePath } from './nuxt-styles'

/**
 * 中文：Nuxt 3 / 4 模块。自动注册组件、引入 Element Plus 依赖样式与自身的
 * 样式，并把配置传给全局插件。
 *
 * ```ts
 * // nuxt.config.ts
 * export default defineNuxtConfig({
 *   modules: ['ep-field-view/nuxt'],
 *   epFieldView: { emptyText: '-', separator: '、' }
 * })
 * ```
 *
 * English: Nuxt 3 / 4 module. Registers the components, injects the Element
 * Plus dependency styles and its own stylesheet, and passes the options to the
 * global plugin.
 */
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'ep-field-view',
    configKey: 'epFieldView',
    compatibility: { nuxt: '>=3.0.0' }
  },
  defaults: {
    elementPlusStyles: true
  },
  setup(options, nuxt) {
    // 中文：elementPlusStyles 是模块级开关，不能传给 app.use。
    // English: elementPlusStyles is a module-level switch; do not pass it to app.use.
    const { elementPlusStyles = true, ...pluginOptions } = options

    // 中文：先补包内直接 import 的 Element Plus 样式，再加载本包样式。
    // 顺序与组件库的常规做法一致：依赖在前，覆盖在后。
    // English: Inject the Element Plus styles used directly by this package
    // before this package's own stylesheet: dependencies first, overrides last.
    if (elementPlusStyles) {
      for (const style of ELEMENT_PLUS_STYLE_PATHS) {
        if (!nuxt.options.css.includes(style)) {
          nuxt.options.css.push(style)
        }
      }
    }

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
  nuxtApp.vueApp.use(EpFieldView, ${JSON.stringify(pluginOptions ?? {})})
})
`
    })
  }
})
