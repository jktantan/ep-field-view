import { inject, provide, reactive } from 'vue'
import type { App, InjectionKey } from 'vue'
import { DEFAULT_CONFIG, DEFAULT_OPTION_PROPS } from './constants'
import type { EpFieldViewConfig, EpFieldViewOptions } from './types'

/**
 * 中文：全局配置的注入 key。高级用法可在子树中提供作用域配置。
 *
 * English: Injection key for the global configuration. Advanced users can
 * provide a scoped configuration below a subtree.
 */
export const EP_FIELD_VIEW_CONFIG_KEY: InjectionKey<EpFieldViewConfig> = Symbol('ep-field-view-config')

/**
 * 中文：将用户配置与默认配置合并。
 *
 * English: Merge user options with the defaults.
 */
export function resolveConfig(options: EpFieldViewOptions = {}): EpFieldViewConfig {
  return {
    ...DEFAULT_CONFIG,
    ...options,
    optionProps: {
      ...DEFAULT_OPTION_PROPS,
      ...options.optionProps
    }
  }
}

/**
 * 中文：创建注册到应用上的响应式配置对象。
 *
 * English: Create the reactive configuration object registered on the app.
 */
export function createConfig(options: EpFieldViewOptions = {}): EpFieldViewConfig {
  return reactive(resolveConfig(options))
}

/**
 * 中文：读取全局配置；在应用外调用时返回默认配置。
 *
 * English: Read the global configuration. Safe to call outside of an app
 * (returns the defaults in that case).
 */
export function useEpFieldViewConfig(): EpFieldViewConfig {
  return inject(EP_FIELD_VIEW_CONFIG_KEY, DEFAULT_CONFIG)
}

/**
 * 中文：在当前组件子树下提供配置。必须在 `setup` 中调用。
 *
 * English: Provide the configuration below the current component subtree. Must
 * be called from a component `setup`.
 */
export function provideEpFieldViewConfig(options: EpFieldViewOptions = {}): EpFieldViewConfig {
  const config = createConfig(options)
  provide(EP_FIELD_VIEW_CONFIG_KEY, config)
  return config
}

/**
 * 中文：安装配置并注册全局属性，由插件安装器调用。
 *
 * English: Install the configuration and register global properties. Called by
 * the plugin installer.
 */
export function installConfig(app: App, options: EpFieldViewOptions = {}): EpFieldViewConfig {
  const config = createConfig(options)
  app.provide(EP_FIELD_VIEW_CONFIG_KEY, config)
  app.config.globalProperties.$EpFieldView = config
  return config
}
