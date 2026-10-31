import { DEFAULT_DATE_FORMAT } from '../constants'
import type { FieldViewOption } from '../types'
import dayjs from '../utils/date'
import { getObjectLabel, isSameValue, toText } from '../utils/value'
import type { FormatContext } from './types'

/**
 * 中文：通用值格式化。未识别组件、数组、布尔、日期与对象的兜底处理。
 *
 * English: Generic value formatting used as a fallback for unknown components,
 * arrays, booleans, dates and objects.
 */
export function formatGeneric(value: unknown, context: FormatContext): string {
  if (Array.isArray(value)) {
    return value.map((item) => formatGeneric(item, context)).join(context.separator)
  }
  if (value instanceof Date) {
    return dayjs(value).format(context.dateFormat || DEFAULT_DATE_FORMAT)
  }
  if (typeof value === 'boolean') return value ? '是' : '否'
  if (typeof value === 'object' && value !== null) {
    return getObjectLabel(value) ?? JSON.stringify(value) ?? toText(value)
  }
  return toText(value)
}

/**
 * 中文：按值查找选项的展示文本。
 *
 * English: Find the display label of an option by value.
 */
export function findOptionLabel(options: FieldViewOption[], value: unknown): string | undefined {
  const option = options.find((item) => isSameValue(item.value, value))
  if (!option) return undefined
  return option.label === null || option.label === undefined ? toText(option.value) : toText(option.label)
}

/**
 * 中文：从组件的 `props` 映射对象中读取字符串键。
 *
 * English: Read a string key from a component's `props` mapping object.
 */
export function readKey(mapping: unknown, key: string): string | undefined {
  if (!mapping || typeof mapping !== 'object') return undefined
  const value = (mapping as Record<string, unknown>)[key]
  return typeof value === 'string' ? value : undefined
}

/**
 * 中文：读取布尔映射值。
 *
 * English: Read a boolean value from a props mapping object.
 */
export function readBoolean(mapping: unknown, key: string): boolean {
  if (!mapping || typeof mapping !== 'object') return false
  return Boolean((mapping as Record<string, unknown>)[key])
}
