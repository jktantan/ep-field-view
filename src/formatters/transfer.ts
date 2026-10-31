import type { VNode } from 'vue'
import { isSameValue, toText } from '../utils/value'
import { getVNodeProp } from '../utils/vnode'
import { formatGeneric, readKey } from './shared'
import type { FormatContext } from './types'

/**
 * 中文：格式化穿梭框，按 `data` 的 key / label 映射查找标签。
 *
 * English: Format a transfer value by resolving labels from `data` using the
 * configured key / label mapping.
 */
export function formatTransfer(value: unknown, vnode: VNode, context: FormatContext): string {
  const data = getVNodeProp(vnode, 'data')
  if (!Array.isArray(data)) return formatGeneric(value, context)
  const mapping = getVNodeProp(vnode, 'props')
  const keyKey = readKey(mapping, 'key') ?? 'key'
  const labelKey = readKey(mapping, 'label') ?? 'label'
  const labelOf = (item: unknown): string | undefined => {
    const record = data.find((entry) => {
      if (!entry || typeof entry !== 'object') return false
      return isSameValue((entry as Record<string, unknown>)[keyKey], item)
    }) as Record<string, unknown> | undefined
    return record ? toText(record[labelKey]) : undefined
  }
  const values = Array.isArray(value) ? value : [value]
  return values.map((item) => labelOf(item) ?? toText(item)).join(context.separator)
}
