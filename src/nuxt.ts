import { addComponent, addPluginTemplate, addTypeTemplate, defineNuxtModule } from '@nuxt/kit'
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
 * 中文：Nuxt 3 / 4 模块。把组件注册到 Nuxt 的组件系统（自动导入并生成
 * `components.d.ts`），引入 Element Plus 依赖样式与自身的样式，并把配置
 * 传给全局插件。
 *
 * ```ts
 * // nuxt.config.ts
 * export default defineNuxtConfig({
 *   modules: ['ep-field-view/nuxt'],
 *   epFieldView: { emptyText: '-', separator: '、' }
 * })
 * ```
 *
 * English: Nuxt 3 / 4 module. Registers the components with Nuxt's component
 * system (auto-import plus generated `components.d.ts`), injects the Element
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

    // 中文：注册到 Nuxt 的组件系统后，Nuxt 会生成 `components.d.ts` 并把
    // 组件写入 `GlobalComponents`；仅靠 `app.use` 全局注册时模板类型检查
    // （Volar / vue-tsc）看不到它们，会报“未知标签”。
    // English: Registering through Nuxt's component system makes Nuxt generate
    // `components.d.ts` and `GlobalComponents` entries. A plugin-only
    // `app.use` registration stays invisible to template type checking
    // (Volar / vue-tsc) and is reported as an unknown tag.
    addComponent({ name: 'TextFormItem', export: 'TextFormItem', filePath: 'ep-field-view' })
    addComponent({ name: 'JsonPreview', export: 'JsonPreview', filePath: 'ep-field-view' })

    // 中文：模块入口的 d.ts 不会因为 `modules` 里的字符串自动加载，这里把
    // 配置类型注入 `.nuxt`，让 nuxt.config.ts 的 `epFieldView` 有类型提示。
    // English: A string entry in `modules` does not load the module's d.ts, so
    // inject the config types into `.nuxt` to type `epFieldView` in
    // nuxt.config.ts.
    addTypeTemplate({
      filename: 'types/ep-field-view.d.ts',
      getContents: () => `import type { ModuleOptions } from 'ep-field-view/nuxt'

declare module '@nuxt/schema' {
  interface NuxtConfig {
    epFieldView?: ModuleOptions
  }

  interface NuxtOptions {
    epFieldView?: ModuleOptions
  }
}
`
    })

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
