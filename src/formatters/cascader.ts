import type { VNode } from 'vue'
import { isSameValue, toText } from '../utils/value'
import { getVNodeProp } from '../utils/vnode'
import { formatGeneric, readBoolean, readKey } from './shared'
import type { FormatContext } from './types'

interface CascaderEntry {
  value: unknown
  labels: string[]
}

interface CascaderIndex {
  byKey: Map<string, CascaderEntry>
  entries: CascaderEntry[]
}

/**
 * 中文：格式化级联选择，支持单值、路径、多选、`emitPath: false` 与自定义
 * value/label 映射。多选值会去重并保留首次出现的顺序。
 *
 * English: Format a cascader value, supporting single values, paths, multiple
 * mode, `emitPath: false` and custom value/label mappings. Multiple values are
 * de-duplicated while preserving first-seen order.
 */
export function formatCascader(value: unknown, vnode: VNode, context: FormatContext): string {
  const options = getVNodeProp(vnode, 'options')
  if (!Array.isArray(options) || options.length === 0) return formatGeneric(value, context)

  const mapping = getVNodeProp(vnode, 'props')
  const labelKey = readKey(mapping, 'label') ?? 'label'
  const valueKey = readKey(mapping, 'value') ?? 'value'
  const childrenKey = readKey(mapping, 'children') ?? 'children'
  const multiple = readBoolean(mapping, 'multiple')
  const emitPath = readEmitPath(mapping)
  const separator = (getVNodeProp(vnode, 'separator') as string | undefined) ?? '/'

  const index: CascaderIndex = { byKey: new Map(), entries: [] }
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
    const nested = value.some((item) => Array.isArray(item))
    if (nested) {
      // 中文：`emitPath: true` 的多选值是路径数组；按路径展示并去重。
      // English: With `emitPath: true`, multiple values are path arrays;
      // format each path and de-duplicate.
      return uniqueTexts(
        value.filter((item): item is unknown[] => Array.isArray(item)).map((path) => formatPath(path))
      ).join(context.separator)
    }
    if (multiple || !emitPath) {
      // 中文：`emitPath: false` 的单选是叶子值；数组即多选，展示完整路径并去重。
      // English: With `emitPath: false` a single value is a leaf; an array means
      // multiple. Show full paths and de-duplicate.
      return uniqueTexts(value.map((item) => lookupCascaderLabel(index, item, separator) ?? toText(item))).join(
        context.separator
      )
    }
    return formatPath(value)
  }
  return lookupCascaderLabel(index, value, separator) ?? toText(value)
}

function readEmitPath(mapping: unknown): boolean {
  if (!mapping || typeof mapping !== 'object') return true
  const value = (mapping as Record<string, unknown>).emitPath
  return value === undefined ? true : Boolean(value)
}

function indexCascader(
  options: unknown[],
  labelKey: string,
  valueKey: string,
  childrenKey: string,
  parentLabels: string[],
  index: CascaderIndex
): void {
  for (const option of options) {
    if (!option || typeof option !== 'object') continue
    const record = option as Record<string, unknown>
    const labels = [...parentLabels, toText(record[labelKey])]
    const entry = { value: record[valueKey], labels }
    index.entries.push(entry)
    // 中文：同值多次出现时保留第一个，避免多选展示重复路径。
    // English: Keep the first entry for duplicate values so multiple mode does
    // not repeat paths.
    const key = valueKeyOf(entry.value)
    if (!index.byKey.has(key)) index.byKey.set(key, entry)
    const children = record[childrenKey]
    if (Array.isArray(children)) {
      indexCascader(children, labelKey, valueKey, childrenKey, labels, index)
    }
  }
}

function lookupCascaderLabel(index: CascaderIndex, value: unknown, separator: string): string | undefined {
  // 中文：Map 命中原始值（数字/字符串按字符串化比较），对象值回退到引用比较。
  // English: The map handles primitives (numbers/strings compare by string
  // form); object values fall back to reference comparison.
  const entry = index.byKey.get(valueKeyOf(value)) ?? index.entries.find((item) => isSameValue(item.value, value))
  return entry?.labels.join(separator)
}

function valueKeyOf(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'object') {
    try {
      return `object:${JSON.stringify(value)}`
    } catch {
      return `object:${String(value)}`
    }
  }
  return `value:${String(value)}`
}

function uniqueTexts(texts: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const text of texts) {
    if (seen.has(text)) continue
    seen.add(text)
    result.push(text)
  }
  return result
}
