import type { VNode } from 'vue'
import { getVNodeProp } from '../utils/vnode'
import { formatGeneric } from './shared'
import type { FormatContext } from './types'

/**
 * 中文：格式化开关的激活 / 关闭文案。
 *
 * English: Format the active / inactive text of a switch.
 */
export function formatSwitch(value: unknown, vnode: VNode, context: FormatContext): string {
  const activeValue = getVNodeProp(vnode, 'activeValue', 'active-value') ?? true
  const inactiveValue = getVNodeProp(vnode, 'inactiveValue', 'inactive-value') ?? false
  const activeText =
    (getVNodeProp(vnode, 'activeText', 'active-text') as string | undefined) || context.config.activeText
  const inactiveText =
    (getVNodeProp(vnode, 'inactiveText', 'inactive-text') as string | undefined) || context.config.inactiveText
  if (Object.is(value, activeValue) || String(value) === String(activeValue)) return activeText
  if (Object.is(value, inactiveValue) || String(value) === String(inactiveValue)) return inactiveText
  return formatGeneric(value, context)
}
