import type { EpFieldViewConfig, FieldViewOptionProps } from './types'

/**
 * 中文：默认的选项字段映射。
 *
 * English: Default option key mapping.
 */
export const DEFAULT_OPTION_PROPS: Required<FieldViewOptionProps> = {
  label: 'label',
  value: 'value',
  children: 'children',
  disabled: 'disabled'
}

/**
 * 中文：组件默认配置。多值分隔符默认 `;`，评分默认显示分数。
 *
 * English: Default component configuration. Multiple values use `;` and rates
 * show the score by default.
 */
export const DEFAULT_CONFIG: EpFieldViewConfig = {
  emptyText: '-',
  separator: ';',
  rangeSeparator: '~',
  dateFormat: '',
  timeFormat: '',
  activeText: '开',
  inactiveText: '关',
  theme: '',
  skipValidation: true,
  nowrapInTable: true,
  optionProps: { ...DEFAULT_OPTION_PROPS },
  includeAffixes: true,
  rateMode: 'text',
  inputTagMode: 'text'
}

/**
 * 中文：渲染范围的日期选择器类型。
 *
 * English: Date picker types that render a range.
 */
export const RANGE_DATE_TYPES = new Set(['daterange', 'datetimerange', 'monthrange', 'yearrange', 'quarterrange'])

/**
 * 中文：内置日期格式，与 Element Plus 保持一致。
 *
 * English: Built-in date formats, mirroring Element Plus defaults.
 */
export const DEFAULT_DATE_FORMATS: Record<string, string> = {
  date: 'YYYY-MM-DD',
  dates: 'YYYY-MM-DD',
  week: 'gggg[w]ww',
  year: 'YYYY',
  years: 'YYYY',
  month: 'YYYY-MM',
  months: 'YYYY-MM',
  quarter: 'YYYY-[Q]Q',
  quarters: 'YYYY-[Q]Q',
  datetime: 'YYYY-MM-DD HH:mm:ss',
  monthrange: 'YYYY-MM',
  yearrange: 'YYYY',
  quarterrange: 'YYYY-[Q]Q',
  daterange: 'YYYY-MM-DD',
  datetimerange: 'YYYY-MM-DD HH:mm:ss'
}

/**
 * 中文：默认日期格式。
 *
 * English: Default date format.
 */
export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD'

/**
 * 中文：默认时间格式。
 *
 * English: Default time format.
 */
export const DEFAULT_TIME_FORMAT = 'HH:mm:ss'
