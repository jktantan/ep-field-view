import type { InjectionKey, StyleValue } from 'vue'

/**
 * A single option used by select-like components.
 */
export interface FieldViewOption {
  label?: string | number
  value?: unknown
  [key: string]: unknown
}

/**
 * Mapping between option object keys and the keys used by the component.
 */
export interface FieldViewOptionProps {
  label?: string
  value?: string
  children?: string
  disabled?: string
}

/**
 * Context handed to a custom `formatter`.
 */
export interface FieldViewFormatterContext {
  prop?: string
  value: unknown
  componentName?: string
  options: FieldViewOption[]
}

/**
 * Customises how a value is rendered in read-only mode.
 *
 * Return `null` or `undefined` to fall back to the configured `emptyText`.
 * For rich content (links, tags, images, ...) use the `readonly` slot instead.
 */
export type FieldViewFormatter = (
  value: unknown,
  context: FieldViewFormatterContext
) => string | number | null | undefined

/**
 * Global configuration registered through `app.use(EpFieldView, options)`.
 */
export interface EpFieldViewConfig {
  /** Text shown for empty values. */
  emptyText: string
  /** Separator used when joining multiple values. */
  separator: string
  /** Separator used for range values (date/time range, slider). */
  rangeSeparator: string
  /**
   * Date format used by date pickers. When empty, the component's `format`
   * prop or the built-in format for the picker type is used.
   */
  dateFormat: string
  /**
   * Time format used by time pickers. When empty, the component's `format`
   * prop or `HH:mm:ss` is used.
   */
  timeFormat: string
  /** Text used by switch components for the active state. */
  activeText: string
  /** Text used by switch components for the inactive state. */
  inactiveText: string
  /** Built-in theme name (`compact`, `bold`) or a custom one. */
  theme: string
  /** Skip form validation while the item is read-only. */
  skipValidation: boolean
  /** Truncate long content with an ellipsis when the item lives in a table. */
  nowrapInTable: boolean
  /** Key mapping used when reading option objects. */
  optionProps: FieldViewOptionProps
  /** Include text from input prefix/prepend/append/suffix slots. */
  includeAffixes: boolean
}

export type EpFieldViewOptions = Partial<EpFieldViewConfig>

/**
 * Props of `<ReadonlyFormItem>`.
 *
 * Every other `el-form-item` prop (`label`, `label-width`, `required`,
 * `rules`, `error`, ...) is forwarded to the underlying `ElFormItem`, as are
 * its slots except `default` and `readonly`.
 */
export interface ReadonlyFormItemProps {
  /** Field path in the parent form model. */
  prop?: string
  /** Explicit value. Takes precedence over the value read from the form model. */
  value?: unknown
  /** Force read-only or editable mode. Falls back to the parent form's `readonly` attr. */
  readonly?: boolean
  emptyText?: string
  separator?: string
  rangeSeparator?: string
  dateFormat?: string
  timeFormat?: string
  /** Custom formatter for the read-only value. */
  formatter?: FieldViewFormatter
  /** Explicit options, bypassing the options discovered in the default slot. */
  options?: FieldViewOption[]
  /** Key mapping used when reading `options` objects. */
  optionProps?: FieldViewOptionProps
  /** Include text from input prefix/prepend/append/suffix slots. Defaults to `true`. */
  includeAffixes?: boolean
  /** Truncate with an ellipsis. Defaults to `true` inside `el-table`. */
  nowrap?: boolean
  /** Skip validation while read-only. Defaults to `true`. */
  skipValidation?: boolean
  /** Theme name appended as `ep-field-view--theme-{name}`. */
  theme?: string
  /** Extra class applied to the read-only content element. */
  contentClass?: string | string[] | Record<string, boolean>
  /** Inline style applied to the read-only content element. */
  contentStyle?: StyleValue
}

export type EpFieldViewConfigKey = InjectionKey<EpFieldViewConfig>
