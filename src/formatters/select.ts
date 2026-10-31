import type { VNode, VNodeChild } from 'vue'
import type { FieldViewOption } from '../types'
import { getNamedSlotText, getNamedSlotVNode } from '../utils/vnode'
import { extractOptions } from './options'
import { findOptionLabel, formatGeneric } from './shared'
import type { FormatContext } from './types'

/**
 * 中文：格式化 el-select / el-select-v2 / el-tree-select 的选中值文本。
 *
 * English: Format the selected value of `el-select`, `el-select-v2` and
 * `el-tree-select`.
 */
export function formatSelect(value: unknown, vnode: VNode, context: FormatContext): string {
  const options = extractOptions(vnode, context.optionProps)
  if (Array.isArray(value)) {
    return value.map((item, index) => formatSelectValue(item, index, vnode, options, context)).join(context.separator)
  }
  return formatSelectValue(value, 0, vnode, options, context)
}

/**
 * 中文：解析 el-select 的富内容选中显示（`#label` 插槽）。
 *
 * English: Resolve the rich selected display of `el-select` from its `#label`
 * slot. `el-option`'s label slot only affects the dropdown and is ignored.
 */
export function resolveSelectDisplay(value: unknown, vnode: VNode, context: FormatContext): VNodeChild | undefined {
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

function formatSelectValue(
  value: unknown,
  index: number,
  vnode: VNode,
  options: FieldViewOption[],
  context: FormatContext
): string {
  const label = findOptionLabel(options, value) ?? formatGeneric(value, context)
  // 中文：`#label` 插槽优先于 option label。
  // English: The `#label` slot wins over the option label.
  const custom = getNamedSlotText(vnode, 'label', { index, label, value, selected: true })
  return custom || label
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
