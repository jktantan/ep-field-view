import type { EpFieldViewConfig, FieldViewOptionProps } from './types'

export const DEFAULT_OPTION_PROPS: Required<FieldViewOptionProps> = {
  label: 'label',
  value: 'value',
  children: 'children',
  disabled: 'disabled'
}

export const DEFAULT_CONFIG: EpFieldViewConfig = {
  emptyText: '-',
  separator: ',',
  rangeSeparator: '~',
  dateFormat: '',
  timeFormat: '',
  activeText: '开',
  inactiveText: '关',
  theme: '',
  skipValidation: true,
  nowrapInTable: true,
  optionProps: { ...DEFAULT_OPTION_PROPS },
  includeAffixes: true
}

/**
 * Components whose value can be resolved from their slot VNodes.
 */
export const CAPTURED_COMPONENTS = new Set([
  'ElAutocomplete',
  'ElCascader',
  'ElCheckbox',
  'ElCheckboxButton',
  'ElCheckboxGroup',
  'ElColorPicker',
  'ElDatePicker',
  'ElInput',
  'ElInputNumber',
  'ElInputTag',
  'ElMention',
  'ElRadio',
  'ElRadioButton',
  'ElRadioGroup',
  'ElRate',
  'ElSegmented',
  'ElSelect',
  'ElSelectV2',
  'ElSlider',
  'ElSwitch',
  'ElTimePicker',
  'ElTimeSelect',
  'ElTransfer',
  'ElTreeSelect'
])

/** Date picker types that render a range. */
export const RANGE_DATE_TYPES = new Set(['daterange', 'datetimerange', 'monthrange'])

/** Built-in date formats, mirroring Element Plus defaults. */
export const DEFAULT_DATE_FORMATS: Record<string, string> = {
  date: 'YYYY-MM-DD',
  dates: 'YYYY-MM-DD',
  week: 'gggg[w]ww',
  year: 'YYYY',
  month: 'YYYY-MM',
  datetime: 'YYYY-MM-DD HH:mm:ss',
  monthrange: 'YYYY-MM',
  daterange: 'YYYY-MM-DD',
  datetimerange: 'YYYY-MM-DD HH:mm:ss'
}

export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD'
export const DEFAULT_TIME_FORMAT = 'HH:mm:ss'
