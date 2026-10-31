import type { App } from 'vue'
import TextFormItem from './components/TextFormItem.vue'
import { installConfig } from './config'
import type { EpFieldViewOptions } from './types'
import './styles/index.css'

export { TextFormItem }
export {
  EP_FIELD_VIEW_CONFIG_KEY,
  createConfig,
  provideEpFieldViewConfig,
  resolveConfig,
  useEpFieldViewConfig
} from './config'
export { DEFAULT_CONFIG, DEFAULT_OPTION_PROPS } from './constants'
export { formatFieldValue, extractOptions } from './formatters'
export { getByPath, isEmptyValue, isSameValue } from './utils/value'
export type {
  EpFieldViewConfig,
  EpFieldViewOptions,
  FieldViewFormatter,
  FieldViewFormatterContext,
  FieldViewOption,
  FieldViewOptionProps,
  RateMode,
  TextFormItemProps
} from './types'

export interface EpFieldViewPlugin {
  install: (app: App, options?: EpFieldViewOptions) => void
  TextFormItem: typeof TextFormItem
}

const install = (app: App, options: EpFieldViewOptions = {}): void => {
  installConfig(app, options)
  app.component(TextFormItem.name ?? 'TextFormItem', TextFormItem)
}

const EpFieldView: EpFieldViewPlugin = {
  install,
  TextFormItem
}

export default EpFieldView
