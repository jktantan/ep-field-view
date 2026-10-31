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
import type { ComponentInternalInstance } from 'vue'
import { ElFormItem, formContextKey } from 'element-plus'
import type { FormContext, FormItemInstance } from 'element-plus'
import { DEFAULT_CONFIG, DEFAULT_OPTION_PROPS } from '../constants'
import { EP_FIELD_VIEW_CONFIG_KEY } from '../config'
import type { EpFieldViewConfig, FieldViewOption, FieldViewOptionProps, TextFormItemProps } from '../types'
import { CAPTURED_COMPONENTS, extractOptions, formatFieldValue, resolveCustomDisplay } from '../formatters'
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
  includeAffixes: undefined
})

const instance = getCurrentInstance()
const attrs = useAttrs()
const slots = useSlots()
const formContext = inject<FormContext | undefined>(formContextKey, undefined)
const globalConfig = inject<EpFieldViewConfig>(EP_FIELD_VIEW_CONFIG_KEY, DEFAULT_CONFIG)

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

/**
 * 中文：匹配父级表单 / 表单项的尺寸，让文本内容同步缩放。
 *
 * English: Match the surrounding form / form-item size so text scales with it.
 */
const size = computed<'large' | 'default' | 'small'>(() => {
  // 中文：attrs 非响应式，读取 revision 以刷新单字段 size 覆盖。
  // English: attrs is not reactive; reading revision refreshes an overridden size.
  void revision.value
  const attrSize = attrs.size
  const raw = typeof attrSize === 'string' && attrSize ? attrSize : formContext?.size
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
  rateMode: rateMode.value
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

const parentForm = findParentForm(instance)

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

const currentValue = computed(() => (hasValueProp.value ? props.value : getByPath(formContext?.model, props.prop)))

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
  rateMode: rateMode.value
}))

const displayText = computed(() => {
  const value = currentValue.value
  const vnode = formVNode.value
  if (props.formatter) {
    const result = props.formatter(value, {
      prop: props.prop,
      value,
      componentName: getComponentName(vnode),
      options: resolvedOptions.value
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

const formItemProps = computed<Record<string, unknown>>(() => {
  const { class: attrClass, style: attrStyle, ...rest } = attrs
  const classNames: unknown[] = ['ep-field-view']
  if (theme.value) classNames.push(`ep-field-view--theme-${theme.value}`)
  if (size.value !== 'default') classNames.push(`ep-field-view--size-${size.value}`)
  if (nowrap.value) classNames.push('ep-field-view--nowrap')
  if (isText.value) classNames.push('ep-field-view--text')
  if (attrClass) classNames.push(attrClass)

  const result: Record<string, unknown> = { ...rest, class: classNames }

  if (attrStyle !== undefined) result.style = attrStyle
  if (isInTable) {
    result.style = [attrStyle, { marginBottom: '0' }]
  }

  const skip = isText.value && shouldSkipValidation.value
  if (props.prop && !skip) result.prop = props.prop
  else delete result.prop

  if (skip) {
    // 中文：空 rules 数组阻止 item / form 规则运行，同时保持组件挂载。
    // English: An empty rules array prevents item and form rules from running.
    result.rules = []
    result.required = false
  }

  if (!rest.label && !slots.label && rest.labelWidth === undefined) {
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
