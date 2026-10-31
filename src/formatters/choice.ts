import { Comment, Fragment, Text, isVNode } from 'vue'
import type { VNode, VNodeChild } from 'vue'
import type { FieldViewOption } from '../types'
import { getDefaultSlotVNode, getVNodeProp } from '../utils/vnode'
import { extractOptions, findOptionVNode } from './options'
import { findOptionLabel, formatGeneric } from './shared'
import type { FormatContext } from './types'

/**
 * 中文：格式化单选组 / 多选组 / 独立选项的文本。
 *
 * English: Format radio groups, checkbox groups and standalone choices.
 */
export function formatOptionGroup(value: unknown, vnode: VNode, context: FormatContext): string {
  return formatOptionValue(value, extractOptions(vnode, context.optionProps), context)
}

/**
 * 中文：格式化单个复选框；支持 true-label / false-label。
 *
 * English: Format a single checkbox, including `true-label` / `false-label`.
 */
export function formatCheckbox(value: unknown, vnode: VNode, context: FormatContext): string {
  const trueLabel = getVNodeProp(vnode, 'trueLabel', 'true-label', 'trueValue', 'true-value')
  const falseLabel = getVNodeProp(vnode, 'falseLabel', 'false-label', 'falseValue', 'false-value')
  if (typeof value === 'boolean' && (trueLabel !== undefined || falseLabel !== undefined)) {
    return value ? String(trueLabel ?? '是') : String(falseLabel ?? '否')
  }
  const options = extractOptions(vnode, context.optionProps)
  if (options.length > 0) return formatOptionValue(value, options, context)
  return formatGeneric(value, context)
}

/**
 * 中文：解析单选组 / 多选组选中项的自定义内容 VNode。
 *
 * English: Resolve custom VNodes for selected radio / checkbox group items.
 */
export function resolveOptionGroupDisplay(
  value: unknown,
  vnode: VNode,
  context: FormatContext
): VNodeChild | undefined {
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

/**
 * 中文：解析单个 radio / checkbox 的自定义默认插槽内容。
 *
 * English: Resolve the custom default-slot content of a single radio /
 * checkbox.
 */
export function resolveSingleChoiceDisplay(vnode: VNode): VNodeChild | undefined {
  return getDefaultSlotVNode(vnode)
}

function formatOptionValue(value: unknown, options: FieldViewOption[], context: FormatContext): string {
  if (Array.isArray(value)) {
    return value.map((item) => findOptionLabel(options, item) ?? formatGeneric(item, context)).join(context.separator)
  }
  return findOptionLabel(options, value) ?? formatGeneric(value, context)
}

function resolveOptionValueDisplay(value: unknown, vnode: VNode): VNodeChild | undefined {
  const optionVNode = findOptionVNode(vnode, value)
  if (!optionVNode) return undefined
  const content = getDefaultSlotVNode(optionVNode)
  // 中文：纯文本走格式化字符串；只有富内容才渲染 VNode。
  // English: Plain text uses the formatted string; only rich content uses VNodes.
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
