import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, reactive, ref, unref } from 'vue'
import type { Plugin, Ref, VNodeChild } from 'vue'
import {
  ElAutocomplete,
  ElCascader,
  ElCheckbox,
  ElCheckboxGroup,
  ElColorPickerPanel,
  ElDatePicker,
  ElDatePickerPanel,
  ElForm,
  ElInput,
  ElInputNumber,
  ElInputTag,
  ElMention,
  ElOption,
  ElRadio,
  ElRadioGroup,
  ElRate,
  ElSelect,
  ElSlider,
  ElSwitch,
  ElTimePicker,
  ElTransfer,
  ElTreeSelect
} from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import TextFormItem from '../src/components/TextFormItem.vue'
import EpFieldView from '../src'
import type { FieldViewFormatter } from '../src/types'

type SlotFactory = (model: Record<string, any>) => VNodeChild

interface MountOptions {
  model?: Record<string, unknown>
  text?: boolean | Ref<boolean>
  itemProps?: Record<string, unknown>
  formProps?: Record<string, unknown>
  slot?: SlotFactory
  textSlot?: (scope: { text: string; value: unknown }) => VNodeChild
  labelSlot?: () => VNodeChild
  plugins?: Array<Plugin | [Plugin, Record<string, unknown>]>
}

function mountItem(options: MountOptions = {}) {
  const model = reactive(options.model ?? {})
  const text = options.text ?? true

  const Host = defineComponent({
    name: 'TestHost',
    setup() {
      return () =>
        h(
          ElForm,
          {
            model,
            text: unref(text),
            ...options.formProps
          } as Record<string, unknown>,
          {
            default: () =>
              h(TextFormItem, { ...options.itemProps } as Record<string, unknown>, {
                ...(options.slot ? { default: () => options.slot!(model) } : {}),
                ...(options.textSlot ? { text: options.textSlot } : {}),
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

/**
 * 中文：等待 Vue 更新与表单 text 属性的 MutationObserver 回调。
 *
 * English: Wait for Vue updates and the form text MutationObserver callback.
 */
async function settle(): Promise<void> {
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 0))
  await nextTick()
}

describe('text mode', () => {
  it('renders the default slot in edit mode', async () => {
    const { wrapper } = mountItem({
      text: false,
      model: { name: 'Vue' },
      itemProps: { prop: 'name' },
      slot: (model) => h(ElInput, { modelValue: model.name })
    })
    await nextTick()
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('.ep-field-view__content').exists()).toBe(false)
  })

  it('inherits text from the parent form', async () => {
    const { wrapper } = mountItem({
      model: { name: 'Vue' },
      itemProps: { prop: 'name' },
      slot: (model) => h(ElInput, { modelValue: model.name })
    })
    await nextTick()
    expect(wrapper.find('input').exists()).toBe(false)
    expect(content(wrapper)).toBe('Vue')
  })

  it('does not enter text mode for el-form readonly', async () => {
    const { wrapper } = mountItem({
      text: false,
      model: { name: 'Vue' },
      itemProps: { prop: 'name' },
      formProps: { readonly: true },
      slot: (model) => h(ElInput, { modelValue: model.name })
    })
    await nextTick()
    // 中文：Element Plus 原生 readonly 与文本模式相互独立。
    // English: Native readonly is independent from text mode.
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('.ep-field-view__content').exists()).toBe(false)
  })

  it('lets the text prop override the form', async () => {
    const { wrapper } = mountItem({
      model: { name: 'Vue' },
      itemProps: { prop: 'name', text: false },
      slot: (model) => h(ElInput, { modelValue: model.name })
    })
    await nextTick()
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('reacts when the form text attribute changes', async () => {
    const text = ref(true)
    const { wrapper } = mountItem({
      text,
      model: { name: 'Vue' },
      itemProps: { prop: 'name' },
      slot: (model) => h(ElInput, { modelValue: model.name })
    })
    await nextTick()
    expect(wrapper.find('input').exists()).toBe(false)

    text.value = false
    await settle()
    expect(wrapper.find('input').exists()).toBe(true)

    text.value = true
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
    expect(content(wrapper)).toBe('a;b;c')
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
    expect(content(wrapper)).toBe('北京;上海')
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
    expect(content(checkbox.wrapper)).toBe('选项 X;选项 Y')
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

  it('formats quarter, multi-select and new range date types', async () => {
    const quarter = mountItem({
      model: { value: new Date(2024, 4, 20) },
      itemProps: { prop: 'value' },
      slot: (model) => h(ElDatePicker, { modelValue: model.value, type: 'quarter' })
    })
    await nextTick()
    expect(content(quarter.wrapper)).toBe('2024-Q2')

    const quarters = mountItem({
      model: { value: [new Date(2024, 4, 20), new Date(2024, 7, 1)] },
      itemProps: { prop: 'value' },
      slot: (model) => h(ElDatePicker, { modelValue: model.value, type: 'quarters' })
    })
    await nextTick()
    expect(content(quarters.wrapper)).toBe('2024-Q2;2024-Q3')

    const quarterRange = mountItem({
      model: { value: [new Date(2024, 0, 1), new Date(2024, 6, 1)] },
      itemProps: { prop: 'value' },
      slot: (model) => h(ElDatePicker, { modelValue: model.value, type: 'quarterrange' })
    })
    await nextTick()
    expect(content(quarterRange.wrapper)).toBe('2024-Q1~2024-Q3')

    const yearRange = mountItem({
      model: { value: [new Date(2023, 0, 1), new Date(2025, 0, 1)] },
      itemProps: { prop: 'value' },
      slot: (model) => h(ElDatePicker, { modelValue: model.value, type: 'yearrange' })
    })
    await nextTick()
    expect(content(yearRange.wrapper)).toBe('2023~2025')

    const years = mountItem({
      model: { value: [new Date(2023, 0, 1), new Date(2025, 0, 1)] },
      itemProps: { prop: 'value' },
      slot: (model) => h(ElDatePicker, { modelValue: model.value, type: 'years' })
    })
    await nextTick()
    expect(content(years.wrapper)).toBe('2023;2025')

    const months = mountItem({
      model: { value: [new Date(2024, 0, 1), new Date(2024, 4, 1)] },
      itemProps: { prop: 'value' },
      slot: (model) => h(ElDatePicker, { modelValue: model.value, type: 'months' })
    })
    await nextTick()
    expect(content(months.wrapper)).toBe('2024-01;2024-05')
  })

  it('formats date and color panel components', async () => {
    const date = mountItem({
      model: { value: new Date(2024, 4, 20) },
      itemProps: { prop: 'value' },
      slot: (model) => h(ElDatePickerPanel, { modelValue: model.value, type: 'quarter' })
    })
    await nextTick()
    expect(content(date.wrapper)).toBe('2024-Q2')

    const color = mountItem({
      model: { value: '#ff0000' },
      itemProps: { prop: 'value' },
      slot: (model) => h(ElColorPickerPanel, { modelValue: model.value })
    })
    await nextTick()
    expect(content(color.wrapper)).toBe('#ff0000')
  })

  it('resolves tree select labels from tree data', async () => {
    const single = mountItem({
      model: { node: 'leaf-1' },
      itemProps: { prop: 'node' },
      slot: (model) =>
        h(ElTreeSelect, {
          modelValue: model.node,
          data: [
            {
              value: 'parent',
              label: '父节点',
              children: [{ value: 'leaf-1', label: '子节点 1' }]
            }
          ]
        })
    })
    await nextTick()
    expect(content(single.wrapper)).toBe('子节点 1')

    const multiple = mountItem({
      model: { nodes: [1, 3] },
      itemProps: { prop: 'nodes' },
      slot: (model) =>
        h(ElTreeSelect as any, {
          modelValue: model.nodes,
          multiple: true,
          data: [
            {
              id: 1,
              name: '分组',
              nodes: [
                { id: 2, name: '成员 2' },
                { id: 3, name: '成员 3' }
              ]
            }
          ] as any,
          props: { label: 'name', value: 'id', children: 'nodes' }
        })
    })
    await nextTick()
    expect(content(multiple.wrapper)).toBe('分组;成员 3')
  })

  it('formats input tag, mention and autocomplete values', async () => {
    const tags = mountItem({
      model: { tags: ['vue', 'vite'] },
      itemProps: { prop: 'tags' },
      slot: (model) => h(ElInputTag, { modelValue: model.tags })
    })
    await nextTick()
    expect(content(tags.wrapper)).toBe('vue;vite')

    const mention = mountItem({
      model: { content: '@ada 请看一下' },
      itemProps: { prop: 'content' },
      slot: (model) => h(ElMention, { modelValue: model.content })
    })
    await nextTick()
    expect(content(mention.wrapper)).toBe('@ada 请看一下')

    const autocomplete = mountItem({
      model: { keyword: 'element-plus' },
      itemProps: { prop: 'keyword' },
      slot: (model) => h(ElAutocomplete, { modelValue: model.keyword })
    })
    await nextTick()
    expect(content(autocomplete.wrapper)).toBe('element-plus')
  })

  it('renders input tag values as readonly tags in tag mode', async () => {
    const { wrapper } = mountItem({
      model: { tags: ['vue', 'vite'] },
      itemProps: { prop: 'tags', inputTagMode: 'tag' },
      slot: (model) => h(ElInputTag, { modelValue: model.tags, tagType: 'success', tagEffect: 'dark' })
    })
    await nextTick()
    const tags = wrapper.findAll('.ep-field-view__content .el-tag')
    expect(tags).toHaveLength(2)
    expect(tags[0].text()).toBe('vue')
    expect(tags[1].text()).toBe('vite')
    expect(tags[0].classes()).toContain('el-tag--success')
    expect(tags[0].classes()).toContain('el-tag--dark')

    const global = mountItem({
      model: { tags: ['vue'] },
      itemProps: { prop: 'tags' },
      slot: (model) => h(ElInputTag, { modelValue: model.tags }),
      plugins: [[EpFieldView, { inputTagMode: 'tag' }]]
    })
    await nextTick()
    expect(global.wrapper.findAll('.ep-field-view__content .el-tag')).toHaveLength(1)
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
    expect(content(wrapper)).toBe('成员 1;成员 3')
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
    // 中文：el-select 输入框显示 option label，而不是仅用于下拉的 #label。
    // English: The select input shows the option label, not the dropdown #label.
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
    expect(content(wrapper)).toBe('★北京;★上海')
  })

  it('renders score text by default and el-rate in rate mode', async () => {
    const text = mountItem({
      model: { score: 4 },
      itemProps: { prop: 'score' },
      slot: (model) => h(ElRate, { modelValue: model.score })
    })
    await nextTick()
    expect(content(text.wrapper)).toBe('4')

    const rate = mountItem({
      model: { score: 4 },
      itemProps: { prop: 'score', rateMode: 'rate' },
      slot: (model) => h(ElRate, { modelValue: model.score })
    })
    await nextTick()
    expect(rate.wrapper.find('.el-rate').exists()).toBe(true)
    expect(rate.wrapper.findComponent(ElRate).props('disabled')).toBe(true)
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
    expect(root.classes()).toContain('ep-field-view--text')
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
  it('renders the text slot with its scope', async () => {
    const { wrapper } = mountItem({
      model: { value: 'abc' },
      itemProps: { prop: 'value' },
      textSlot: (scope) => h('em', { class: 'custom-text' }, `自定义:${scope.text}`)
    })
    await nextTick()
    expect(wrapper.find('.custom-text').text()).toBe('自定义:abc')
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

  it('skips validation in text mode and restores it in edit mode', async () => {
    const text = ref(true)
    const model = reactive({ name: '' })
    const formRef = ref<FormInstance>()
    const rules: FormRules = {
      name: [{ required: true, message: 'name is required', trigger: 'blur' }]
    }

    const Host = defineComponent({
      name: 'ValidationHost',
      setup() {
        return () =>
          h(ElForm, { ref: formRef, model, rules, text: text.value } as Record<string, unknown>, {
            default: () =>
              h(
                TextFormItem,
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

    text.value = false
    await settle()
    expect(wrapper.find('.el-form-item').classes()).toContain('is-required')
    const fields = (formRef.value as unknown as { fields: Array<{ propString: string }> }).fields
    expect(fields.length).toBe(1)
    expect(fields[0]!.propString).toBe('name')
    wrapper.unmount()
  })
})
