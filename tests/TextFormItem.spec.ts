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
  ElConfigProvider,
  ElDatePicker,
  ElDatePickerPanel,
  ElForm,
  ElFormItem,
  ElImage,
  ElInput,
  ElInputNumber,
  ElInputTag,
  ElMention,
  ElOption,
  ElOptionGroup,
  ElRadio,
  ElRadioGroup,
  ElRate,
  ElSegmented,
  ElSelect,
  ElSelectV2,
  ElSlider,
  ElSwitch,
  ElTimePicker,
  ElTransfer,
  ElTreeSelect,
  ElUpload
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

  it('resolves select v2 grouped and object option labels', async () => {
    const grouped = mountItem({
      model: { city: 'sh' },
      itemProps: { prop: 'city' },
      slot: (model) =>
        h(ElSelectV2, {
          modelValue: model.city,
          options: [
            { label: '华东', options: [{ label: '上海', value: 'sh' }] },
            { label: '华北', options: [{ label: '北京', value: 'bj' }] }
          ]
        })
    })
    await nextTick()
    expect(content(grouped.wrapper)).toBe('上海')

    // 中文：对象值需要按 value-key 匹配，model 与选项通常不是同一引用。
    // English: Object values match by value-key; model and option are separate references.
    const objectValue = mountItem({
      model: { city: { id: 2 } },
      itemProps: { prop: 'city' },
      slot: (model) =>
        h(ElSelectV2, {
          modelValue: model.city,
          valueKey: 'id',
          options: [
            { label: '北京', value: { id: 1 } },
            { label: '上海', value: { id: 2 } }
          ]
        })
    })
    await nextTick()
    expect(content(objectValue.wrapper)).toBe('上海')
  })

  it('resolves segmented option labels', async () => {
    const { wrapper } = mountItem({
      model: { view: 'list' },
      itemProps: { prop: 'view' },
      slot: (model) =>
        h(ElSegmented, {
          modelValue: model.view,
          options: [
            { label: '列表', value: 'list' },
            { label: '卡片', value: 'card' }
          ]
        })
    })
    await nextTick()
    expect(content(wrapper)).toBe('列表')
  })

  it('refreshes text when async options arrive after mount', async () => {
    const options = reactive<Array<{ label: string; value: string }>>([])
    const { wrapper } = mountItem({
      model: { city: 'sh' },
      itemProps: { prop: 'city' },
      slot: (model) => h(ElSelectV2, { modelValue: model.city, options })
    })
    await nextTick()
    // 中文：选项尚未返回时回退到原始值。
    // English: Fall back to the raw value until options arrive.
    expect(content(wrapper)).toBe('sh')

    options.push({ label: '上海', value: 'sh' })
    // 中文：`nextTick` 在 post flush 之后解析，此时文本应已刷新。
    // English: `nextTick` resolves after the post flush, when text is refreshed.
    await nextTick()
    expect(content(wrapper)).toBe('上海')
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

  it('formats date picker dates, week, month range and timestamp values', async () => {
    const dates = mountItem({
      model: { value: [new Date(2024, 4, 1), new Date(2024, 4, 20)] },
      itemProps: { prop: 'value' },
      slot: (model) => h(ElDatePicker, { modelValue: model.value, type: 'dates' })
    })
    await nextTick()
    expect(content(dates.wrapper)).toBe('2024-05-01;2024-05-20')

    const week = mountItem({
      model: { value: new Date(2024, 0, 3) },
      itemProps: { prop: 'value' },
      slot: (model) => h(ElDatePicker, { modelValue: model.value, type: 'week' })
    })
    await nextTick()
    // 中文：`week` 使用 dayjs 的本地化周格式，`[w]` 是字面量 `w`。
    // English: `week` uses dayjs' localized week format; `[w]` is a literal `w`.
    expect(content(week.wrapper)).toBe('2024w01')

    const monthRange = mountItem({
      model: { value: [new Date(2024, 0, 1), new Date(2024, 4, 1)] },
      itemProps: { prop: 'value' },
      slot: (model) => h(ElDatePicker, { modelValue: model.value, type: 'monthrange' })
    })
    await nextTick()
    expect(content(monthRange.wrapper)).toBe('2024-01~2024-05')

    const timestamp = mountItem({
      model: { value: String(new Date(2024, 4, 20).getTime()) },
      itemProps: { prop: 'value' },
      slot: (model) => h(ElDatePicker, { modelValue: model.value, type: 'date', valueFormat: 'x' })
    })
    await nextTick()
    expect(content(timestamp.wrapper)).toBe('2024-05-20')
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
    const tagGroup = wrapper.find('.ep-field-view__content > .ep-field-view__tags')
    expect(tagGroup.exists()).toBe(true)
    expect(tagGroup.findAll('.el-tag')).toHaveLength(2)
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

  it('keeps segmented, tree select and input tag edge cases in text mode', async () => {
    const primitiveOptions = mountItem({
      model: { scale: 'week' },
      itemProps: { prop: 'scale' },
      slot: (model) => h(ElSegmented, { modelValue: model.scale, options: ['day', 'week'] })
    })
    await nextTick()
    expect(content(primitiveOptions.wrapper)).toBe('week')

    const unmatched = mountItem({
      model: { view: 'card' },
      itemProps: { prop: 'view' },
      slot: (model) =>
        h(ElSegmented, {
          modelValue: model.view,
          options: [{ label: '列表', value: 'list' }]
        })
    })
    await nextTick()
    expect(content(unmatched.wrapper)).toBe('card')

    const missingNode = mountItem({
      model: { node: 'unknown' },
      itemProps: { prop: 'node' },
      slot: (model) => h(ElTreeSelect, { modelValue: model.node, data: [] })
    })
    await nextTick()
    expect(content(missingNode.wrapper)).toBe('unknown')

    // 中文：tag 模式下空数组仍回退到 emptyText，不渲染空容器。
    // English: An empty array still falls back to emptyText in tag mode.
    const emptyTags = mountItem({
      model: { tags: [] },
      itemProps: { prop: 'tags', inputTagMode: 'tag' },
      slot: (model) => h(ElInputTag, { modelValue: model.tags })
    })
    await nextTick()
    expect(content(emptyTags.wrapper)).toBe('-')
    expect(emptyTags.wrapper.find('.ep-field-view__tags').exists()).toBe(false)

    const plainTag = mountItem({
      model: { tags: ['vue'] },
      itemProps: { prop: 'tags', inputTagMode: 'tag' },
      slot: (model) => h(ElInputTag, { modelValue: model.tags, tagEffect: 'plain' })
    })
    await nextTick()
    expect(plainTag.wrapper.find('.ep-field-view__tags .el-tag').classes()).toContain('el-tag--plain')
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

  it('resolves upload file names from the model or the component file list', async () => {
    const fromModel = mountItem({
      model: { files: [{ name: '合同.pdf' }, { name: '附件.zip' }] },
      itemProps: { prop: 'files' },
      slot: (model) => h(ElUpload, { fileList: model.files, autoUpload: false })
    })
    await nextTick()
    expect(content(fromModel.wrapper)).toBe('合同.pdf;附件.zip')

    // 中文：文件列表通常只存在于组件 props，model 为空时回退到 file-list。
    // English: File lists often live only in component props; fall back to
    // `file-list` when the model is empty.
    const fromProps = mountItem({
      model: {},
      itemProps: { prop: 'files' },
      slot: () =>
        h(ElUpload as any, {
          autoUpload: false,
          fileList: [{ name: '报价单.xlsx' }, { url: 'https://example.com/a.pdf' }, { raw: { name: '原始文件' } }]
        })
    })
    await nextTick()
    expect(content(fromProps.wrapper)).toBe('报价单.xlsx;https://example.com/a.pdf;原始文件')
  })

  it('shows image URLs by default and renders el-image in image mode', async () => {
    const text = mountItem({
      model: { avatar: 'https://example.com/avatar.png' },
      itemProps: { prop: 'avatar' },
      slot: (model) => h(ElImage, { src: model.avatar })
    })
    await nextTick()
    expect(content(text.wrapper)).toBe('https://example.com/avatar.png')

    const fallback = mountItem({
      model: {},
      itemProps: { prop: 'avatar' },
      slot: () => h(ElImage, { src: 'https://example.com/fallback.png' })
    })
    await nextTick()
    expect(content(fallback.wrapper)).toBe('https://example.com/fallback.png')

    const images = mountItem({
      model: { avatars: ['https://example.com/a.png', 'https://example.com/b.png'] },
      itemProps: { prop: 'avatars', imageMode: 'image' },
      slot: (model) => h(ElImage, { src: model.avatars[0] })
    })
    await nextTick()
    expect(images.wrapper.findAll('.ep-field-view__image')).toHaveLength(2)
    const first = images.wrapper.findComponent(ElImage)
    expect(first.props('previewSrcList')).toEqual(['https://example.com/a.png', 'https://example.com/b.png'])
    expect(first.props('previewTeleported')).toBe(true)
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

  it('accepts an array prop and exposes its dotted path to formatters', async () => {
    let receivedProp: string | undefined
    const formatter: FieldViewFormatter = (value, context) => {
      receivedProp = context.prop
      return String(value)
    }
    const { wrapper } = mountItem({
      model: { user: { addresses: [{ city: '上海' }] } },
      itemProps: { prop: ['user', 'addresses', '0', 'city'], formatter }
    })
    await nextTick()
    expect(content(wrapper)).toBe('上海')
    expect(receivedProp).toBe('user.addresses.0.city')
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
    const rateRoot = rate.wrapper.find('.ep-field-view__rate')
    expect(rateRoot.exists()).toBe(true)
    expect(rate.wrapper.find('.el-rate').exists()).toBe(true)
    expect(rate.wrapper.findComponent(ElRate).props('disabled')).toBe(true)
    // 中文：文本态评分不进入 Tab 顺序，也不暴露给辅助技术。
    // English: The text-mode rate stays out of the tab order and is hidden from AT.
    expect(rateRoot.attributes('tabindex')).toBe('-1')
    expect(rateRoot.attributes('aria-hidden')).toBe('true')
    expect(rateRoot.attributes('aria-disabled')).toBe('true')
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

  it('maps Element Plus variables under a custom el-config-provider namespace', async () => {
    const wrapper = mount(
      defineComponent({
        name: 'NamespaceHost',
        setup() {
          return () =>
            h(
              ElConfigProvider,
              { namespace: 'v3' },
              {
                default: () =>
                  h(
                    ElForm,
                    { model: { name: 'Vue' }, text: true },
                    {
                      default: () =>
                        h(TextFormItem, { prop: 'name' }, { default: () => h(ElInput, { modelValue: 'Vue' }) })
                    }
                  )
              }
            )
        }
      })
    )
    await nextTick()
    const root = wrapper.find('.ep-field-view')
    const style = root.attributes('style') ?? ''
    // 中文：变量来源指向自定义 namespace，并保留 --el-* 回退。
    // English: Variable sources point at the custom namespace with an --el-* fallback.
    expect(style).toContain('--ep-field-view-source-color: var(--v3-text-color-regular, var(--el-text-color-regular))')
    expect(style).toContain('--ep-field-view-source-component-size: var(--v3-component-size, var(--el-component-size))')
    expect(wrapper.find('.v3-form-item').exists()).toBe(true)
    expect(content(wrapper)).toBe('Vue')
    wrapper.unmount()
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

describe('edge cases', () => {
  it('formats boolean labels, slider and rate fallbacks', async () => {
    const checkbox = mountItem({
      model: { agree: false },
      itemProps: { prop: 'agree' },
      slot: (model) => h(ElCheckbox, { modelValue: model.agree, trueValue: '同意', falseValue: '不同意' })
    })
    await nextTick()
    expect(content(checkbox.wrapper)).toBe('不同意')

    const switchFallback = mountItem({
      model: { status: 'unknown' },
      itemProps: { prop: 'status' },
      slot: (model) => h(ElSwitch, { modelValue: model.status, activeValue: 'on', inactiveValue: 'off' })
    })
    await nextTick()
    expect(content(switchFallback.wrapper)).toBe('unknown')

    const slider = mountItem({
      model: { level: 30 },
      itemProps: { prop: 'level' },
      slot: (model) => h(ElSlider, { modelValue: model.level })
    })
    await nextTick()
    expect(content(slider.wrapper)).toBe('30')

    // 中文：非数字评分回退到通用文本。
    // English: A non-numeric rate falls back to generic text.
    const rate = mountItem({
      model: { score: 'not-a-number' },
      itemProps: { prop: 'score', rateMode: 'rate' },
      slot: (model) => h(ElRate, { modelValue: model.score })
    })
    await nextTick()
    expect(content(rate.wrapper)).toBe('not-a-number')
  })

  it('handles date and time strings with value formats', async () => {
    // 中文：value-format 与展示格式一致时直接返回原字符串。
    // English: When value-format matches the display format, keep the string.
    const sameFormat = mountItem({
      model: { value: '2024-05-20' },
      itemProps: { prop: 'value' },
      slot: (model) => h(ElDatePicker, { modelValue: model.value, valueFormat: 'YYYY-MM-DD' })
    })
    await nextTick()
    expect(content(sameFormat.wrapper)).toBe('2024-05-20')

    const parsed = mountItem({
      model: { value: '2024/05/20' },
      itemProps: { prop: 'value' },
      slot: (model) => h(ElDatePicker, { modelValue: model.value })
    })
    await nextTick()
    expect(content(parsed.wrapper)).toBe('2024-05-20')

    const invalid = mountItem({
      model: { value: 'not-a-date' },
      itemProps: { prop: 'value' },
      slot: (model) => h(ElDatePicker, { modelValue: model.value })
    })
    await nextTick()
    expect(content(invalid.wrapper)).toBe('not-a-date')

    const invalidTimestamp = mountItem({
      model: { time: 'abc' },
      itemProps: { prop: 'time' },
      slot: (model) => h(ElTimePicker, { modelValue: model.time, valueFormat: 'x' })
    })
    await nextTick()
    expect(content(invalidTimestamp.wrapper)).toBe('abc')
  })

  it('formats checkboxes with partial labels and rate arrays', async () => {
    const checked = mountItem({
      model: { agree: true },
      itemProps: { prop: 'agree' },
      slot: (model) => h(ElCheckbox, { modelValue: model.agree, trueValue: '同意' })
    })
    await nextTick()
    expect(content(checked.wrapper)).toBe('同意')

    // 中文：只配置一侧文案时，另一侧使用默认的“是 / 否”。
    // English: When only one side is configured, the other uses 是 / 否.
    const trueDefault = mountItem({
      model: { agree: true },
      itemProps: { prop: 'agree' },
      slot: (model) => h(ElCheckbox, { modelValue: model.agree, falseValue: '不同意' })
    })
    await nextTick()
    expect(content(trueDefault.wrapper)).toBe('是')

    const falseDefault = mountItem({
      model: { agree: false },
      itemProps: { prop: 'agree' },
      slot: (model) => h(ElCheckbox, { modelValue: model.agree, trueValue: '同意' })
    })
    await nextTick()
    expect(content(falseDefault.wrapper)).toBe('否')

    const rateArray = mountItem({
      model: { score: [1, 2] },
      itemProps: { prop: 'score' },
      slot: (model) => h(ElRate, { modelValue: model.score })
    })
    await nextTick()
    expect(content(rateArray.wrapper)).toBe('1;2')
  })

  it('formats time picker strings, timestamps and ranges', async () => {
    const stringValue = mountItem({
      model: { time: '09:15:00' },
      itemProps: { prop: 'time' },
      slot: (model) => h(ElTimePicker, { modelValue: model.time })
    })
    await nextTick()
    expect(content(stringValue.wrapper)).toBe('09:15:00')

    const timestamp = mountItem({
      model: { time: String(new Date(2024, 4, 20, 9, 15, 0).getTime()) },
      itemProps: { prop: 'time' },
      slot: (model) => h(ElTimePicker, { modelValue: model.time, valueFormat: 'x' })
    })
    await nextTick()
    expect(content(timestamp.wrapper)).toBe('09:15:00')

    const numeric = mountItem({
      model: { time: new Date(2024, 4, 20, 9, 15, 0).getTime() },
      itemProps: { prop: 'time' },
      slot: (model) => h(ElTimePicker, { modelValue: model.time })
    })
    await nextTick()
    expect(content(numeric.wrapper)).toBe('09:15:00')

    const range = mountItem({
      model: { time: [new Date(2024, 4, 20, 9, 15, 0), new Date(2024, 4, 20, 10, 30, 0)] },
      itemProps: { prop: 'time' },
      slot: (model) => h(ElTimePicker, { modelValue: model.time, isRange: true })
    })
    await nextTick()
    expect(content(range.wrapper)).toBe('09:15:00~10:30:00')
  })

  it('resolves cascader emitPath false full paths and de-duplicates values', async () => {
    const options = [
      {
        value: 'guide',
        label: '指南',
        children: [
          {
            value: 'components',
            label: '组件',
            children: [{ value: 'text-form-item', label: 'TextFormItem' }]
          },
          { value: 'quick-start', label: '快速开始' }
        ]
      },
      { value: 'api', label: 'API' }
    ]

    // 中文：emitPath: false 时值是叶子值，仍需展示完整路径。
    // English: With emitPath: false the value is a leaf but the full path is
    // still displayed.
    const single = mountItem({
      model: { node: 'text-form-item' },
      itemProps: { prop: 'node' },
      slot: (model) => h(ElCascader, { modelValue: model.node, options, props: { emitPath: false } })
    })
    await nextTick()
    expect(content(single.wrapper)).toBe('指南/组件/TextFormItem')

    // 中文：多选叶子值去重后按首次出现顺序展示完整路径。
    // English: Multiple leaf values are de-duplicated and shown in first-seen
    // order using full paths.
    const multiple = mountItem({
      model: { nodes: ['text-form-item', 'quick-start', 'text-form-item', 'components'] },
      itemProps: { prop: 'nodes' },
      slot: (model) => h(ElCascader, { modelValue: model.nodes, options, props: { multiple: true, emitPath: false } })
    })
    await nextTick()
    expect(content(multiple.wrapper)).toBe('指南/组件/TextFormItem;指南/快速开始;指南/组件')

    // 中文：emitPath: true 的多选路径数组同样去重。
    // English: With emitPath: true, an array of paths is de-duplicated too.
    const paths = mountItem({
      model: {
        nodes: [
          ['guide', 'quick-start'],
          ['guide', 'components', 'text-form-item'],
          ['guide', 'quick-start']
        ]
      },
      itemProps: { prop: 'nodes' },
      slot: (model) => h(ElCascader, { modelValue: model.nodes, options, props: { multiple: true } })
    })
    await nextTick()
    expect(content(paths.wrapper)).toBe('指南/快速开始;指南/组件/TextFormItem')
  })

  it('formats cascader multiple, custom mappings and missing options', async () => {
    const options = [{ value: 'guide', label: '指南', children: [{ value: 'components', label: '组件' }] }]
    const multiple = mountItem({
      model: { path: ['components'] },
      itemProps: { prop: 'path' },
      slot: (model) => h(ElCascader, { modelValue: model.path, options, props: { multiple: true } })
    })
    await nextTick()
    expect(content(multiple.wrapper)).toBe('指南/组件')

    const customMapping = mountItem({
      model: { node: ['c2'] },
      itemProps: { prop: 'node' },
      slot: (model) =>
        h(ElCascader, {
          modelValue: model.node,
          options: [{ id: 'c1', name: '甲', nodes: [{ id: 'c2', name: '乙' }] }],
          props: { label: 'name', value: 'id', children: 'nodes' }
        })
    })
    await nextTick()
    expect(content(customMapping.wrapper)).toBe('甲/乙')

    const missing = mountItem({
      model: { node: 'c1' },
      itemProps: { prop: 'node' },
      slot: (model) => h(ElCascader, { modelValue: model.node })
    })
    await nextTick()
    expect(content(missing.wrapper)).toBe('c1')
  })

  it('falls back for transfer data and unmatched values', async () => {
    const noData = mountItem({
      model: { items: ['a'] },
      itemProps: { prop: 'items' },
      slot: (model) => h(ElTransfer, { modelValue: model.items })
    })
    await nextTick()
    expect(content(noData.wrapper)).toBe('a')

    const unmatched = mountItem({
      model: { items: ['a'] },
      itemProps: { prop: 'items' },
      slot: (model) => h(ElTransfer, { modelValue: model.items, data: [{ key: 'b', label: 'B' }] })
    })
    await nextTick()
    expect(content(unmatched.wrapper)).toBe('a')
  })

  it('formats input arrays and survives a throwing number formatter', async () => {
    const arrayInput = mountItem({
      model: { text: ['a', 'b'] },
      itemProps: { prop: 'text' },
      slot: (model) => h(ElInput, { modelValue: model.text })
    })
    await nextTick()
    expect(content(arrayInput.wrapper)).toBe('a;b')

    const number = mountItem({
      model: { count: 5 },
      itemProps: { prop: 'count' },
      slot: (model) =>
        h(ElInputNumber, {
          modelValue: model.count,
          formatter: () => {
            throw new Error('boom')
          }
        })
    })
    await nextTick()
    expect(content(number.wrapper)).toBe('5')
  })

  it('collects grouped slot options and label-only options', async () => {
    const grouped = mountItem({
      model: { city: 'bj' },
      itemProps: { prop: 'city' },
      slot: (model) =>
        h(
          ElSelect,
          { modelValue: model.city },
          {
            default: () =>
              h(ElOptionGroup, { label: '华北' }, { default: () => [h(ElOption, { label: '北京', value: 'bj' })] })
          }
        )
    })
    await nextTick()
    expect(content(grouped.wrapper)).toBe('北京')

    const labelOnly = mountItem({
      model: { city: '上海' },
      itemProps: { prop: 'city' },
      slot: (model) =>
        h(ElSelect, { modelValue: model.city }, { default: () => [h(ElOption as any, { label: '上海' })] })
    })
    await nextTick()
    expect(content(labelOnly.wrapper)).toBe('上海')
  })

  it('renders without a parent form', async () => {
    const wrapper = mount(TextFormItem, { props: { text: true, value: '独立值', label: '名称' } })
    await nextTick()
    expect(wrapper.text()).toContain('独立值')
    wrapper.unmount()
  })

  it('falls back to the parent ElForm props when form context is unavailable', async () => {
    // 中文：Nuxt/Nitro 外置本包时可能拿不到 formContextKey，父级 ElForm 的 props 作为兜底。
    // English: Nuxt/Nitro may externalize this package and lose formContextKey;
    // the parent ElForm props act as the fallback.
    const FakeForm = defineComponent({
      name: 'ElForm',
      props: { model: { type: Object, required: true }, size: { type: String, default: undefined } },
      setup(_props, { slots }) {
        return () => h('div', slots.default?.())
      }
    })
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              FakeForm,
              { model: { name: 'Ada', tags: ['a', 'b'] } },
              {
                default: () => [
                  h(TextFormItem, { prop: 'name', text: true }),
                  h(TextFormItem, { prop: 'tags', text: true })
                ]
              }
            )
        }
      })
    )
    await nextTick()
    expect(wrapper.findAll('.ep-field-view__content').map((item) => item.text())).toEqual(['Ada', 'a;b'])
    wrapper.unmount()
  })

  it('detects table rows and removes the bottom margin', async () => {
    // 中文：用同名父组件验证父链识别，避免依赖 el-table 的布局实现。
    // English: A same-name parent verifies the chain lookup without relying on
    // el-table's layout implementation.
    const FakeTable = defineComponent({
      name: 'ElTable',
      setup(_props, { slots }) {
        return () => h('div', slots.default?.())
      }
    })
    const wrapper = mount(
      defineComponent({
        setup() {
          return () => h(FakeTable, null, { default: () => h(TextFormItem, { text: true, value: 'Vue' }) })
        }
      })
    )
    await nextTick()
    const item = wrapper.find('.ep-field-view--nowrap')
    expect(item.exists()).toBe(true)
    expect(item.attributes('style')).toContain('margin-bottom: 0')
    wrapper.unmount()
  })
})

describe('form item props', () => {
  it('forwards declared el-form-item props explicitly', async () => {
    const rules = [{ required: true, message: '请输入姓名' }]
    const { wrapper } = mountItem({
      text: false,
      model: { name: 'Vue' },
      itemProps: {
        prop: 'name',
        label: '姓名',
        labelWidth: 120,
        labelPosition: 'top',
        required: true,
        rules,
        error: '出错了',
        validateStatus: 'error',
        for: 'name-input',
        inlineMessage: true,
        showMessage: true,
        size: 'small'
      } as Record<string, unknown>,
      slot: (model) => h(ElInput, { modelValue: model.name })
    })
    await nextTick()
    const item = wrapper.findComponent(ElFormItem)
    expect(item.props('label')).toBe('姓名')
    expect(item.props('labelWidth')).toBe(120)
    expect(item.props('labelPosition')).toBe('top')
    expect(item.props('required')).toBe(true)
    expect(item.props('rules')).toEqual(rules)
    expect(item.props('error')).toBe('出错了')
    expect(item.props('validateStatus')).toBe('error')
    expect(item.props('for')).toBe('name-input')
    expect(item.props('inlineMessage')).toBe(true)
    expect(item.props('showMessage')).toBe(true)
    expect(item.props('size')).toBe('small')
    expect(wrapper.find('.ep-field-view--size-small').exists()).toBe(true)
    wrapper.unmount()
  })

  it('forwards an array prop to the inner ElFormItem unchanged', async () => {
    const { wrapper } = mountItem({
      text: false,
      model: { items: [{ name: 'A' }] },
      itemProps: { prop: ['items', '0', 'name'] },
      slot: (model) => h(ElInput, { modelValue: model.items[0].name })
    })
    await nextTick()
    expect(wrapper.findComponent(ElFormItem).props('prop')).toEqual(['items', '0', 'name'])
    wrapper.unmount()
  })

  it('keeps absent boolean props undefined', async () => {
    const { wrapper } = mountItem({
      text: false,
      model: { name: 'Vue' },
      itemProps: { prop: 'name' },
      slot: (model) => h(ElInput, { modelValue: model.name })
    })
    await nextTick()
    const item = wrapper.findComponent(ElFormItem)
    expect(item.props('required')).toBeUndefined()
    expect(item.props('inlineMessage')).toBeUndefined()
    expect(item.props('showMessage')).toBe(true)
    wrapper.unmount()
  })

  it('forwards label but skips rules in text mode', async () => {
    const { wrapper } = mountItem({
      text: true,
      model: { name: 'Vue' },
      itemProps: {
        prop: 'name',
        label: '姓名',
        required: true,
        rules: [{ required: true, message: '请输入姓名' }]
      },
      slot: (model) => h(ElInput, { modelValue: model.name })
    })
    await nextTick()
    const item = wrapper.findComponent(ElFormItem)
    expect(item.props('label')).toBe('姓名')
    expect(item.props('required')).toBe(false)
    expect(item.props('rules')).toEqual([])
    wrapper.unmount()
  })

  it('only defaults label-width to auto when no label is supplied', async () => {
    const withoutLabel = mountItem({
      text: false,
      model: { name: 'Vue' },
      itemProps: { prop: 'name' },
      slot: (model) => h(ElInput, { modelValue: model.name })
    })
    await nextTick()
    expect(withoutLabel.wrapper.findComponent(ElFormItem).props('labelWidth')).toBe('auto')
    withoutLabel.wrapper.unmount()

    const withLabel = mountItem({
      text: false,
      model: { name: 'Vue' },
      itemProps: { prop: 'name', label: '姓名' },
      slot: (model) => h(ElInput, { modelValue: model.name })
    })
    await nextTick()
    expect(withLabel.wrapper.findComponent(ElFormItem).props('labelWidth')).toBeUndefined()
    withLabel.wrapper.unmount()
  })
})

describe('long form', () => {
  it('switches a 200-field form to text mode', async () => {
    const fieldCount = 200
    const model = reactive(
      Object.fromEntries(Array.from({ length: fieldCount }, (_, index) => [`field${index}`, `值 ${index}`]))
    )
    const text = ref(false)

    const Host = defineComponent({
      name: 'LongFormHost',
      setup() {
        return () =>
          h(ElForm, { model, text: text.value } as Record<string, unknown>, {
            default: () =>
              Array.from({ length: fieldCount }, (_, index) =>
                h(TextFormItem, { prop: `field${index}`, label: `字段 ${index}` } as Record<string, unknown>, {
                  default: () => h(ElInput, { modelValue: model[`field${index}`] })
                })
              )
          })
      }
    })

    const wrapper = mount(Host)
    await nextTick()
    expect(wrapper.findAll('.ep-field-view__content')).toHaveLength(0)

    // 中文：切换耗时在 jsdom 中只用于防止量级回归；浏览器目标为 100ms。
    // English: The jsdom timing only guards against order-of-magnitude
    // regressions; the browser target is 100ms.
    const started = performance.now()
    text.value = true
    await settle()
    const elapsed = performance.now() - started

    expect(wrapper.findAll('.ep-field-view__content')).toHaveLength(fieldCount)
    expect(wrapper.text()).toContain('值 199')
    expect(elapsed).toBeLessThan(2000)
    wrapper.unmount()
  })
})
