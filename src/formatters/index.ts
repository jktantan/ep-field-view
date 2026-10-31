import type { VNode, VNodeChild } from 'vue'
import { getComponentName } from '../utils/vnode'
import { isEmptyValue, toText } from '../utils/value'
import { formatCascader } from './cascader'
import { formatCheckbox, formatOptionGroup, resolveOptionGroupDisplay, resolveSingleChoiceDisplay } from './choice'
import { formatDatePicker, formatTimePicker } from './date-time'
import { formatImage, readImageSource, resolveImageDisplay } from './image'
import { formatInput, formatInputNumber } from './input'
import { resolveInputTagDisplay } from './input-tag'
import { extractOptions } from './options'
import { resolveRateDisplay } from './rate'
import { resolveSelectDisplay, formatSelect } from './select'
import { formatSegmented } from './segmented'
import { formatGeneric } from './shared'
import { formatSlider } from './slider'
import { formatSwitch } from './switch'
import { formatTransfer } from './transfer'
import { formatUpload, readUploadFiles } from './upload'
import type { CustomDisplayResolver, FormatContext, TextFormatter } from './types'

/**
 * 中文：每个组件对应的文本格式化器。新增组件时在此注册并补充对应文件。
 *
 * English: Text formatter per component. Register new components here and add
 * the corresponding file.
 */
const TEXT_FORMATTERS: Record<string, TextFormatter> = {
  ElSelect: formatSelect,
  ElSelectV2: formatSelect,
  ElTreeSelect: formatSelect,
  ElRadioGroup: formatOptionGroup,
  ElCheckboxGroup: formatOptionGroup,
  ElRadio: formatOptionGroup,
  ElRadioButton: formatOptionGroup,
  ElCheckboxButton: formatOptionGroup,
  ElCheckbox: formatCheckbox,
  ElInput: formatInput,
  ElInputNumber: formatInputNumber,
  ElInputTag: formatSimple,
  ElMention: formatSimple,
  ElAutocomplete: formatSimple,
  ElTimeSelect: formatSimple,
  ElRate: formatSimple,
  ElColorPicker: formatSimple,
  ElColorPickerPanel: formatSimple,
  ElSwitch: formatSwitch,
  ElSlider: formatSlider,
  ElSegmented: formatSegmented,
  ElDatePicker: formatDatePicker,
  ElDatePickerPanel: formatDatePicker,
  ElTimePicker: formatTimePicker,
  ElCascader: formatCascader,
  ElTransfer: formatTransfer,
  ElUpload: formatUpload,
  ElImage: formatImage
}

/**
 * 中文：每个组件对应的富内容解析器；未注册时回退到文本格式化。
 *
 * English: Rich-content resolver per component; unregistered components fall
 * back to the formatted text.
 */
const CUSTOM_DISPLAY_RESOLVERS: Record<string, CustomDisplayResolver> = {
  ElSelect: resolveSelectDisplay,
  ElSelectV2: resolveSelectDisplay,
  ElTreeSelect: resolveSelectDisplay,
  ElRadioGroup: resolveOptionGroupDisplay,
  ElCheckboxGroup: resolveOptionGroupDisplay,
  ElRadio: (_value, vnode) => resolveSingleChoiceDisplay(vnode),
  ElRadioButton: (_value, vnode) => resolveSingleChoiceDisplay(vnode),
  ElCheckboxButton: (_value, vnode) => resolveSingleChoiceDisplay(vnode),
  ElCheckbox: (_value, vnode) => resolveSingleChoiceDisplay(vnode),
  ElInputTag: resolveInputTagDisplay,
  ElRate: resolveRateDisplay,
  ElImage: resolveImageDisplay
}

/**
 * 中文：没有 model 值时可从组件自身读取的兜底值。`el-upload` 的文件列表与
 * `el-image` 的地址通常只存在于组件 props 中。
 *
 * English: Fallback values read from the component itself when the model is
 * empty. `el-upload`'s file list and `el-image`'s source usually live only in
 * component props.
 */
const COMPONENT_VALUE_FALLBACKS: Record<string, (vnode: VNode) => unknown> = {
  ElUpload: readUploadFiles,
  ElImage: readImageSource
}

/**
 * 中文：可从插槽 VNode 中识别的组件名集合，由格式化器注册表推导。
 *
 * English: Component names recognized in slot VNodes, derived from the
 * formatter registry.
 */
export const CAPTURED_COMPONENTS = new Set([...Object.keys(TEXT_FORMATTERS), ...Object.keys(CUSTOM_DISPLAY_RESOLVERS)])

/**
 * 中文：将字段值格式化为文本。空值直接返回 emptyText。
 *
 * English: Format a field value as text. Empty values return `emptyText`.
 */
export function formatFieldValue(value: unknown, vnode: VNode | null, context: FormatContext): string {
  if (isEmptyValue(value)) return context.config.emptyText
  if (!vnode) return formatGeneric(value, context)
  const name = getComponentName(vnode)
  const formatter = name ? TEXT_FORMATTERS[name] : undefined
  return formatter ? formatter(value, vnode, context) : formatGeneric(value, context)
}

/**
 * 中文：解析组件自身的富内容选中显示。没有自定义显示时返回 undefined。
 *
 * English: Resolve the component's rich selected display. Returns `undefined`
 * when the component has no custom display.
 */
export function resolveCustomDisplay(
  value: unknown,
  vnode: VNode | null,
  context: FormatContext
): VNodeChild | undefined {
  if (!vnode || isEmptyValue(value)) return undefined
  const name = getComponentName(vnode)
  const resolver = name ? CUSTOM_DISPLAY_RESOLVERS[name] : undefined
  return resolver?.(value, vnode, context)
}

/**
 * 中文：当 model 值为空时，读取组件自身的兜底值（文件列表、图片地址）。
 *
 * English: Read the component's own fallback value (file list, image source)
 * when the model value is empty.
 */
export function resolveComponentFallbackValue(vnode: VNode | null): unknown {
  const name = getComponentName(vnode)
  const reader = name ? COMPONENT_VALUE_FALLBACKS[name] : undefined
  return reader && vnode ? reader(vnode) : undefined
}

function formatSimple(value: unknown, _vnode: VNode, context: FormatContext): string {
  if (Array.isArray(value)) return value.map((item) => toText(item)).join(context.separator)
  return toText(value)
}

export { extractOptions }
export type { CustomDisplayResolver, FormatContext, TextFormatter }
