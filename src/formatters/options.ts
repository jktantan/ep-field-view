import { Fragment } from 'vue'
import type { VNode } from 'vue'
import type { FieldViewOption, FieldViewOptionProps } from '../types'
import { isSameValue, toText } from '../utils/value'
import { flattenVNodes, getComponentName, getTextContent, getVNodeProp, resolveVNodeChildren } from '../utils/vnode'
import { readKey } from './shared'

/**
 * 中文：可作为单个选项的组件名。
 *
 * English: Components treated as one option.
 */
export const OPTION_COMPONENTS = new Set(['ElOption', 'ElRadio', 'ElRadioButton', 'ElCheckbox', 'ElCheckboxButton'])

/**
 * 中文：选项容器的组件名。
 *
 * English: Components that group options.
 */
export const OPTION_GROUP_COMPONENTS = new Set(['ElOptionGroup', 'ElRadioGroup', 'ElCheckboxGroup'])

/**
 * 中文：从组件的 `options` / `data` 属性或默认插槽中的选项组件收集选项。
 *
 * English: Collect options from the component's `options` / `data` props or
 * from option components in its default slot.
 */
export function extractOptions(
  vnode: VNode | null | undefined,
  optionProps: Required<FieldViewOptionProps>
): FieldViewOption[] {
  if (!vnode) return []

  const mapping = getVNodeProp(vnode, 'props')
  const keys: Required<FieldViewOptionProps> = {
    label: readKey(mapping, 'label') ?? optionProps.label,
    value: readKey(mapping, 'value') ?? optionProps.value,
    children: readKey(mapping, 'children') ?? optionProps.children,
    disabled: readKey(mapping, 'disabled') ?? optionProps.disabled
  }

  const options = getVNodeProp(vnode, 'options')
  if (Array.isArray(options)) return normalizeOptionList(options, keys)

  const data = getVNodeProp(vnode, 'data')
  if (Array.isArray(data)) return flattenTreeOptions(data, keys)

  const result: FieldViewOption[] = []
  collectOptionVNodes(resolveVNodeChildren(vnode), optionProps, result)
  return result
}

/**
 * 中文：在插槽选项中查找与值匹配的选项 VNode。
 *
 * English: Find the option VNode matching a value inside the slot tree.
 */
export function findOptionVNode(vnode: VNode, value: unknown): VNode | undefined {
  const options: VNode[] = []
  collectOptionVNodeList(resolveVNodeChildren(vnode), options)
  return options.find((option) => isSameValue(getVNodeProp(option, 'value') ?? getVNodeProp(option, 'label'), value))
}

function collectOptionVNodes(
  vnodes: VNode[],
  optionProps: Required<FieldViewOptionProps>,
  result: FieldViewOption[]
): void {
  for (const vnode of vnodes) {
    if (vnode.type === Fragment) {
      collectOptionVNodes(flattenVNodes(vnode.children), optionProps, result)
      continue
    }
    const name = getComponentName(vnode)
    if (name && OPTION_COMPONENTS.has(name)) {
      const option = normalizeOptionVNode(vnode)
      if (option) result.push(option)
      continue
    }
    if (name && OPTION_GROUP_COMPONENTS.has(name)) {
      collectOptionVNodes(resolveVNodeChildren(vnode), optionProps, result)
      continue
    }
    const children = resolveVNodeChildren(vnode)
    if (children.length > 0) collectOptionVNodes(children, optionProps, result)
  }
}

function collectOptionVNodeList(vnodes: VNode[], result: VNode[]): void {
  for (const child of vnodes) {
    if (child.type === Fragment) {
      collectOptionVNodeList(flattenVNodes(child.children), result)
      continue
    }
    const name = getComponentName(child)
    if (name && OPTION_COMPONENTS.has(name)) {
      result.push(child)
      continue
    }
    if (name && OPTION_GROUP_COMPONENTS.has(name)) {
      collectOptionVNodeList(resolveVNodeChildren(child), result)
      continue
    }
    const children = resolveVNodeChildren(child)
    if (children.length > 0) collectOptionVNodeList(children, result)
  }
}

function normalizeOptionVNode(vnode: VNode): FieldViewOption | undefined {
  const rawValue = getVNodeProp(vnode, 'value')
  const rawLabel = getVNodeProp(vnode, 'label')
  const text = getTextContent(vnode)
  const value = rawValue !== undefined ? rawValue : rawLabel
  if (value === undefined) return undefined
  const label = text || (rawLabel !== undefined ? toText(rawLabel) : toText(value))
  return { label, value }
}

function normalizeOptionList(list: unknown[], optionProps: Required<FieldViewOptionProps>): FieldViewOption[] {
  const result: FieldViewOption[] = []
  for (const item of list) {
    if (item === null || item === undefined) continue
    if (typeof item !== 'object') {
      result.push({ label: toText(item), value: item })
      continue
    }
    const record = item as Record<string, unknown>
    const value = record[optionProps.value] ?? record.value
    const rawLabel = record[optionProps.label] ?? record.label ?? record.name ?? value
    result.push({
      ...record,
      label: rawLabel === null || rawLabel === undefined ? undefined : toText(rawLabel),
      value
    })
  }
  return result
}

function flattenTreeOptions(list: unknown[], optionProps: Required<FieldViewOptionProps>): FieldViewOption[] {
  const result: FieldViewOption[] = []
  for (const item of list) {
    if (item === null || item === undefined) continue
    if (typeof item !== 'object') {
      result.push({ label: toText(item), value: item })
      continue
    }
    const record = item as Record<string, unknown>
    const value = record[optionProps.value] ?? record.value
    const rawLabel = record[optionProps.label] ?? record.label ?? value
    result.push({
      ...record,
      label: rawLabel === null || rawLabel === undefined ? undefined : toText(rawLabel),
      value
    })
    const children = record[optionProps.children] ?? record.children
    if (Array.isArray(children)) result.push(...flattenTreeOptions(children, optionProps))
  }
  return result
}
