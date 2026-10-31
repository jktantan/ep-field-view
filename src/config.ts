import { inject, provide, reactive } from 'vue'
import type { App, InjectionKey } from 'vue'
import { DEFAULT_CONFIG, DEFAULT_OPTION_PROPS } from './constants'
import type { EpFieldViewConfig, EpFieldViewOptions } from './types'

/**
 * Injection key for the global configuration. Exported so advanced users can
 * provide a scoped configuration below a subtree.
 */
export const EP_FIELD_VIEW_CONFIG_KEY: InjectionKey<EpFieldViewConfig> = Symbol('ep-field-view-config')

/**
 * Merge user options with the defaults.
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
 * Create the reactive configuration object registered on the app.
 */
export function createConfig(options: EpFieldViewOptions = {}): EpFieldViewConfig {
  return reactive(resolveConfig(options))
}

/**
 * Read the global configuration. Safe to call outside of an app (returns the
 * defaults in that case).
 */
export function useEpFieldViewConfig(): EpFieldViewConfig {
  return inject(EP_FIELD_VIEW_CONFIG_KEY, DEFAULT_CONFIG)
}

/**
 * Provide the configuration below the current component subtree. Must be called
 * from a component `setup`. Useful for tests or for a section of the page that
 * uses a different theme.
 */
export function provideEpFieldViewConfig(options: EpFieldViewOptions = {}): EpFieldViewConfig {
  const config = createConfig(options)
  provide(EP_FIELD_VIEW_CONFIG_KEY, config)
  return config
}

/**
 * Install the configuration and register global properties. Called by the
 * plugin installer.
 */
export function installConfig(app: App, options: EpFieldViewOptions = {}): EpFieldViewConfig {
  const config = createConfig(options)
  app.provide(EP_FIELD_VIEW_CONFIG_KEY, config)
  app.config.globalProperties.$EpFieldView = config
  // Compatibility with element-plus-readonly-form-item.
  app.config.globalProperties.$ReadonlyFormItem = config
  return config
}
