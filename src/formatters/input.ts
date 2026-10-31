import type { VNode } from 'vue'
import { getNamedSlotText, getVNodeProp } from '../utils/vnode'
import { formatGeneric } from './shared'
import type { FormatContext } from './types'

/**
 * 中文：格式化输入框文本，并按配置拼接 prefix / prepend / append / suffix。
 *
 * English: Format an input value and optionally append its prefix, prepend,
 * append and suffix slot text.
 */
export function formatInput(value: unknown, vnode: VNode, context: FormatContext): string {
  const text = Array.isArray(value)
    ? value.map((item) => formatGeneric(item, context)).join(context.separator)
    : formatGeneric(value, context)
  if (!context.includeAffixes) return text
  return [
    getNamedSlotText(vnode, 'prefix'),
    getNamedSlotText(vnode, 'prepend'),
    text,
    getNamedSlotText(vnode, 'append'),
    getNamedSlotText(vnode, 'suffix')
  ].join('')
}

/**
 * 中文：优先使用 el-input-number 自身的 formatter。
 *
 * English: Prefer the `formatter` provided by `el-input-number`.
 */
export function formatInputNumber(value: unknown, vnode: VNode, context: FormatContext): string {
  const formatter = getVNodeProp(vnode, 'formatter')
  if (typeof formatter === 'function') {
    try {
      const result = (formatter as (val: unknown, info: { userInput: string | null }) => unknown)(value, {
        userInput: null
      })
      if (result !== null && result !== undefined && result !== '') return String(result)
    } catch {
      // 中文：formatter 抛错时回退原值。
      // English: Fall back to the raw value when it throws.
    }
  }
  return formatGeneric(value, context)
}
