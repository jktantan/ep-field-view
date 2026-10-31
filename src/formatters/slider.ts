import type { VNode } from 'vue'
import { toText } from '../utils/value'
import type { FormatContext } from './types'

/**
 * 中文：格式化滑块值，范围使用 rangeSeparator。
 *
 * English: Format a slider value; ranges use `rangeSeparator`.
 */
export function formatSlider(value: unknown, _vnode: VNode, context: FormatContext): string {
  if (Array.isArray(value)) return value.map((item) => toText(item)).join(context.rangeSeparator)
  return toText(value)
}
