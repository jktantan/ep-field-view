import type { App } from 'vue'
import JsonPreview from './components/JsonPreview.vue'
import TextFormItem from './components/TextFormItem.vue'
import { installConfig } from './config'
import type { EpFieldViewOptions } from './types'
import './styles/index.css'

export { JsonPreview, TextFormItem }
export {
  EP_FIELD_VIEW_CONFIG_KEY,
  createConfig,
  provideEpFieldViewConfig,
  resolveConfig,
  useEpFieldViewConfig
} from './config'
export { DEFAULT_CONFIG, DEFAULT_OPTION_PROPS } from './constants'
export { formatFieldValue, extractOptions } from './formatters'
export { dateFormatter, dictFormatter, moneyFormatter, percentFormatter } from './presets'
export type {
  DateFormatterOptions,
  DictFallback,
  DictFormatterOptions,
  DictSource,
  MoneyFormatterOptions,
  PercentFormatterOptions
} from './presets'
export { getByPath, isEmptyValue, isSameValue } from './utils/value'
export type {
  EpFieldViewConfig,
  EpFieldViewOptions,
  FieldViewFormatter,
  FieldViewFormatterContext,
  FieldViewOption,
  FieldViewOptionProps,
  ImageMode,
  InputTagMode,
  RateMode,
  TextFormItemProps
} from './types'

export interface EpFieldViewPlugin {
  install: (app: App, options?: EpFieldViewOptions) => void
  TextFormItem: typeof TextFormItem
  JsonPreview: typeof JsonPreview
}

const install = (app: App, options: EpFieldViewOptions = {}): void => {
  installConfig(app, options)
  app.component(TextFormItem.name ?? 'TextFormItem', TextFormItem)
  app.component(JsonPreview.name ?? 'JsonPreview', JsonPreview)
}

const EpFieldView: EpFieldViewPlugin = {
  install,
  TextFormItem,
  JsonPreview
}

// 中文：`app.use(EpFieldView)` 会全局注册组件；这里补充模板类型声明，
// 否则 Volar / vue-tsc 会把 `<TextFormItem>` 当成未知标签。
// English: `app.use(EpFieldView)` registers the components globally. Declare
// them for template type checking; otherwise Volar / vue-tsc reports
// `<TextFormItem>` as an unknown tag.
declare module 'vue' {
  interface GlobalComponents {
    TextFormItem: typeof TextFormItem
    JsonPreview: typeof JsonPreview
  }

  /**
   * 中文：`el-form` 的 `text` 是本项目的扩展属性，Element Plus 并未声明它。
   * 运行时它以 fallthrough attribute 落在 `<form>` 上，由 `TextFormItem`
   * 观察后切换文本模式；这里补充类型声明，让 `<el-form :text>` 在模板中
   * 获得提示与检查。
   *
   * 不增强 `element-plus` 的 `FormProps`：它在 Element Plus 2.6–2.13 中是
   * `ExtractPropTypes` 类型别名，接口合并会冲突或静默失效。
   *
   * English: `text` on `el-form` is this package's extension attribute;
   * Element Plus does not declare it. At runtime it falls through to the
   * `<form>` element and `TextFormItem` observes it to toggle text mode.
   * Declare it here so `<el-form :text>` gets completion and type checking in
   * templates.
   *
   * We do not augment Element Plus' `FormProps`: in Element Plus 2.6–2.13 it is
   * an `ExtractPropTypes` type alias, so interface merging would conflict or be
   * silently ignored.
   */
  interface ComponentCustomProps {
    /**
     * 中文：文本模式开关，作用于 `el-form`。支持布尔值和静态属性写法。
     *
     * English: Text-mode switch for `el-form`. Accepts booleans and static
     * attribute values.
     */
    text?: boolean | 'true' | 'false'
  }
}

export default EpFieldView
