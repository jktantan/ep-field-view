/**
 * 中文：Nuxt 模块需要补的 Element Plus 组件样式。
 *
 * 本包在源码里直接 import 了若干 Element Plus 组件（而不是在模板里写
 * `<el-*>`），`@element-plus/nuxt` 的模板扫描只会处理编译后的
 * `resolveComponent()` 调用，因此不会为这些组件注入按需样式。
 * Nuxt 模块在安装时显式补齐，避免宿主只引入 `ep-field-view/style.css`
 * 后出现 `.el-form-item` 等基础样式缺失。
 *
 * English: Element Plus component styles injected by the Nuxt module.
 *
 * This package imports several Element Plus components directly in source
 * (instead of using `<el-*>` tags in a template). `@element-plus/nuxt` only
 * scans compiled `resolveComponent()` calls, so those on-demand styles are
 * never injected. The Nuxt module adds them explicitly at setup time, so
 * loading only `ep-field-view/style.css` cannot leave base styles such as
 * `.el-form-item` missing.
 */

/**
 * 中文：本包源码中直接 import 的 Element Plus 组件（不含仅作类型使用的导入）。
 *
 * English: Element Plus components imported at runtime by this package
 * (type-only imports excluded).
 */
export const ELEMENT_PLUS_STYLE_COMPONENTS = ['ElFormItem', 'ElImage', 'ElRate', 'ElTag'] as const

/**
 * 中文：把 Element Plus 组件名转换成按需样式的入口路径。
 *
 * ```ts
 * getElementPlusStylePath('ElFormItem')
 * // 'element-plus/es/components/form-item/style/css'
 * ```
 *
 * English: Convert an Element Plus component name to its on-demand style entry.
 *
 * ```ts
 * getElementPlusStylePath('ElFormItem')
 * // 'element-plus/es/components/form-item/style/css'
 * ```
 */
export function getElementPlusStylePath(name: string): string {
  const dir = name
    .replace(/^El/, '')
    .replace(/\B([A-Z])/g, '-$1')
    .toLowerCase()

  return `element-plus/es/components/${dir}/style/css`
}

/**
 * 中文：模块默认注入的样式列表，与 `ELEMENT_PLUS_STYLE_COMPONENTS` 保持同步。
 *
 * English: Style entries injected by the module by default; kept in sync with
 * `ELEMENT_PLUS_STYLE_COMPONENTS`.
 */
export const ELEMENT_PLUS_STYLE_PATHS = ELEMENT_PLUS_STYLE_COMPONENTS.map(getElementPlusStylePath)
