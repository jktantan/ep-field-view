<template>
  <ElFormItem :key="isText ? 'ep-field-view-text' : 'ep-field-view-edit'" ref="formItemRef" v-bind="formItemProps">
    <template v-if="isText">
      <slot name="text" :value="currentValue" :text="displayText" :options="resolvedOptions" :empty="isEmpty">
        <span
          class="ep-field-view__content"
          :class="[contentClass, { 'ep-field-view__content--empty': isEmpty }]"
          :style="contentStyle"
        >
          <component :is="ContentRenderer" v-if="hasCustomContent" />
          <template v-else>{{ displayText }}</template>
        </span>
      </slot>
    </template>
    <slot v-else />
    <template v-for="(_, name) in forwardedSlots" :key="String(name)" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}" />
    </template>
  </ElFormItem>
</template>

<script setup lang="ts">
import {
  computed,
  createTextVNode,
  getCurrentInstance,
  inject,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  ref,
  shallowRef,
  useAttrs,
  useSlots
} from 'vue'
import type { ComponentInternalInstance, Ref } from 'vue'
import { ElFormItem, formContextKey, namespaceContextKey } from 'element-plus'
import type { FormContext, FormItemInstance } from 'element-plus'
import { DEFAULT_CONFIG, DEFAULT_OPTION_PROPS } from '../constants'
import { EP_FIELD_VIEW_CONFIG_KEY } from '../config'
import type { EpFieldViewConfig, FieldViewOption, FieldViewOptionProps, TextFormItemProps } from '../types'
import {
  CAPTURED_COMPONENTS,
  extractOptions,
  formatFieldValue,
  resolveComponentFallbackValue,
  resolveCustomDisplay
} from '../formatters'
import type { FormatContext } from '../formatters/types'
import { observeFormText, readFormText } from '../utils/form-text'
import { isEmptyValue, getByPath } from '../utils/value'
import { findComponentVNode, getComponentName } from '../utils/vnode'

defineOptions({
  name: 'TextFormItem'
})

const props = withDefaults(defineProps<TextFormItemProps>(), {
  // 中文：Vue 会把未传的 Boolean prop 转为 false；保持 undefined 才能区分
  // “未传”和显式 false，从而正确继承父级表单的 text 状态。
  // English: Vue casts an absent Boolean prop to false. Keeping it undefined
  // distinguishes "not set" from explicit false when inheriting form text.
  text: undefined,
  nowrap: undefined,
  skipValidation: undefined,
  includeAffixes: undefined,
  // 中文：Boolean prop 未传时保持 undefined，避免 ElFormItem 收到 false。
  // English: Keep absent Boolean props undefined so ElFormItem does not
  // receive false.
  required: undefined,
  inlineMessage: undefined,
  showMessage: undefined
})

const instance = getCurrentInstance()
const attrs = useAttrs()
const slots = useSlots()
const formContext = inject<FormContext | undefined>(formContextKey, undefined)
const globalConfig = inject<EpFieldViewConfig>(EP_FIELD_VIEW_CONFIG_KEY, DEFAULT_CONFIG)
const namespaceRef = inject<Ref<string> | undefined>(namespaceContextKey, undefined)

/**
 * 中文：Nuxt/Nitro 可能将本包外置、同时把 Element Plus 内联，导致
 * `formContextKey` 出现两个 Symbol 实例，`inject` 拿不到 `el-form` 上下文。
 * 这里同时保留父级 `ElForm` 实例作为兜底，直接从 props 读取 model / size。
 *
 * English: Nuxt/Nitro can externalize this package while inlining Element Plus,
 * producing two `formContextKey` symbols so `inject` misses the `el-form`
 * context. Keep the parent `ElForm` instance as a fallback and read model/size
 * from its props.
 */
const parentForm = findParentForm(instance)

function parentFormProp<T>(name: string): T | undefined {
  return (parentForm?.props as Record<string, unknown> | undefined)?.[name] as T | undefined
}

/**
 * 中文：`el-config-provider` 的 namespace 会改变 Element Plus 的类名与 CSS
 * 变量前缀。这里把组件使用的变量来源重定向到 `--{namespace}-*`，CSS 侧则用
 * 类名后缀选择器匹配 form-item 元素，二者配合即可在自定义命名空间下工作。
 *
 * English: `el-config-provider`'s namespace changes Element Plus class names
 * and CSS variable prefixes. These sources are redirected to `--{namespace}-*`;
 * the CSS matches form-item elements by class suffix, so custom namespaces work.
 */
const NAMESPACE_SOURCE_VARIABLES: Record<string, string> = {
  '--ep-field-view-source-color': 'text-color-regular',
  '--ep-field-view-source-empty-color': 'text-color-placeholder',
  '--ep-field-view-source-font-size': 'font-size-base',
  '--ep-field-view-source-font-size-small': 'font-size-small',
  '--ep-field-view-source-font-size-extra-small': 'font-size-extra-small',
  '--ep-field-view-source-component-size': 'component-size',
  '--ep-field-view-source-component-size-large': 'component-size-large',
  '--ep-field-view-source-component-size-small': 'component-size-small',
  '--ep-field-view-source-text-color-primary': 'text-color-primary',
  '--ep-field-view-source-text-color-secondary': 'text-color-secondary',
  '--ep-field-view-source-text-color-disabled': 'text-color-disabled',
  '--ep-field-view-source-fill-color-light': 'fill-color-light',
  '--ep-field-view-source-border-color-lighter': 'border-color-lighter'
}

const namespaceStyle = computed<Record<string, string> | undefined>(() => {
  const namespace = namespaceRef?.value || 'el'
  if (namespace === 'el') return undefined
  const style: Record<string, string> = {}
  for (const [name, token] of Object.entries(NAMESPACE_SOURCE_VARIABLES)) {
    // 中文：回退到 `--el-*`，兼容只改类名、未重新编译主题变量的项目。
    // English: Fall back to `--el-*` for projects that only rename classes.
    style[name] = `var(--${namespace}-${token}, var(--el-${token}))`
  }
  return style
})

const formItemRef = ref<FormItemInstance>()

/**
 * 中文：转发给内部 `ElFormItem` 的插槽（`label`、`error` 等）。
 *
 * English: Slots forwarded to the underlying `ElFormItem`.
 */
const forwardedSlots = computed(() => {
  const result: Record<string, unknown> = {}
  for (const [name, slot] of Object.entries(slots)) {
    if (name !== 'default' && name !== 'text') result[name] = slot
  }
  return result
})

/**
 * 中文：插槽 VNode 不是响应式的。每次更新递增 revision，让格式化 computed
 * 能感知父组件的选项变化（例如异步加载的下拉选项），无需轮询。
 *
 * English: Slot VNodes are not reactive. Bumping a revision on every update
 * keeps computed formatters in sync with parent option changes without polling.
 */
const revision = shallowRef(0)
onBeforeUpdate(() => {
  revision.value += 1
})

function setting<K extends keyof EpFieldViewConfig>(
  key: K,
  override: EpFieldViewConfig[K] | undefined
): EpFieldViewConfig[K] {
  if (override !== undefined) return override
  return globalConfig[key] ?? DEFAULT_CONFIG[key]
}

const emptyText = computed(() => setting('emptyText', props.emptyText))
const separator = computed(() => setting('separator', props.separator))
const rangeSeparator = computed(() => setting('rangeSeparator', props.rangeSeparator))
const dateFormat = computed(() => setting('dateFormat', props.dateFormat))
const timeFormat = computed(() => setting('timeFormat', props.timeFormat))
const theme = computed(() => setting('theme', props.theme))
const shouldSkipValidation = computed(() => setting('skipValidation', props.skipValidation))
const includeAffixes = computed(() => setting('includeAffixes', props.includeAffixes))
const rateMode = computed(() => setting('rateMode', props.rateMode))
const inputTagMode = computed(() => setting('inputTagMode', props.inputTagMode))
const imageMode = computed(() => setting('imageMode', props.imageMode))

/**
 * 中文：匹配父级表单 / 表单项的尺寸，让文本内容同步缩放。
 *
 * English: Match the surrounding form / form-item size so text scales with it.
 */
const size = computed<'large' | 'default' | 'small'>(() => {
  // 中文：size 已声明为 prop，因此是响应式的；未传时回退到表单上下文。
  // English: `size` is a declared, reactive prop; fall back to the form
  // context when absent.
  const raw = props.size || (formContext?.size ?? parentFormProp<string>('size'))
  if (raw === 'large' || raw === 'small') return raw
  return 'default'
})

const optionProps = computed<Required<FieldViewOptionProps>>(() => ({
  ...DEFAULT_OPTION_PROPS,
  ...globalConfig.optionProps,
  ...props.optionProps
}))

const mergedConfig = computed<EpFieldViewConfig>(() => ({
  ...DEFAULT_CONFIG,
  ...globalConfig,
  emptyText: emptyText.value,
  separator: separator.value,
  rangeSeparator: rangeSeparator.value,
  dateFormat: dateFormat.value,
  timeFormat: timeFormat.value,
  theme: theme.value,
  skipValidation: shouldSkipValidation.value,
  optionProps: optionProps.value,
  includeAffixes: includeAffixes.value,
  rateMode: rateMode.value,
  inputTagMode: inputTagMode.value,
  imageMode: imageMode.value
}))

function findParentForm(target: ComponentInternalInstance | null | undefined): ComponentInternalInstance | null {
  let current = target?.parent ?? null
  while (current) {
    const type = current.type as { name?: string; __name?: string } | null
    const name = type?.name ?? type?.__name
    if (name === 'ElForm') return current
    current = current.parent
  }
  return null
}

/**
 * 中文：`el-form` 没有原生 `text` 模式，这里使用扩展属性 `text`（未声明为
 * form prop，因此进入 attrs）。Vue attrs 非响应式，用 MutationObserver 保持
 * 运行时同步。Element Plus 原生 `readonly` 是独立状态，刻意不用于触发文本模式。
 *
 * English: `el-form` has no native `text` mode, so we use an extension attribute
 * (`text`) that lands in attrs. Attrs are not reactive, so a MutationObserver
 * keeps it in sync. Native `readonly` is separate and deliberately not used.
 */
const formText = ref(readFormText(parentForm?.attrs))

let stopObservingForm: (() => void) | undefined

onMounted(() => {
  formText.value = readFormText(parentForm?.attrs)
  stopObservingForm = observeFormText(parentForm?.proxy?.$el as Element | null | undefined, () => {
    formText.value = readFormText(parentForm?.attrs)
  })
})

onBeforeUnmount(() => {
  stopObservingForm?.()
})

const isText = computed(() => props.text ?? formText.value)

function findParentName(names: Set<string>): string | undefined {
  let current = instance?.parent ?? null
  while (current) {
    const type = current.type as { name?: string; __name?: string } | null
    const name = type?.name ?? type?.__name
    if (name && names.has(name)) return name
    current = current.parent
  }
  return undefined
}

const isInTable = Boolean(findParentName(new Set(['ElTable', 'ElTableBody', 'ElTableRow'])))
const nowrap = computed(() => props.nowrap ?? (isInTable && mergedConfig.value.nowrapInTable))

const formVNode = computed(() => {
  // 中文：读取 revision，父组件更新后重新检查插槽 VNode。
  // English: Read revision so slot VNodes are re-inspected after parent updates.
  void revision.value
  const defaultSlot = slots.default
  if (!defaultSlot) return null
  return findComponentVNode(defaultSlot(), CAPTURED_COMPONENTS)
})

const hasValueProp = computed(() => {
  // 中文：依赖 value，以感知显式 undefined 到有值的变化。
  // English: Depend on value so an explicit undefined -> value transition is seen.
  void props.value
  const vnodeProps = instance?.vnode.props
  return Boolean(vnodeProps && 'value' in vnodeProps)
})

/**
 * 中文：优先使用 `el-form` 的注入上下文；在 Nuxt SSR 等外置场景下回退到
 * 父级 `ElForm` 实例的 `model` prop。
 *
 * English: Prefer the injected `el-form` context; fall back to the parent
 * `ElForm` instance's `model` prop when externalized (Nuxt SSR).
 */
const formModel = computed(() => formContext?.model ?? parentFormProp<unknown>('model'))

/**
 * 中文：`prop` 可能是字符串或路径段数组；数组形式以点号连接后用于
 * formatter 上下文（`FieldViewFormatterContext.prop` 保持字符串）。
 *
 * English: `prop` can be a string or an array of path segments. The array form
 * is joined with dots for the formatter context
 * (`FieldViewFormatterContext.prop` stays a string).
 */
const propPath = computed(() => (Array.isArray(props.prop) ? props.prop.join('.') : props.prop))

const hasPropPath = computed(() => (Array.isArray(props.prop) ? props.prop.length > 0 : Boolean(props.prop)))

const currentValue = computed(() => {
  const raw = hasValueProp.value ? props.value : getByPath(formModel.value, props.prop)
  if (!isEmptyValue(raw)) return raw
  // 中文：上传文件列表与图片地址通常不在 model 中，回退到组件自身 props。
  // English: Upload file lists and image sources often live outside the model,
  // so fall back to the component's own props.
  const fallback = resolveComponentFallbackValue(formVNode.value)
  return isEmptyValue(fallback) ? raw : fallback
})

const resolvedOptions = computed<FieldViewOption[]>(() =>
  props.options ? props.options : extractOptions(formVNode.value, optionProps.value)
)

const formatContext = computed<FormatContext>(() => ({
  config: mergedConfig.value,
  separator: separator.value,
  rangeSeparator: rangeSeparator.value,
  dateFormat: dateFormat.value,
  timeFormat: timeFormat.value,
  optionProps: optionProps.value,
  includeAffixes: includeAffixes.value,
  rateMode: rateMode.value,
  inputTagMode: inputTagMode.value,
  imageMode: imageMode.value
}))

const displayText = computed(() => {
  const value = currentValue.value
  const vnode = formVNode.value
  if (props.formatter) {
    const result = props.formatter(value, {
      prop: propPath.value,
      value,
      componentName: getComponentName(vnode),
      options: resolvedOptions.value,
      separator: separator.value
    })
    if (result === null || result === undefined) return emptyText.value
    return String(result)
  }
  return formatFieldValue(value, vnode, formatContext.value)
})

/**
 * 中文：组件自身选中值插槽提供的富内容（如 `el-select` 的 `#label`、radio
 * 的自定义内容）。渲染原始 VNode，保证文本模式与组件最终显示一致。
 *
 * English: Rich content from the component's selected-value slots (for example
 * `el-select`'s `#label`). Rendering the original VNodes keeps text mode
 * identical to the component.
 */
const customContent = computed(() => {
  void revision.value
  if (props.formatter || !isText.value) return undefined
  return resolveCustomDisplay(currentValue.value, formVNode.value, formatContext.value)
})

const hasCustomContent = computed(() => {
  const content = customContent.value
  if (Array.isArray(content)) return content.length > 0
  return content !== undefined && content !== null && content !== ''
})

const ContentRenderer = () => {
  const content = customContent.value
  return typeof content === 'string' || typeof content === 'number' ? createTextVNode(String(content)) : content
}

const isEmpty = computed(() => isEmptyValue(currentValue.value))

/**
 * 中文：这些属性已声明为 props，不会再进入 `attrs`，必须显式转发给
 * 内部 `ElFormItem`。
 *
 * English: These are declared props, so they no longer appear in `attrs`;
 * forward them to the inner `ElFormItem` explicitly.
 */
const FORM_ITEM_PROP_KEYS = [
  'label',
  'labelWidth',
  'labelPosition',
  'required',
  'rules',
  'error',
  'validateStatus',
  'for',
  'inlineMessage',
  'showMessage',
  'size'
] as const satisfies readonly (keyof TextFormItemProps)[]

const formItemProps = computed<Record<string, unknown>>(() => {
  const { class: attrClass, style: attrStyle, ...rest } = attrs
  const classNames: unknown[] = ['ep-field-view']
  if (theme.value) classNames.push(`ep-field-view--theme-${theme.value}`)
  if (size.value !== 'default') classNames.push(`ep-field-view--size-${size.value}`)
  if (nowrap.value) classNames.push('ep-field-view--nowrap')
  if (isText.value) classNames.push('ep-field-view--text')
  if (attrClass) classNames.push(attrClass)

  const result: Record<string, unknown> = { ...rest, class: classNames }

  // 中文：显式转发已声明为 props 的 ElFormItem 属性。
  // English: Forward ElFormItem props that are now declared on this component.
  for (const key of FORM_ITEM_PROP_KEYS) {
    const value = props[key]
    if (value !== undefined) result[key] = value
  }

  const styleParts: unknown[] = []
  if (namespaceStyle.value) styleParts.push(namespaceStyle.value)
  if (attrStyle !== undefined) styleParts.push(attrStyle)
  if (isInTable) styleParts.push({ marginBottom: '0' })
  if (styleParts.length === 1) result.style = styleParts[0]
  else if (styleParts.length > 1) result.style = styleParts

  const skip = isText.value && shouldSkipValidation.value
  if (hasPropPath.value && !skip) result.prop = props.prop
  else delete result.prop

  if (skip) {
    // 中文：空 rules 数组阻止 item / form 规则运行，同时保持组件挂载。
    // English: An empty rules array prevents item and form rules from running.
    result.rules = []
    result.required = false
  }

  if (!result.label && !slots.label && result.labelWidth === undefined) {
    result.labelWidth = 'auto'
  }

  return result
})

defineExpose({
  formItemRef,
  value: currentValue,
  displayText,
  isText,
  options: resolvedOptions
})
</script>
