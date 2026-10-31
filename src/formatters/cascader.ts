import type { VNode } from 'vue'
import { isSameValue, toText } from '../utils/value'
import { getVNodeProp } from '../utils/vnode'
import { formatGeneric, readBoolean, readKey } from './shared'
import type { FormatContext } from './types'

interface CascaderEntry {
  value: unknown
  labels: string[]
}

/**
 * 中文：格式化级联选择，支持单值、路径、多选与自定义 value/label 映射。
 *
 * English: Format a cascader value, supporting single values, paths, multiple
 * mode and custom value/label mappings.
 */
export function formatCascader(value: unknown, vnode: VNode, context: FormatContext): string {
  const options = getVNodeProp(vnode, 'options')
  if (!Array.isArray(options) || options.length === 0) return formatGeneric(value, context)

  const mapping = getVNodeProp(vnode, 'props')
  const labelKey = readKey(mapping, 'label') ?? 'label'
  const valueKey = readKey(mapping, 'value') ?? 'value'
  const childrenKey = readKey(mapping, 'children') ?? 'children'
  const multiple = readBoolean(mapping, 'multiple')
  const separator = (getVNodeProp(vnode, 'separator') as string | undefined) ?? '/'

  const index: CascaderEntry[] = []
  indexCascader(options, labelKey, valueKey, childrenKey, [], index)

  const formatPath = (path: unknown[]): string => {
    let level: unknown[] = options
    const labels: string[] = []
    for (const segment of path) {
      if (!Array.isArray(level)) break
      const node = level.find((item) => {
        if (!item || typeof item !== 'object') return false
        return isSameValue((item as Record<string, unknown>)[valueKey], segment)
      }) as Record<string, unknown> | undefined
      if (!node) break
      labels.push(toText(node[labelKey]))
      level = Array.isArray(node[childrenKey]) ? (node[childrenKey] as unknown[]) : []
    }
    if (labels.length === path.length) return labels.join(separator)
    return lookupCascaderLabel(index, path[path.length - 1], separator) ?? toText(path[path.length - 1])
  }

  if (Array.isArray(value)) {
    const nested = value.every((item) => Array.isArray(item))
    if (nested) return value.map((path) => formatPath(path as unknown[])).join(context.separator)
    if (multiple) {
      return value.map((item) => lookupCascaderLabel(index, item, separator) ?? toText(item)).join(context.separator)
    }
    return formatPath(value)
  }
  return lookupCascaderLabel(index, value, separator) ?? toText(value)
}

function indexCascader(
  options: unknown[],
  labelKey: string,
  valueKey: string,
  childrenKey: string,
  parentLabels: string[],
  result: CascaderEntry[]
): void {
  for (const option of options) {
    if (!option || typeof option !== 'object') continue
    const record = option as Record<string, unknown>
    const labels = [...parentLabels, toText(record[labelKey])]
    result.push({ value: record[valueKey], labels })
    const children = record[childrenKey]
    if (Array.isArray(children)) {
      indexCascader(children, labelKey, valueKey, childrenKey, labels, result)
    }
  }
}

function lookupCascaderLabel(index: CascaderEntry[], value: unknown, separator: string): string | undefined {
  const entry = index.find((item) => isSameValue(item.value, value))
  return entry?.labels.join(separator)
}
