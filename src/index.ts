import type { App } from 'vue'
import ReadonlyFormItem from './components/ReadonlyFormItem.vue'
import { installConfig } from './config'
import type { EpFieldViewOptions } from './types'
import './styles/index.css'

export { ReadonlyFormItem }
export {
  EP_FIELD_VIEW_CONFIG_KEY,
  createConfig,
  provideEpFieldViewConfig,
  resolveConfig,
  useEpFieldViewConfig
} from './config'
export { DEFAULT_CONFIG, DEFAULT_OPTION_PROPS } from './constants'
export { formatFieldValue, extractOptions } from './utils/format'
export { getByPath, isEmptyValue, isSameValue } from './utils/value'
export type {
  EpFieldViewConfig,
  EpFieldViewOptions,
  FieldViewFormatter,
  FieldViewFormatterContext,
  FieldViewOption,
  FieldViewOptionProps,
  ReadonlyFormItemProps
} from './types'

export interface EpFieldViewPlugin {
  install: (app: App, options?: EpFieldViewOptions) => void
  ReadonlyFormItem: typeof ReadonlyFormItem
}

const install = (app: App, options: EpFieldViewOptions = {}): void => {
  installConfig(app, options)
  app.component(ReadonlyFormItem.name ?? 'ReadonlyFormItem', ReadonlyFormItem)
}

const EpFieldView: EpFieldViewPlugin = {
  install,
  ReadonlyFormItem
}

export default EpFieldView
