import dayjs from './utils/date'
import type { FieldViewFormatter, FieldViewFormatterContext, FieldViewOption } from './types'
import { isEmptyValue, isSameValue, toText } from './utils/value'

/**
 * 中文：金额格式化预设的配置。
 *
 * `currency` 存在时使用 `Intl.NumberFormat` 的货币样式；否则使用普通数字
 * 格式并拼接 `symbol`。
 *
 * English: Options for the money formatter preset.
 *
 * When `currency` is set the `Intl.NumberFormat` currency style is used;
 * otherwise a decimal format is used and `symbol` is attached.
 */
export interface MoneyFormatterOptions {
  /**
   * 中文：`Intl.NumberFormat` 的语言区域，默认 `zh-CN`。
   *
   * English: Locale passed to `Intl.NumberFormat`. Defaults to `zh-CN`.
   */
  locale?: string
  /**
   * 中文：ISO 4217 货币代码，例如 `CNY`、`USD`。设置后忽略 `symbol`。
   *
   * English: ISO 4217 currency code such as `CNY` or `USD`. When set, `symbol`
   * is ignored.
   */
  currency?: string
  /**
   * 中文：货币符号，默认 `¥`。
   *
   * English: Currency symbol. Defaults to `¥`.
   */
  symbol?: string
  /**
   * 中文：符号位置，默认放在数字前。
   *
   * English: Where the symbol is placed. Defaults to the prefix position.
   */
  symbolPosition?: 'prefix' | 'suffix'
  /**
   * 中文：小数位数，默认 2。
   *
   * English: Number of fraction digits. Defaults to `2`.
   */
  precision?: number
  /**
   * 中文：是否使用千分位，默认 `true`。
   *
   * English: Whether to use grouping separators. Defaults to `true`.
   */
  useGrouping?: boolean
  /**
   * 中文：是否去掉末尾的 `0`，默认 `false`。
   *
   * English: Trim trailing zeros. Defaults to `false`.
   */
  trimTrailingZeros?: boolean
}

/**
 * 中文：百分比格式化预设的配置。
 *
 * English: Options for the percent formatter preset.
 */
export interface PercentFormatterOptions {
  /**
   * 中文：`Intl.NumberFormat` 的语言区域，默认 `zh-CN`。
   *
   * English: Locale passed to `Intl.NumberFormat`. Defaults to `zh-CN`.
   */
  locale?: string
  /**
   * 中文：小数位数，默认 2。
   *
   * English: Number of fraction digits. Defaults to `2`.
   */
  precision?: number
  /**
   * 中文：乘数。默认 `100`，即 `0.25` 显示为 `25%`；若原值已经是
   * `25` 表示 `25%`，设置为 `1`。
   *
   * English: Multiplier. Defaults to `100`, so `0.25` renders as `25%`. Set to
   * `1` when the raw value already represents a percentage (`25` -> `25%`).
   */
  multiplier?: number
  /**
   * 中文：是否使用千分位，默认 `true`。
   *
   * English: Whether to use grouping separators. Defaults to `true`.
   */
  useGrouping?: boolean
  /**
   * 中文：是否去掉末尾的 `0`，默认 `true`。
   *
   * English: Trim trailing zeros. Defaults to `true`.
   */
  trimTrailingZeros?: boolean
}

/**
 * 中文：日期格式化预设的配置。
 *
 * English: Options for the date formatter preset.
 */
export interface DateFormatterOptions {
  /**
   * 中文：多值分隔符；默认使用 `TextFormItem` 的 `separator`。
   *
   * English: Separator for multiple values. Defaults to the `TextFormItem`
   * separator.
   */
  separator?: string
}

/**
 * 中文：字典映射的兜底策略。
 *
 * - `value`：显示原始值；
 * - `empty`：显示 `emptyText`；
 * - 字符串 / 函数：显示指定文案。
 *
 * English: Fallback strategy for dictionary lookups.
 *
 * - `value`: show the raw value;
 * - `empty`: show `emptyText`;
 * - string / function: show the given text.
 */
export type DictFallback = 'value' | 'empty' | string | ((value: unknown) => string | null | undefined)

/**
 * 中文：字典格式化预设的配置。
 *
 * English: Options for the dictionary formatter preset.
 */
export interface DictFormatterOptions {
  /**
   * 中文：多值分隔符；默认使用 `TextFormItem` 的 `separator`。
   *
   * English: Separator for multiple values. Defaults to the `TextFormItem`
   * separator.
   */
  separator?: string
  /**
   * 中文：未命中字典时的兜底策略，默认 `value`。
   *
   * English: Fallback when a value is not found. Defaults to `value`.
   */
  fallback?: DictFallback
  /**
   * 中文：字典为选项数组时使用的标签字段，默认 `label`。
   *
   * English: Label key when the dictionary is an option array. Defaults to
   * `label`.
   */
  labelKey?: string
  /**
   * 中文：字典为选项数组时使用的值字段，默认 `value`。
   *
   * English: Value key when the dictionary is an option array. Defaults to
   * `value`.
   */
  valueKey?: string
}

/**
 * 中文：字典数据源，支持普通对象、`Map` 与选项数组。
 *
 * English: Dictionary source: a plain object, a `Map` or an option array.
 */
export type DictSource = Record<string, unknown> | Map<unknown, unknown> | FieldViewOption[]

interface DictionaryEntry {
  value: unknown
  label: string
}

/**
 * 中文：金额格式化预设。
 *
 * ```ts
 * const formatter = moneyFormatter({ precision: 2 })
 * // 1234.5 -> ¥1,234.50
 * ```
 *
 * English: Money formatter preset.
 *
 * ```ts
 * const formatter = moneyFormatter({ precision: 2 })
 * // 1234.5 -> ¥1,234.50
 * ```
 */
export function moneyFormatter(options: MoneyFormatterOptions = {}): FieldViewFormatter {
  const {
    locale = 'zh-CN',
    currency,
    symbol = '¥',
    symbolPosition = 'prefix',
    precision = 2,
    useGrouping = true,
    trimTrailingZeros = false
  } = options

  const numberFormat = currency
    ? createNumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: trimTrailingZeros ? 0 : precision,
        maximumFractionDigits: precision,
        useGrouping
      })
    : createNumberFormat(locale, {
        minimumFractionDigits: trimTrailingZeros ? 0 : precision,
        maximumFractionDigits: precision,
        useGrouping
      })

  return (value, context) =>
    formatEach(value, context, (item) => {
      const numeric = toFiniteNumber(item)
      if (numeric === undefined) return fallbackText(item)
      const text = numberFormat.format(numeric)
      if (currency || !symbol) return text
      return symbolPosition === 'suffix' ? `${text}${symbol}` : `${symbol}${text}`
    })
}

/**
 * 中文：百分比格式化预设。默认 `0.125` 显示为 `12.5%`。
 *
 * English: Percent formatter preset. `0.125` renders as `12.5%` by default.
 */
export function percentFormatter(options: PercentFormatterOptions = {}): FieldViewFormatter {
  const { locale = 'zh-CN', precision = 2, multiplier = 100, useGrouping = true, trimTrailingZeros = true } = options

  const numberFormat =
    multiplier === 100
      ? createNumberFormat(locale, {
          style: 'percent',
          minimumFractionDigits: trimTrailingZeros ? 0 : precision,
          maximumFractionDigits: precision,
          useGrouping
        })
      : createNumberFormat(locale, {
          minimumFractionDigits: trimTrailingZeros ? 0 : precision,
          maximumFractionDigits: precision,
          useGrouping
        })

  return (value, context) =>
    formatEach(value, context, (item) => {
      const numeric = toFiniteNumber(item)
      if (numeric === undefined) return fallbackText(item)
      return multiplier === 100 ? numberFormat.format(numeric) : `${numberFormat.format(numeric * multiplier)}%`
    })
}

/**
 * 中文：日期格式化预设，基于 dayjs。
 *
 * 支持 `Date`、时间戳与可解析的日期字符串；无法解析时保留原字符串。
 *
 * English: Date formatter preset based on dayjs.
 *
 * Accepts `Date`, timestamps and parseable date strings. Unparseable strings
 * are kept as-is.
 */
export function dateFormatter(format = 'YYYY-MM-DD', options: DateFormatterOptions = {}): FieldViewFormatter {
  return (value, context) => {
    const separator = options.separator ?? context.separator
    const items = Array.isArray(value) ? value : [value]
    const texts = items
      .map((item) => {
        if (isEmptyValue(item)) return ''
        const parsed = dayjs(item as string | number | Date)
        return parsed.isValid() ? parsed.format(format) : toText(item)
      })
      .filter((item) => item !== '')
    return texts.length > 0 ? texts.join(separator) : null
  }
}

/**
 * 中文：字典映射格式化预设。
 *
 * ```ts
 * const statusFormatter = dictFormatter({
 *   active: '启用',
 *   disabled: '停用'
 * })
 * ```
 *
 * English: Dictionary formatter preset.
 *
 * ```ts
 * const statusFormatter = dictFormatter({
 *   active: 'Enabled',
 *   disabled: 'Disabled'
 * })
 * ```
 */
export function dictFormatter(source: DictSource, options: DictFormatterOptions = {}): FieldViewFormatter {
  const entries = normalizeDictionary(source, options)
  const fallback = options.fallback ?? 'value'

  return (value, context) => {
    const separator = options.separator ?? context.separator
    if (Array.isArray(value)) {
      const texts = value
        .map((item) => resolveDictionaryText(item, entries, fallback))
        .filter((item): item is string => item !== null)
      return texts.length > 0 ? texts.join(separator) : null
    }
    return resolveDictionaryText(value, entries, fallback)
  }
}

function createNumberFormat(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  try {
    return new Intl.NumberFormat(locale, options)
  } catch {
    // 中文：无效的 locale / currency 时退回默认区域，避免抛错中断渲染。
    // English: Fall back to the default locale for invalid locale/currency.
    return new Intl.NumberFormat(undefined, options)
  }
}

function formatEach(
  value: unknown,
  context: FieldViewFormatterContext,
  format: (item: unknown) => string | null
): string | null {
  if (Array.isArray(value)) {
    const texts = value
      .map((item) => (isEmptyValue(item) ? '' : format(item)))
      .filter((item) => item !== null && item !== '')
    return texts.length > 0 ? texts.join(context.separator) : null
  }
  if (isEmptyValue(value)) return null
  return format(value)
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value === 'bigint') return Number(value)
  if (typeof value === 'string') {
    // 中文：允许 `¥1,234.50`、`12.5%` 等带符号的字符串。
    // English: Accept strings such as `¥1,234.50` or `12.5%`.
    const cleaned = value.replace(/[^0-9.+-]/g, '')
    if (!cleaned) return undefined
    const numeric = Number(cleaned)
    return Number.isFinite(numeric) ? numeric : undefined
  }
  return undefined
}

function fallbackText(value: unknown): string | null {
  if (isEmptyValue(value)) return null
  return toText(value)
}

function normalizeDictionary(source: DictSource, options: DictFormatterOptions): DictionaryEntry[] {
  const labelKey = options.labelKey ?? 'label'
  const valueKey = options.valueKey ?? 'value'
  const entries: DictionaryEntry[] = []

  if (source instanceof Map) {
    for (const [value, label] of source.entries()) {
      entries.push({ value, label: toText(label) })
    }
    return entries
  }

  if (Array.isArray(source)) {
    for (const item of source) {
      if (!item || typeof item !== 'object') continue
      const record = item as Record<string, unknown>
      const value = record[valueKey]
      const label = record[labelKey] ?? value
      entries.push({ value, label: toText(label) })
    }
    return entries
  }

  for (const [value, label] of Object.entries(source)) {
    if (label === null || label === undefined) continue
    entries.push({ value, label: toText(label) })
  }
  return entries
}

function resolveDictionaryText(value: unknown, entries: DictionaryEntry[], fallback: DictFallback): string | null {
  if (isEmptyValue(value)) return null
  const entry = entries.find((item) => isSameValue(item.value, value))
  if (entry) return entry.label

  if (fallback === 'empty') return null
  if (fallback === 'value') return toText(value)
  if (typeof fallback === 'function') return fallback(value) ?? null
  return fallback
}
