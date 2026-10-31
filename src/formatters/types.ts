import type { VNode, VNodeChild } from 'vue'
import type { EpFieldViewConfig, FieldViewOptionProps, ImageMode, InputTagMode, RateMode } from '../types'

/**
 * 中文：格式化器运行时上下文，包含分隔符、日期格式、选项映射与评分显示方式。
 *
 * English: Runtime context for formatters: separators, date formats, option
 * key mapping and the rate display mode.
 */
export interface FormatContext {
  config: EpFieldViewConfig
  separator: string
  rangeSeparator: string
  dateFormat: string
  timeFormat: string
  optionProps: Required<FieldViewOptionProps>
  includeAffixes: boolean
  rateMode: RateMode
  inputTagMode: InputTagMode
  imageMode: ImageMode
}

/**
 * 中文：将组件值格式化为文本。
 *
 * English: Format a component value as plain text.
 */
export type TextFormatter = (value: unknown, vnode: VNode, context: FormatContext) => string

/**
 * 中文：将组件自身的选中显示解析为 VNode；返回 undefined 时回退到文本。
 *
 * English: Resolve the component's own selected display as VNodes. Returning
 * `undefined` falls back to the formatted text.
 */
export type CustomDisplayResolver = (value: unknown, vnode: VNode, context: FormatContext) => VNodeChild | undefined
