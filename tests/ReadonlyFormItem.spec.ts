import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, reactive, ref, unref } from 'vue'
import type { Plugin, Ref, VNodeChild } from 'vue'
import {
  ElCascader,
  ElCheckbox,
  ElCheckboxGroup,
  ElDatePicker,
  ElForm,
  ElInput,
  ElInputNumber,
  ElOption,
  ElRadio,
  ElRadioGroup,
  ElSelect,
  ElSlider,
  ElSwitch,
  ElTimePicker,
  ElTransfer
} from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import ReadonlyFormItem from '../src/components/ReadonlyFormItem.vue'
import EpFieldView from '../src'
import type { FieldViewFormatter } from '../src/types'

type SlotFactory = (model: Record<string, any>) => VNodeChild

interface MountOptions {
  model?: Record<string, unknown>
  readonly?: boolean | Ref<boolean>
  itemProps?: Record<string, unknown>
  formProps?: Record<string, unknown>
  slot?: SlotFactory
  readonlySlot?: (scope: { text: string; value: unknown }) => VNodeChild
  labelSlot?: () => VNodeChild
  plugins?: Array<Plugin | [Plugin, Record<string, unknown>]>
}

function mountItem(options: MountOptions = {}) {
  const model = reactive(options.model ?? {})
  const readonly = options.readonly ?? true

  const Host = defineComponent({
    name: 'TestHost',
    setup() {
      return () =>
        h(
          ElForm,
          {
            model,
            readonly: unref(readonly),
            ...options.formProps
          } as Record<string, unknown>,
          {
            default: () =>
              h(ReadonlyFormItem, { ...options.itemProps } as Record<string, unknown>, {
                ...(options.slot ? { default: () => options.slot!(model) } : {}),
                ...(options.readonlySlot ? { readonly: options.readonlySlot } : {}),
                ...(options.labelSlot ? { label: options.labelSlot } : {})
              })
          }
        )
    }
  })

  const wrapper = mount(Host, {
    global: { plugins: (options.plugins ?? []) as Plugin[] }
  })
  return { wrapper, model }
}

function content(wrapper: ReturnType<typeof mount>) {
  return wrapper.find('.ep-field-view__content').text()
}

/** Wait for Vue updates and for the form element's MutationObserver callback. */
async function settle(): Promise<void> {
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 0))
  await nextTick()
}

describe('readonly state', () => {
  it('renders the default slot in edit mode', async () => {
    const { wrapper } = mountItem({
      readonly: false,
      model: { name: 'Vue' },
      itemProps: { prop: 'name' },
      slot: (model) => h(ElInput, { modelValue: model.name })
    })
    await nextTick()
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('.ep-field-view__content').exists()).toBe(false)
  })

  it('inherits readonly from the parent form', async () => {
    const { wrapper } = mountItem({
      model: { name: 'Vue' },
      itemProps: { prop: 'name' },
      slot: (model) => h(ElInput, { modelValue: model.name })
    })
    await nextTick()
    expect(wrapper.find('input').exists()).toBe(false)
    expect(content(wrapper)).toBe('Vue')
  })

  it('lets the readonly prop override the form', async () => {
    const { wrapper } = mountItem({
      model: { name: 'Vue' },
      itemProps: { prop: 'name', readonly: false },
      slot: (model) => h(ElInput, { modelValue: model.name })
    })
    await nextTick()
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('reacts when the form readonly attribute changes', async () => {
    const readonly = ref(true)
    const { wrapper } = mountItem({
      readonly,
      model: { name: 'Vue' },
      itemProps: { prop: 'name' },
      slot: (model) => h(ElInput, { modelValue: model.name })
    })
    await nextTick()
    expect(wrapper.find('input').exists()).toBe(false)

    readonly.value = false
    await settle()
    expect(wrapper.find('input').exists()).toBe(true)

    readonly.value = true
    await settle()
    expect(content(wrapper)).toBe('Vue')
  })
})

describe('value resolution', () => {
  it('reads a nested prop path', async () => {
    const { wrapper } = mountItem({
      model: { user: { profile: { name: 'Ada' } } },
      itemProps: { prop: 'user.profile.name' }
    })
    await nextTick()
    expect(content(wrapper)).toBe('Ada')
  })

  it('prefers an explicit value prop over the model', async () => {
    const { wrapper } = mountItem({
      model: { name: 'model' },
      itemProps: { prop: 'name', value: 'explicit' }
    })
    await nextTick()
    expect(content(wrapper)).toBe('explicit')
  })

  it('shows emptyText for empty values but keeps 0 and false', async () => {
    const empty = mountItem({ model: { value: '' }, itemProps: { prop: 'value' } })
    await nextTick()
    expect(content(empty.wrapper)).toBe('-')

    const zero = mountItem({ model: { value: 0 }, itemProps: { prop: 'value' } })
    await nextTick()
    expect(content(zero.wrapper)).toBe('0')

    const bool = mountItem({ model: { value: false }, itemProps: { prop: 'value' } })
    await nextTick()
    expect(content(bool.wrapper)).toBe('否')
  })

  it('joins arrays with the separator', async () => {
    const { wrapper } = mountItem({
      model: { tags: ['a', 'b', 'c'] },
      itemProps: { prop: 'tags' }
    })
    await nextTick()
    expect(content(wrapper)).toBe('a,b,c')
  })

  it('supports an explicit emptyText', async () => {
    const { wrapper } = mountItem({
      model: { value: null },
      itemProps: { prop: 'value', emptyText: '暂无数据' }
    })
    await nextTick()
    expect(content(wrapper)).toBe('暂无数据')
  })
})

describe('value formatters', () => {
  it('resolves static select option labels', async () => {
    const { wrapper } = mountItem({
      model: { city: 'bj' },
      itemProps: { prop: 'city' },
      slot: (model) =>
        h(
          ElSelect,
          { modelValue: model.city },
          {
            default: () => [h(ElOption, { label: '北京', value: 'bj' }), h(ElOption, { label: '上海', value: 'sh' })]
          }
        )
    })
    await nextTick()
    expect(content(wrapper)).toBe('北京')
  })

  it('resolves multiple select labels', async () => {
    const { wrapper } = mountItem({
      model: { cities: ['bj', 'sh'] },
      itemProps: { prop: 'cities' },
      slot: (model) =>
        h(
          ElSelect,
          { modelValue: model.cities, multiple: true },
          {
            default: () => [h(ElOption, { label: '北京', value: 'bj' }), h(ElOption, { label: '上海', value: 'sh' })]
          }
        )
    })
    await nextTick()
    expect(content(wrapper)).toBe('北京,上海')
  })

  it('resolves radio and checkbox labels', async () => {
    const radio = mountItem({
      model: { radio: 'a' },
      itemProps: { prop: 'radio' },
      slot: (model) =>
        h(
          ElRadioGroup,
          { modelValue: model.radio },
          {
            default: () => [h(ElRadio, { value: 'a' }, () => '选项 A'), h(ElRadio, { value: 'b' }, () => '选项 B')]
          }
        )
    })
    await nextTick()
    expect(content(radio.wrapper)).toBe('选项 A')

    const checkbox = mountItem({
      model: { checkbox: ['x', 'y'] },
      itemProps: { prop: 'checkbox' },
      slot: (model) =>
        h(
          ElCheckboxGroup,
          { modelValue: model.checkbox },
          {
            default: () => [
              h(ElCheckbox, { value: 'x' }, () => '选项 X'),
              h(ElCheckbox, { value: 'y' }, () => '选项 Y')
            ]
          }
        )
    })
    await nextTick()
    expect(content(checkbox.wrapper)).toBe('选项 X,选项 Y')
  })

  it('resolves cascader label paths', async () => {
    const { wrapper } = mountItem({
      model: { path: ['guide', 'components'] },
      itemProps: { prop: 'path' },
      slot: (model) =>
        h(ElCascader, {
          modelValue: model.path,
          options: [
            {
              value: 'guide',
              label: '指南',
              children: [{ value: 'components', label: '组件' }]
            }
          ]
        })
    })
    await nextTick()
    expect(content(wrapper)).toBe('指南/组件')
  })

  it('resolves switch text from props and the global config', async () => {
    const enabled = mountItem({
      model: { enabled: true },
      itemProps: { prop: 'enabled' },
      slot: (model) => h(ElSwitch, { modelValue: model.enabled })
    })
    await nextTick()
    expect(content(enabled.wrapper)).toBe('开')

    const labelled = mountItem({
      model: { enabled: false },
      itemProps: { prop: 'enabled' },
      slot: (model) => h(ElSwitch, { modelValue: model.enabled, activeText: '启用', inactiveText: '停用' })
    })
    await nextTick()
    expect(content(labelled.wrapper)).toBe('停用')
  })

  it('formats dates, ranges and times', async () => {
    const date = mountItem({
      model: { value: new Date(2024, 4, 20) },
      itemProps: { prop: 'value' },
      slot: (model) => h(ElDatePicker, { modelValue: model.value, type: 'date' })
    })
    await nextTick()
    expect(content(date.wrapper)).toBe('2024-05-20')

    const range = mountItem({
      model: { value: [new Date(2024, 4, 1), new Date(2024, 4, 20)] },
      itemProps: { prop: 'value' },
      slot: (model) => h(ElDatePicker, { modelValue: model.value, type: 'daterange' })
    })
    await nextTick()
    expect(content(range.wrapper)).toBe('2024-05-01~2024-05-20')

    const time = mountItem({
      model: { value: new Date(2024, 4, 20, 9, 15, 0) },
      itemProps: { prop: 'value' },
      slot: (model) => h(ElTimePicker, { modelValue: model.value })
    })
    await nextTick()
    expect(content(time.wrapper)).toBe('09:15:00')
  })

  it('joins slider ranges with rangeSeparator', async () => {
    const { wrapper } = mountItem({
      model: { value: [20, 60] },
      itemProps: { prop: 'value' },
      slot: (model) => h(ElSlider, { modelValue: model.value, range: true })
    })
    await nextTick()
    expect(content(wrapper)).toBe('20~60')
  })

  it('resolves transfer labels from data', async () => {
    const { wrapper } = mountItem({
      model: { members: [1, 3] },
      itemProps: { prop: 'members' },
      slot: (model) =>
        h(ElTransfer, {
          modelValue: model.members,
          data: [
            { key: 1, label: '成员 1' },
            { key: 2, label: '成员 2' },
            { key: 3, label: '成员 3' }
          ]
        })
    })
    await nextTick()
    expect(content(wrapper)).toBe('成员 1,成员 3')
  })

  it('uses a custom formatter and falls back to emptyText for null', async () => {
    const formatter: FieldViewFormatter = (value, context) => `${String(value)}-${context.options.length}`
    const { wrapper } = mountItem({
      model: { value: 'abc' },
      itemProps: { prop: 'value', formatter }
    })
    await nextTick()
    expect(content(wrapper)).toBe('abc-0')

    const nullFormatter: FieldViewFormatter = () => null
    const empty = mountItem({
      model: { value: 'abc' },
      itemProps: { prop: 'value', formatter: nullFormatter }
    })
    await nextTick()
    expect(content(empty.wrapper)).toBe('-')
  })
})

describe('component display extensions', () => {
  it('keeps input prefix, prepend, append and suffix text', async () => {
    const { wrapper } = mountItem({
      model: { amount: 100 },
      itemProps: { prop: 'amount' },
      slot: (model) =>
        h(
          ElInput,
          { modelValue: model.amount },
          {
            prefix: () => '￥',
            prepend: () => 'https://',
            append: () => '.com',
            suffix: () => '元'
          }
        )
    })
    await nextTick()
    expect(content(wrapper)).toBe('￥https://100.com元')
  })

  it('can disable input affixes', async () => {
    const { wrapper } = mountItem({
      model: { amount: 100 },
      itemProps: { prop: 'amount', includeAffixes: false },
      slot: (model) =>
        h(
          ElInput,
          { modelValue: model.amount },
          {
            append: () => '元'
          }
        )
    })
    await nextTick()
    expect(content(wrapper)).toBe('100')
  })

  it('ignores option label slots for the selected value', async () => {
    const { wrapper } = mountItem({
      model: { city: 'bj' },
      itemProps: { prop: 'city' },
      slot: (model) =>
        h(
          ElSelect,
          { modelValue: model.city },
          {
            default: () => [h(ElOption, { label: '北京', value: 'bj' }, { label: () => '首都' })]
          }
        )
    })
    await nextTick()
    // Element Plus shows the option's `label` in the select input, not the
    // dropdown-only label slot, so the read-only value must match the label.
    expect(content(wrapper)).toBe('北京')
  })

  it('renders the select label slot as VNodes', async () => {
    const { wrapper } = mountItem({
      model: { city: 'bj' },
      itemProps: { prop: 'city' },
      slot: (model) =>
        h(
          ElSelect,
          { modelValue: model.city },
          {
            default: () => [h(ElOption, { label: '北京', value: 'bj' })],
            label: ({ label }: { label: string }) => h('span', { class: 'rich-select-label' }, `★${label}`)
          }
        )
    })
    await nextTick()
    expect(wrapper.find('.rich-select-label').exists()).toBe(true)
    expect(content(wrapper)).toBe('★北京')
  })

  it('renders multi-select label slot content for each value', async () => {
    const { wrapper } = mountItem({
      model: { cities: ['bj', 'sh'] },
      itemProps: { prop: 'cities' },
      slot: (model) =>
        h(
          ElSelect,
          { modelValue: model.cities, multiple: true },
          {
            default: () => [h(ElOption, { label: '北京', value: 'bj' }), h(ElOption, { label: '上海', value: 'sh' })],
            label: ({ label }: { label: string }) => h('span', { class: 'rich-label' }, `★${label}`)
          }
        )
    })
    await nextTick()
    expect(wrapper.findAll('.rich-label').length).toBe(2)
    expect(content(wrapper)).toBe('★北京,★上海')
  })

  it('renders radio custom content as VNodes', async () => {
    const { wrapper } = mountItem({
      model: { radio: 'a' },
      itemProps: { prop: 'radio' },
      slot: (model) =>
        h(
          ElRadioGroup,
          { modelValue: model.radio },
          {
            default: () => [h(ElRadio, { value: 'a' }, () => h('span', { class: 'rich-radio' }, '选项 A'))]
          }
        )
    })
    await nextTick()
    expect(wrapper.find('.rich-radio').exists()).toBe(true)
    expect(content(wrapper)).toBe('选项 A')
  })

  it('uses the input number formatter', async () => {
    const formatter = (value: unknown): string => `¥${String(value)}`
    const { wrapper } = mountItem({
      model: { price: 1234 },
      itemProps: { prop: 'price' },
      slot: (model) => h(ElInputNumber, { modelValue: model.price, formatter })
    })
    await nextTick()
    expect(content(wrapper)).toBe('¥1234')
  })

  it('applies size classes from the form and the item', async () => {
    const fromForm = mountItem({
      model: { value: 'x' },
      itemProps: { prop: 'value' },
      formProps: { size: 'small' }
    })
    await nextTick()
    expect(fromForm.wrapper.find('.ep-field-view').classes()).toContain('ep-field-view--size-small')

    const fromItem = mountItem({
      model: { value: 'x' },
      itemProps: { prop: 'value', size: 'large' }
    })
    await nextTick()
    expect(fromItem.wrapper.find('.ep-field-view').classes()).toContain('ep-field-view--size-large')
  })
})

describe('global configuration and theming', () => {
  it('uses the global config for empty text and separators', async () => {
    const { wrapper } = mountItem({
      model: { cities: ['bj', 'sh'] },
      itemProps: { prop: 'cities' },
      plugins: [[EpFieldView, { emptyText: '暂无', separator: '、' }]],
      slot: (model) =>
        h(
          ElSelect,
          { modelValue: model.cities, multiple: true },
          {
            default: () => [h(ElOption, { label: '北京', value: 'bj' }), h(ElOption, { label: '上海', value: 'sh' })]
          }
        )
    })
    await nextTick()
    expect(content(wrapper)).toBe('北京、上海')
  })

  it('applies theme and nowrap classes', async () => {
    const { wrapper } = mountItem({
      model: { value: 'x' },
      itemProps: { prop: 'value', theme: 'brand', nowrap: true }
    })
    await nextTick()
    const root = wrapper.find('.ep-field-view')
    expect(root.classes()).toContain('ep-field-view--theme-brand')
    expect(root.classes()).toContain('ep-field-view--nowrap')
    expect(root.classes()).toContain('ep-field-view--readonly')
  })

  it('uses the global theme when no prop is given', async () => {
    const { wrapper } = mountItem({
      model: { value: 'x' },
      itemProps: { prop: 'value' },
      plugins: [[EpFieldView, { theme: 'compact' }]]
    })
    await nextTick()
    expect(wrapper.find('.ep-field-view').classes()).toContain('ep-field-view--theme-compact')
  })
})

describe('slots and validation', () => {
  it('renders the readonly slot with its scope', async () => {
    const { wrapper } = mountItem({
      model: { value: 'abc' },
      itemProps: { prop: 'value' },
      readonlySlot: (scope) => h('em', { class: 'custom-readonly' }, `自定义:${scope.text}`)
    })
    await nextTick()
    expect(wrapper.find('.custom-readonly').text()).toBe('自定义:abc')
    expect(wrapper.find('.ep-field-view__content').exists()).toBe(false)
  })

  it('forwards the label slot to the form item', async () => {
    const { wrapper } = mountItem({
      model: { value: 'abc' },
      itemProps: { prop: 'value' },
      labelSlot: () => h('span', { class: 'custom-label' }, '自定义标签')
    })
    await nextTick()
    expect(wrapper.find('.custom-label').text()).toBe('自定义标签')
  })

  it('skips validation while readonly and restores it in edit mode', async () => {
    const readonly = ref(true)
    const model = reactive({ name: '' })
    const formRef = ref<FormInstance>()
    const rules: FormRules = {
      name: [{ required: true, message: 'name is required', trigger: 'blur' }]
    }

    const Host = defineComponent({
      name: 'ValidationHost',
      setup() {
        return () =>
          h(ElForm, { ref: formRef, model, rules, readonly: readonly.value } as Record<string, unknown>, {
            default: () =>
              h(
                ReadonlyFormItem,
                { prop: 'name', label: '名称' },
                {
                  default: () => h(ElInput, { modelValue: model.name })
                }
              )
          })
      }
    })

    const wrapper = mount(Host)
    await nextTick()
    await expect(formRef.value!.validate()).resolves.toBe(true)
    expect((formRef.value as unknown as { fields: unknown[] }).fields.length).toBe(0)
    expect(wrapper.find('.el-form-item').classes()).not.toContain('is-required')

    readonly.value = false
    await settle()
    expect(wrapper.find('.el-form-item').classes()).toContain('is-required')
    const fields = (formRef.value as unknown as { fields: Array<{ propString: string }> }).fields
    expect(fields.length).toBe(1)
    expect(fields[0]!.propString).toBe('name')
    wrapper.unmount()
  })
})
