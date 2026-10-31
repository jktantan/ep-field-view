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

export default EpFieldView
