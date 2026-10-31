import dayjs from 'dayjs'
import { Comment, Fragment, Text, isVNode } from 'vue'
import type { VNode, VNodeChild } from 'vue'
import { DEFAULT_DATE_FORMAT, DEFAULT_DATE_FORMATS, DEFAULT_TIME_FORMAT, RANGE_DATE_TYPES } from '../constants'
import type { EpFieldViewConfig, FieldViewOption, FieldViewOptionProps } from '../types'
import { getObjectLabel, isEmptyValue, isSameValue, toText } from './value'
import {
  flattenVNodes,
  getComponentName,
  getDefaultSlotVNode,
  getNamedSlotText,
  getNamedSlotVNode,
  getTextContent,
  getVNodeProp,
  resolveVNodeChildren
} from './vnode'

export interface FormatContext {
  config: EpFieldViewConfig
  /** Separator for multiple values. */
  separator: string
  /** Separator for range values. */
  rangeSeparator: string
  /** Explicit date format; empty means "use the picker's format". */
  dateFormat: string
  /** Explicit time format; empty means "use the picker's format". */
  timeFormat: string
  /** Option key mapping. */
  optionProps: Required<FieldViewOptionProps>
  /** Include input prefix/suffix/prepend/append slot text. */
  includeAffixes: boolean
}

const OPTION_COMPONENTS = new Set(['ElOption', 'ElRadio', 'ElRadioButton', 'ElCheckbox', 'ElCheckboxButton'])

const OPTION_GROUP_COMPONENTS = new Set(['ElOptionGroup', 'ElRadioGroup', 'ElCheckboxGroup'])

const SELECT_COMPONENTS = new Set(['ElSelect', 'ElSelectV2', 'ElTreeSelect'])

const CASCADER_COMPONENT = 'ElCascader'
const TRANSFER_COMPONENT = 'ElTransfer'

/**
 * Format the value of a field for read-only display.
 */
export function formatFieldValue(value: unknown, vnode: VNode | null, context: FormatContext): string {
  if (isEmptyValue(value)) return context.config.emptyText
  if (vnode) {
    const formatted = formatByComponent(value, vnode, context)
    if (formatted !== undefined) return formatted
  }
  return formatGeneric(value, context)
}

function formatByComponent(value: unknown, vnode: VNode, context: FormatContext): string | undefined {
  const name = getComponentName(vnode)
  if (!name) return undefined

  if (SELECT_COMPONENTS.has(name)) {
    return formatSelect(value, vnode, context)
  }

  if (name === 'ElRadioGroup' || name === 'ElCheckboxGroup') {
    const options = extractOptions(vnode, context.optionProps)
    return formatOptionValue(value, options, context)
  }

  if (name === 'ElRadio' || name === 'ElRadioButton' || name === 'ElCheckboxButton') {
    const options = extractOptions(vnode, context.optionProps)
    return formatOptionValue(value, options, context)
  }

  if (name === 'ElCheckbox') {
    return formatCheckbox(value, vnode, context)
  }

  if (name === 'ElInput') {
    return formatInput(value, vnode, context)
  }

  if (name === 'ElInputNumber') {
    return formatInputNumber(value, vnode, context)
  }

  if (name === CASCADER_COMPONENT) {
    return formatCascader(value, vnode, context)
  }

  if (name === TRANSFER_COMPONENT) {
    return formatTransfer(value, vnode, context)
  }

  if (name === 'ElSwitch') {
    return formatSwitch(value, vnode, context)
  }

  if (name === 'ElDatePicker') {
    return formatDatePicker(value, vnode, context)
  }

  if (name === 'ElTimePicker') {
    return formatTimePicker(value, vnode, context)
  }

  if (name === 'ElSlider') {
    if (Array.isArray(value)) return value.map((item) => toText(item)).join(context.rangeSeparator)
    return toText(value)
  }

  if (name === 'ElSegmented') {
    const options = extractOptions(vnode, context.optionProps)
    return findOptionLabel(options, value) ?? formatGeneric(value, context)
  }

  if (
    name === 'ElInputTag' ||
    name === 'ElMention' ||
    name === 'ElAutocomplete' ||
    name === 'ElTimeSelect' ||
    name === 'ElRate' ||
    name === 'ElColorPicker'
  ) {
    if (Array.isArray(value)) return value.map((item) => toText(item)).join(context.separator)
    return toText(value)
  }

  return undefined
}

/**
 * Collect options from the component's `options` / `data` props or from the
 * option components in its default slot.
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

function readKey(mapping: unknown, key: string): string | undefined {
  if (!mapping || typeof mapping !== 'object') return undefined
  const value = (mapping as Record<string, unknown>)[key]
  return typeof value === 'string' ? value : undefined
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

/**
 * Resolve rich read-only content from the component's own display slots.
 *
 * Only slots that affect the component's *final selected display* are used:
 * - `el-select`'s `#label` slot (the selected value in the input box);
 * - the default slot of the selected `el-radio` / `el-checkbox`.
 *
 * `el-option`'s `#label` slot only affects the dropdown item, not the selected
 * value, so it is intentionally ignored here. Returns `undefined` when the
 * component has no custom selected display, in which case the formatted text is
 * used instead.
 */
export function resolveCustomDisplay(
  value: unknown,
  vnode: VNode | null,
  context: FormatContext
): VNodeChild | undefined {
  if (!vnode || isEmptyValue(value)) return undefined
  const name = getComponentName(vnode)
  if (!name) return undefined

  if (SELECT_COMPONENTS.has(name)) {
    return resolveSelectDisplay(value, vnode, context)
  }

  if (name === 'ElRadioGroup' || name === 'ElCheckboxGroup') {
    return resolveOptionGroupDisplay(value, vnode, context)
  }

  if (name === 'ElRadio' || name === 'ElRadioButton' || name === 'ElCheckboxButton' || name === 'ElCheckbox') {
    return getDefaultSlotVNode(vnode)
  }

  return undefined
}

function resolveSelectDisplay(value: unknown, vnode: VNode, context: FormatContext): VNodeChild | undefined {
  const options = extractOptions(vnode, context.optionProps)
  if (Array.isArray(value)) {
    const parts: VNodeChild[] = []
    value.forEach((item, index) => {
      const content = resolveSelectValueDisplay(item, index, vnode, options, context)
      if (content === undefined) return
      if (parts.length > 0) parts.push(context.separator)
      parts.push(content)
    })
    return parts.length > 0 ? parts : undefined
  }
  return resolveSelectValueDisplay(value, 0, vnode, options, context)
}

function resolveSelectValueDisplay(
  value: unknown,
  index: number,
  vnode: VNode,
  options: FieldViewOption[],
  context: FormatContext
): VNodeChild | undefined {
  const label = findOptionLabel(options, value) ?? formatGeneric(value, context)
  return getNamedSlotVNode(vnode, 'label', { index, label, value, selected: true })
}

function resolveOptionGroupDisplay(value: unknown, vnode: VNode, context: FormatContext): VNodeChild | undefined {
  if (Array.isArray(value)) {
    const parts: VNodeChild[] = []
    for (const item of value) {
      const content = resolveOptionValueDisplay(item, vnode)
      if (content === undefined) continue
      if (parts.length > 0) parts.push(context.separator)
      parts.push(content)
    }
    return parts.length > 0 ? parts : undefined
  }
  return resolveOptionValueDisplay(value, vnode)
}

function resolveOptionValueDisplay(value: unknown, vnode: VNode): VNodeChild | undefined {
  const optionVNode = findOptionVNode(vnode, value)
  if (!optionVNode) return undefined
  const content = getDefaultSlotVNode(optionVNode)
  // Plain text is formatted as a string (it has the right separators and no
  // template whitespace); only rich content needs the original VNodes.
  return content !== undefined && containsElementVNode(content) ? content : undefined
}

function containsElementVNode(input: VNodeChild): boolean {
  if (Array.isArray(input)) return input.some((item) => containsElementVNode(item))
  if (isVNode(input)) {
    if (input.type === Text || input.type === Comment) return false
    if (input.type === Fragment) return containsElementVNode(input.children as VNodeChild)
    return true
  }
  return false
}

function findOptionVNode(vnode: VNode, value: unknown): VNode | undefined {
  const options: VNode[] = []
  collectOptionVNodeList(resolveVNodeChildren(vnode), options)
  return options.find((option) => isSameValue(getVNodeProp(option, 'value') ?? getVNodeProp(option, 'label'), value))
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

function formatSelect(value: unknown, vnode: VNode, context: FormatContext): string {
  const options = extractOptions(vnode, context.optionProps)
  if (Array.isArray(value)) {
    return value.map((item, index) => formatSelectValue(item, index, vnode, options, context)).join(context.separator)
  }
  return formatSelectValue(value, 0, vnode, options, context)
}

function formatSelectValue(
  value: unknown,
  index: number,
  vnode: VNode,
  options: FieldViewOption[],
  context: FormatContext
): string {
  const label = findOptionLabel(options, value) ?? formatGeneric(value, context)
  // `el-select` supports a `#label` slot to customise the selected value.
  const custom = getNamedSlotText(vnode, 'label', { index, label, value, selected: true })
  return custom || label
}

function formatInput(value: unknown, vnode: VNode, context: FormatContext): string {
  const text = Array.isArray(value)
    ? value.map((item) => formatGeneric(item, context)).join(context.separator)
    : formatGeneric(value, context)
  if (!context.includeAffixes) return text
  // Keep text provided through the input's prefix / prepend / append / suffix
  // slots (for example a currency unit or a protocol prefix).
  return [
    getNamedSlotText(vnode, 'prefix'),
    getNamedSlotText(vnode, 'prepend'),
    text,
    getNamedSlotText(vnode, 'append'),
    getNamedSlotText(vnode, 'suffix')
  ].join('')
}

function formatInputNumber(value: unknown, vnode: VNode, context: FormatContext): string {
  const formatter = getVNodeProp(vnode, 'formatter')
  if (typeof formatter === 'function') {
    try {
      const result = (formatter as (val: unknown, info: { userInput: string | null }) => unknown)(value, {
        userInput: null
      })
      if (result !== null && result !== undefined && result !== '') return toText(result)
    } catch {
      // Fall back to the raw value when a custom formatter throws.
    }
  }
  return formatGeneric(value, context)
}

function formatOptionValue(value: unknown, options: FieldViewOption[], context: FormatContext): string {
  if (Array.isArray(value)) {
    return value.map((item) => findOptionLabel(options, item) ?? formatGeneric(item, context)).join(context.separator)
  }
  return findOptionLabel(options, value) ?? formatGeneric(value, context)
}

function findOptionLabel(options: FieldViewOption[], value: unknown): string | undefined {
  const option = options.find((item) => isSameValue(item.value, value))
  if (!option) return undefined
  return option.label === null || option.label === undefined ? toText(option.value) : toText(option.label)
}

function formatCheckbox(value: unknown, vnode: VNode, context: FormatContext): string {
  const trueLabel = getVNodeProp(vnode, 'trueLabel', 'true-label', 'trueValue', 'true-value')
  const falseLabel = getVNodeProp(vnode, 'falseLabel', 'false-label', 'falseValue', 'false-value')
  if (typeof value === 'boolean' && (trueLabel !== undefined || falseLabel !== undefined)) {
    return value ? toText(trueLabel ?? '是') : toText(falseLabel ?? '否')
  }
  const options = extractOptions(vnode, context.optionProps)
  if (options.length > 0) return formatOptionValue(value, options, context)
  return formatGeneric(value, context)
}

interface CascaderEntry {
  value: unknown
  labels: string[]
}

function formatCascader(value: unknown, vnode: VNode, context: FormatContext): string {
  const options = getVNodeProp(vnode, 'options')
  if (!Array.isArray(options) || options.length === 0) return formatGeneric(value, context)

  const mapping = getVNodeProp(vnode, 'props')
  const labelKey = readKey(mapping, 'label') ?? 'label'
  const valueKey = readKey(mapping, 'value') ?? 'value'
  const childrenKey = readKey(mapping, 'children') ?? 'children'
  const multiple = Boolean(readBoolean(mapping, 'multiple'))
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

function readBoolean(mapping: unknown, key: string): boolean {
  if (!mapping || typeof mapping !== 'object') return false
  return Boolean((mapping as Record<string, unknown>)[key])
}

function formatTransfer(value: unknown, vnode: VNode, context: FormatContext): string {
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

function formatSwitch(value: unknown, vnode: VNode, context: FormatContext): string {
  const activeValue = getVNodeProp(vnode, 'activeValue', 'active-value') ?? true
  const inactiveValue = getVNodeProp(vnode, 'inactiveValue', 'inactive-value') ?? false
  const activeText =
    (getVNodeProp(vnode, 'activeText', 'active-text') as string | undefined) || context.config.activeText
  const inactiveText =
    (getVNodeProp(vnode, 'inactiveText', 'inactive-text') as string | undefined) || context.config.inactiveText
  if (isSameValue(value, activeValue)) return activeText
  if (isSameValue(value, inactiveValue)) return inactiveText
  return formatGeneric(value, context)
}

function formatDatePicker(value: unknown, vnode: VNode, context: FormatContext): string {
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

function formatDateScalar(value: unknown, format: string, valueFormat?: string): string {
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
  return toText(value)
}

function formatTimePicker(value: unknown, vnode: VNode, context: FormatContext): string {
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
    return toText(item)
  }
  if (Array.isArray(value)) return value.map(formatOne).join(context.rangeSeparator)
  return formatOne(value)
}

function formatGeneric(value: unknown, context: FormatContext): string {
  if (Array.isArray(value)) {
    return value.map((item) => formatGeneric(item, context)).join(context.separator)
  }
  if (value instanceof Date) {
    return formatDateScalar(value, context.dateFormat || DEFAULT_DATE_FORMAT)
  }
  if (typeof value === 'boolean') return value ? '是' : '否'
  if (typeof value === 'object' && value !== null) {
    return getObjectLabel(value) ?? JSON.stringify(value) ?? toText(value)
  }
  return toText(value)
}
