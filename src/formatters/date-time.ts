import type { VNode } from 'vue'
import { DEFAULT_DATE_FORMAT, DEFAULT_DATE_FORMATS, DEFAULT_TIME_FORMAT, RANGE_DATE_TYPES } from '../constants'
import dayjs from '../utils/date'
import { getVNodeProp } from '../utils/vnode'
import type { FormatContext } from './types'

/**
 * 中文：格式化日期选择器，支持 range 与 value-format。
 *
 * English: Format a date picker value, including ranges and `value-format`.
 */
export function formatDatePicker(value: unknown, vnode: VNode, context: FormatContext): string {
  const type = (getVNodeProp(vnode, 'type') as string | undefined) ?? 'date'
  const format =
    context.dateFormat ||
    (getVNodeProp(vnode, 'format') as string | undefined) ||
    DEFAULT_DATE_FORMATS[type] ||
    DEFAULT_DATE_FORMAT
  const valueFormat = getVNodeProp(vnode, 'valueFormat', 'value-format') as string | undefined
  const separator = RANGE_DATE_TYPES.has(type) ? context.rangeSeparator : context.separator
  if (Array.isArray(value)) {
    return value.map((item) => formatDateScalar(item, format, valueFormat)).join(separator)
  }
  return formatDateScalar(value, format, valueFormat)
}

/**
 * 中文：格式化单个日期值；无法解析时保留原字符串。
 *
 * English: Format one date value; keep the original string when parsing fails.
 */
export function formatDateScalar(value: unknown, format: string, valueFormat?: string): string {
  if (typeof value === 'string' && valueFormat) {
    if ((valueFormat === 'x' || valueFormat === 'X') && value !== '') {
      const numeric = Number(value)
      if (Number.isFinite(numeric)) {
        return dayjs(valueFormat === 'X' ? numeric * 1000 : numeric).format(format)
      }
    }
    if (valueFormat === format) return value
  }
  if (value instanceof Date || typeof value === 'number') {
    return dayjs(value).format(format)
  }
  if (typeof value === 'string') {
    const parsed = dayjs(value)
    return parsed.isValid() ? parsed.format(format) : value
  }
  return String(value)
}

/**
 * 中文：格式化时间选择器，时间字符串保持原样，范围使用 rangeSeparator。
 *
 * English: Format a time picker value; time strings are kept as-is and ranges
 * use `rangeSeparator`.
 */
export function formatTimePicker(value: unknown, vnode: VNode, context: FormatContext): string {
  const format = context.timeFormat || (getVNodeProp(vnode, 'format') as string | undefined) || DEFAULT_TIME_FORMAT
  const valueFormat = getVNodeProp(vnode, 'valueFormat', 'value-format') as string | undefined
  const formatOne = (item: unknown): string => {
    if (typeof item === 'string') {
      if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(item)) return item
      if (valueFormat === 'x' || valueFormat === 'X') {
        const numeric = Number(item)
        if (Number.isFinite(numeric)) {
          return dayjs(valueFormat === 'X' ? numeric * 1000 : numeric).format(format)
        }
      }
      const parsed = dayjs(item)
      return parsed.isValid() ? parsed.format(format) : item
    }
    if (item instanceof Date || typeof item === 'number') return dayjs(item).format(format)
    return String(item)
  }
  if (Array.isArray(value)) return value.map(formatOne).join(context.rangeSeparator)
  return formatOne(value)
}
