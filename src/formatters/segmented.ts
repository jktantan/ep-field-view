import type { VNode } from 'vue'
import { extractOptions } from './options'
import { findOptionLabel, formatGeneric } from './shared'
import type { FormatContext } from './types'

/**
 * 中文：格式化分段控制器的选中项。
 *
 * English: Format the selected item of an `el-segmented`.
 */
export function formatSegmented(value: unknown, vnode: VNode, context: FormatContext): string {
  return findOptionLabel(extractOptions(vnode, context.optionProps), value) ?? formatGeneric(value, context)
}
