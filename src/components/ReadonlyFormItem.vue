<template>
  <ElFormItem
    :key="isReadonly ? 'ep-field-view-readonly' : 'ep-field-view-edit'"
    ref="formItemRef"
    v-bind="formItemProps"
  >
    <template v-if="isReadonly">
      <slot name="readonly" :value="currentValue" :text="displayText" :options="resolvedOptions" :empty="isEmpty">
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
import { CAPTURED_COMPONENTS, DEFAULT_CONFIG, DEFAULT_OPTION_PROPS } from '../constants'
import { EP_FIELD_VIEW_CONFIG_KEY } from '../config'
import type { EpFieldViewConfig, FieldViewOption, FieldViewOptionProps, ReadonlyFormItemProps } from '../types'
import { extractOptions, formatFieldValue, resolveCustomDisplay } from '../utils/format'
import type { FormatContext } from '../utils/format'
import { observeFormReadonly, readFormReadonly } from '../utils/form-readonly'
import { isEmptyValue, getByPath } from '../utils/value'
import { findComponentVNode, getComponentName } from '../utils/vnode'

defineOptions({
  name: 'ReadonlyFormItem'
})

const props = withDefaults(defineProps<ReadonlyFormItemProps>(), {
  // Vue casts an absent Boolean prop to `false`. Keeping these `undefined`
  // lets the component distinguish "not set" from an explicit `false`, which
  // is required for inheriting `readonly` from the parent form.
  readonly: undefined,
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

/** Slots forwarded to the underlying `ElFormItem` (`label`, `error`, ...). */
const forwardedSlots = computed(() => {
  const result: Record<string, unknown> = {}
  for (const [name, slot] of Object.entries(slots)) {
    if (name !== 'default' && name !== 'readonly') result[name] = slot
  }
  return result
})

/**
 * Slot VNodes are not reactive. Bumping a revision on every update keeps the
 * computed formatters in sync with option changes in the parent (for example
 * asynchronously loaded select options) without any polling.
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

/** Matches the size of the surrounding form / form item so the read-only text scales with it. */
const size = computed<'large' | 'default' | 'small'>(() => {
  // `attrs` is not reactive; reading the revision refreshes an overridden size.
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
  includeAffixes: includeAffixes.value
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

/** `el-form` accepts `readonly` as a fallthrough attribute. Vue attrs are not
 * reactive, so a MutationObserver keeps the state in sync when the form's
 * read-only mode is toggled at runtime. */
const formReadonly = ref(readFormReadonly(parentForm?.attrs))

let stopObservingForm: (() => void) | undefined

onMounted(() => {
  formReadonly.value = readFormReadonly(parentForm?.attrs)
  stopObservingForm = observeFormReadonly(parentForm?.proxy?.$el as Element | null | undefined, () => {
    formReadonly.value = readFormReadonly(parentForm?.attrs)
  })
})

onBeforeUnmount(() => {
  stopObservingForm?.()
})

const isReadonly = computed(() => props.readonly ?? formReadonly.value)

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
  // Read the revision so the slot vnodes are re-inspected after a parent update.
  void revision.value
  const defaultSlot = slots.default
  if (!defaultSlot) return null
  return findComponentVNode(defaultSlot(), CAPTURED_COMPONENTS)
})

const hasValueProp = computed(() => {
  // Depend on the value so an explicit `undefined` -> value transition is seen.
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
  includeAffixes: includeAffixes.value
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
 * Rich content provided by the component's own selected-value slots (for
 * example `el-select`'s `#label` or a radio's custom content). Rendering the
 * original VNodes keeps the read-only display identical to the component.
 */
const customContent = computed(() => {
  void revision.value
  if (props.formatter || !isReadonly.value) return undefined
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
  if (isReadonly.value) classNames.push('ep-field-view--readonly')
  if (attrClass) classNames.push(attrClass)

  const result: Record<string, unknown> = { ...rest, class: classNames }

  if (attrStyle !== undefined) result.style = attrStyle
  if (isInTable) {
    result.style = [attrStyle, { marginBottom: '0' }]
  }

  const skip = isReadonly.value && shouldSkipValidation.value
  if (props.prop && !skip) result.prop = props.prop
  else delete result.prop

  if (skip) {
    // An empty `rules` array prevents both the item rules and the form rules
    // from running, while keeping the item mounted when switching back.
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
  isReadonly,
  options: resolvedOptions
})
</script>
