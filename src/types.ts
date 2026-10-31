import type { InjectionKey, StyleValue } from 'vue'

/**
 * 中文：一个选项对象，供选择类组件使用。
 *
 * English: A single option used by select-like components.
 */
export interface FieldViewOption {
  label?: string | number
  value?: unknown
  [key: string]: unknown
}

/**
 * 中文：选项对象字段与组件字段之间的映射。
 *
 * English: Mapping between option object keys and component keys.
 */
export interface FieldViewOptionProps {
  label?: string
  value?: string
  children?: string
  disabled?: string
}

/**
 * 中文：自定义 `formatter` 的上下文。
 *
 * English: Context handed to a custom `formatter`.
 */
export interface FieldViewFormatterContext {
  prop?: string
  value: unknown
  componentName?: string
  options: FieldViewOption[]
  /**
   * 中文：当前多值分隔符，与 `TextFormItem` 的 `separator` 一致。
   *
   * English: The active multiple-value separator, matching `TextFormItem`'s
   * `separator`.
   */
  separator: string
}

/**
 * 中文：文本模式下的自定义文本格式化函数。
 *
 * 返回 `null` 或 `undefined` 时回退到 `emptyText`；富内容请使用 `text` 插槽。
 *
 * English: Customises how a value is rendered in text mode.
 *
 * Return `null` or `undefined` to fall back to `emptyText`. For rich content
 * (links, tags, images, ...) use the `text` slot instead.
 */
export type FieldViewFormatter = (
  value: unknown,
  context: FieldViewFormatterContext
) => string | number | null | undefined

/**
 * 中文：评分的显示方式。`text` 显示分数，`rate` 渲染禁用状态的 `el-rate`。
 *
 * English: How `el-rate` is displayed. `text` shows the score, `rate` renders a
 * disabled `el-rate` (preserving custom icons/images).
 */
export type RateMode = 'text' | 'rate'

/**
 * 中文：`el-input-tag` 的文本模式展示方式。`text` 显示分隔符文本，
 * `tag` 渲染只读 `el-tag`。
 *
 * English: How `el-input-tag` is displayed in text mode. `text` shows
 * separator-joined text; `tag` renders readonly `el-tag`s.
 */
export type InputTagMode = 'text' | 'tag'

/**
 * 中文：`el-image` 的文本模式展示方式。`text` 显示图片地址，
 * `image` 渲染只读的 `el-image`（保留预览）。
 *
 * English: How `el-image` is displayed in text mode. `text` shows the image
 * URL; `image` renders readonly `el-image`s with preview support.
 */
export type ImageMode = 'text' | 'image'

/**
 * 中文：通过 `app.use(EpFieldView, options)` 注册的全局配置。
 *
 * English: Global configuration registered through `app.use(EpFieldView, options)`.
 */
export interface EpFieldViewConfig {
  /**
   * 中文：空值文案。
   *
   * English: Text shown for empty values.
   */
  emptyText: string
  /**
   * 中文：多值分隔符，默认 `;`。
   *
   * English: Separator used when joining multiple values. Defaults to `;`.
   */
  separator: string
  /**
   * 中文：范围值分隔符（日期/时间范围、滑块）。
   *
   * English: Separator used for range values (date/time range, slider).
   */
  rangeSeparator: string
  /**
   * 中文：日期格式；为空时使用组件的 `format` 或内置格式。
   *
   * English: Date format. When empty, the component's `format` prop or the
   * built-in format for the picker type is used.
   */
  dateFormat: string
  /**
   * 中文：时间格式；为空时使用组件的 `format` 或 `HH:mm:ss`。
   *
   * English: Time format. When empty, the component's `format` prop or
   * `HH:mm:ss` is used.
   */
  timeFormat: string
  /**
   * 中文：开关激活状态文案。
   *
   * English: Text used by switch components for the active state.
   */
  activeText: string
  /**
   * 中文：开关关闭状态文案。
   *
   * English: Text used by switch components for the inactive state.
   */
  inactiveText: string
  /**
   * 中文：内置主题名（`compact`、`bold`）或自定义主题名。
   *
   * English: Built-in theme name (`compact`, `bold`) or a custom one.
   */
  theme: string
  /**
   * 中文：文本模式是否跳过表单校验。
   *
   * English: Skip form validation while the item is in text mode.
   */
  skipValidation: boolean
  /**
   * 中文：在表格内是否用省略号截断长内容。
   *
   * English: Truncate long content with an ellipsis inside a table.
   */
  nowrapInTable: boolean
  /**
   * 中文：读取选项对象时使用的字段映射。
   *
   * English: Key mapping used when reading option objects.
   */
  optionProps: FieldViewOptionProps
  /**
   * 中文：是否拼接输入框的 prefix/prepend/append/suffix 插槽文本。
   *
   * English: Include text from input prefix/prepend/append/suffix slots.
   */
  includeAffixes: boolean
  /**
   * 中文：评分显示方式，默认 `text`。
   *
   * English: How `el-rate` is rendered in text mode.
   */
  rateMode: RateMode
  /**
   * 中文：`el-input-tag` 的展示方式，默认 `text`。
   *
   * English: How `el-input-tag` is rendered in text mode.
   */
  inputTagMode: InputTagMode
  /**
   * 中文：`el-image` 的展示方式，默认 `text`（地址文本）。
   *
   * English: How `el-image` is rendered in text mode. Defaults to `text`
   * (the URL).
   */
  imageMode: ImageMode
}

export type EpFieldViewOptions = Partial<EpFieldViewConfig>

/**
 * 中文：`<TextFormItem>` 的 props。
 *
 * Element Plus 原生有 `disabled` 与 `readonly`；本组件的 `text` 是第三种独立状态。
 * 其他 `el-form-item` 属性与插槽（`label`、`error` 等）会原样透传。
 *
 * English: Props of `<TextFormItem>`.
 *
 * Element Plus has native `disabled` and `readonly`; this component's `text`
 * mode is a third, independent state. Other `el-form-item` props and slots are
 * forwarded unchanged.
 */
export interface TextFormItemProps {
  /**
   * 中文：父级表单 model 中的字段路径。
   *
   * English: Field path in the parent form model.
   */
  prop?: string
  /**
   * 中文：显式值，优先于 model 中的值。
   *
   * English: Explicit value. Takes precedence over the form model.
   */
  value?: unknown
  /**
   * 中文：文本模式；不传时继承父级 `el-form` 的 `text` 属性。
   *
   * English: Render as plain text. Falls back to the parent form's `text`
   * attribute, then to `false` (edit mode).
   */
  text?: boolean
  /**
   * 中文：空值文案。
   *
   * English: Text shown for empty values.
   */
  emptyText?: string
  /**
   * 中文：多值分隔符。
   *
   * English: Separator used when joining multiple values.
   */
  separator?: string
  /**
   * 中文：范围值分隔符。
   *
   * English: Separator used for range values.
   */
  rangeSeparator?: string
  /**
   * 中文：日期格式。
   *
   * English: Date format.
   */
  dateFormat?: string
  /**
   * 中文：时间格式。
   *
   * English: Time format.
   */
  timeFormat?: string
  /**
   * 中文：自定义文本格式化函数。
   *
   * English: Custom formatter for the text value.
   */
  formatter?: FieldViewFormatter
  /**
   * 中文：显式选项，绕过插槽解析。
   *
   * English: Explicit options, bypassing the default slot.
   */
  options?: FieldViewOption[]
  /**
   * 中文：选项字段映射。
   *
   * English: Key mapping used when reading `options` objects.
   */
  optionProps?: FieldViewOptionProps
  /**
   * 中文：是否拼接输入框前后缀插槽文本，默认 `true`。
   *
   * English: Include input affix slot text. Defaults to `true`.
   */
  includeAffixes?: boolean
  /**
   * 中文：表格内是否单行省略。
   *
   * English: Truncate with an ellipsis. Defaults to `true` inside `el-table`.
   */
  nowrap?: boolean
  /**
   * 中文：文本模式是否跳过校验，默认 `true`。
   *
   * English: Skip validation in text mode. Defaults to `true`.
   */
  skipValidation?: boolean
  /**
   * 中文：评分显示方式，默认 `text`。
   *
   * English: How `el-rate` is rendered in text mode. Defaults to `text`.
   */
  rateMode?: RateMode
  /**
   * 中文：`el-input-tag` 的展示方式，默认 `text`。
   *
   * English: How `el-input-tag` is rendered in text mode. Defaults to `text`.
   */
  inputTagMode?: InputTagMode
  /**
   * 中文：`el-image` 的展示方式，默认 `text`。
   *
   * English: How `el-image` is rendered in text mode. Defaults to `text`.
   */
  imageMode?: ImageMode
  /**
   * 中文：主题名，添加 `ep-field-view--theme-{name}` 类。
   *
   * English: Theme name appended as `ep-field-view--theme-{name}`.
   */
  theme?: string
  /**
   * 中文：文本内容元素的额外类名。
   *
   * English: Extra class applied to the text content element.
   */
  contentClass?: string | string[] | Record<string, boolean>
  /**
   * 中文：文本内容元素的内联样式。
   *
   * English: Inline style applied to the text content element.
   */
  contentStyle?: StyleValue
}

export type EpFieldViewConfigKey = InjectionKey<EpFieldViewConfig>
