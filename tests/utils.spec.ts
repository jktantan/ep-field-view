import { describe, expect, it, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { Fragment, createCommentVNode, createTextVNode, defineComponent, h } from 'vue'
import type { App } from 'vue'
import { getByPath, getObjectLabel, isEmptyValue, isSameValue, toText } from '../src/utils/value'
import { DEFAULT_CONFIG } from '../src/constants'
import {
  EP_FIELD_VIEW_CONFIG_KEY,
  createConfig,
  installConfig,
  provideEpFieldViewConfig,
  resolveConfig,
  useEpFieldViewConfig
} from '../src/config'
import { DEFAULT_OPTION_PROPS } from '../src/constants'
import { observeFormText } from '../src/utils/form-text'
import { findOptionLabel, formatGeneric, readBoolean, readKey } from '../src/formatters/shared'
import { extractOptions, findOptionVNode } from '../src/formatters/options'
import type { FormatContext } from '../src/formatters/types'
import type { FieldViewOption } from '../src/types'
import {
  findComponentVNode,
  findParentComponentName,
  flattenVNodes,
  getComponentName,
  getDefaultSlotVNode,
  getNamedSlotText,
  getNamedSlotVNode,
  getTextContent,
  getVNodeProp,
  resolveVNodeChildren
} from '../src/utils/vnode'

describe('getByPath', () => {
  const source = {
    user: { name: 'Ada', addresses: [{ city: 'Shanghai' }] },
    plain: { nested: { value: 42 } }
  }

  it('reads dotted paths', () => {
    expect(getByPath(source, 'user.name')).toBe('Ada')
    expect(getByPath(source, 'plain.nested.value')).toBe(42)
  })

  it('supports bracket and numeric segments', () => {
    expect(getByPath(source, 'user.addresses[0].city')).toBe('Shanghai')
    expect(getByPath(source, 'user.addresses.0.city')).toBe('Shanghai')
  })

  it('returns undefined for missing paths and the source for an empty path', () => {
    expect(getByPath(source, 'user.missing.value')).toBeUndefined()
    expect(getByPath(source)).toBe(source)
  })
})

describe('isEmptyValue', () => {
  it('treats nullish, empty strings, empty arrays and invalid dates as empty', () => {
    expect(isEmptyValue(null)).toBe(true)
    expect(isEmptyValue(undefined)).toBe(true)
    expect(isEmptyValue('')).toBe(true)
    expect(isEmptyValue([])).toBe(true)
    expect(isEmptyValue(new Date('invalid'))).toBe(true)
    expect(isEmptyValue(new Set())).toBe(true)
  })

  it('keeps 0 and false', () => {
    expect(isEmptyValue(0)).toBe(false)
    expect(isEmptyValue(false)).toBe(false)
    expect(isEmptyValue('0')).toBe(false)
  })
})

describe('isSameValue', () => {
  it('compares primitives loosely across string/number', () => {
    expect(isSameValue(1, '1')).toBe(true)
    expect(isSameValue(1, 2)).toBe(false)
    expect(isSameValue('a', 'a')).toBe(true)
  })

  it('never treats distinct objects as equal', () => {
    expect(isSameValue({ a: 1 }, { a: 1 })).toBe(false)
    const object = { a: 1 }
    expect(isSameValue(object, object)).toBe(true)
  })
})

describe('toText and getObjectLabel', () => {
  it('renders primitives and object labels', () => {
    expect(toText('x')).toBe('x')
    expect(toText(0)).toBe('0')
    expect(toText(false)).toBe('false')
    expect(getObjectLabel({ label: '标签' })).toBe('标签')
    expect(getObjectLabel({ name: '名称' })).toBe('名称')
    expect(toText({ name: '名称' })).toBe('名称')
  })
})

describe('resolveConfig', () => {
  it('merges global options without sharing option key objects', () => {
    const config = resolveConfig({ emptyText: '暂无', separator: '、' })
    expect(config.emptyText).toBe('暂无')
    expect(config.separator).toBe('、')
    expect(config.rangeSeparator).toBe(DEFAULT_CONFIG.rangeSeparator)
    expect(config.optionProps).toEqual(DEFAULT_OPTION_PROPS)
    expect(config.optionProps).not.toBe(DEFAULT_OPTION_PROPS)
  })

  it('merges option key overrides', () => {
    const config = resolveConfig({ optionProps: { label: 'text' } })
    expect(config.optionProps.label).toBe('text')
    expect(config.optionProps.value).toBe('value')
  })
})

describe('observeFormText', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  function trackObservers() {
    const Original = globalThis.MutationObserver
    const created: MutationObserver[] = []
    vi.spyOn(globalThis, 'MutationObserver').mockImplementation(function (this: unknown, callback: MutationCallback) {
      const observer = new Original(callback)
      created.push(observer)
      return observer
    } as unknown as typeof MutationObserver)
    return created
  }

  async function flush(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 0))
  }

  it('shares one observer per form element and notifies every listener', async () => {
    const element = document.createElement('div')
    const created = trackObservers()
    const first = vi.fn()
    const second = vi.fn()

    const stopFirst = observeFormText(element, first)
    const stopSecond = observeFormText(element, second)
    expect(created).toHaveLength(1)

    element.setAttribute('text', 'true')
    await flush()
    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledTimes(1)

    // 中文：清理函数可重复调用，且只移除自己的订阅。
    // English: Cleanup is idempotent and only removes its own subscription.
    stopFirst()
    stopFirst()
    element.setAttribute('text', 'false')
    await flush()
    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledTimes(2)

    stopSecond()
  })

  it('disconnects after the last listener and recreates on demand', async () => {
    const element = document.createElement('div')
    const created = trackObservers()
    const onChange = vi.fn()

    const stop = observeFormText(element, onChange)
    stop()
    element.setAttribute('text', 'true')
    await flush()
    expect(onChange).not.toHaveBeenCalled()

    const stopAgain = observeFormText(element, onChange)
    expect(created).toHaveLength(2)
    element.setAttribute('text', 'false')
    await flush()
    expect(onChange).toHaveBeenCalledTimes(1)
    stopAgain()
  })

  it('returns a noop cleanup without an element', () => {
    expect(() => observeFormText(null, () => {})()).not.toThrow()
  })
})

describe('vnode helpers', () => {
  const Named = { name: 'ElDemo', render: () => null }
  const Unnamed = { render: () => null }

  it('resolves component names and props', () => {
    expect(getComponentName(null)).toBeUndefined()
    expect(getComponentName(h('div'))).toBe('div')
    expect(getComponentName(h(Named))).toBe('ElDemo')
    expect(getComponentName(h(Unnamed))).toBeUndefined()

    expect(getVNodeProp(null, 'a')).toBeUndefined()
    expect(getVNodeProp(h('div'), 'a')).toBeUndefined()
    expect(getVNodeProp(h('div', { fooBar: 1 }), 'fooBar', 'foo-bar')).toBe(1)
  })

  it('flattens slot children, fragments and primitives', () => {
    const child = h('span')
    expect(flattenVNodes(null)).toEqual([])
    expect(flattenVNodes(true)).toEqual([])
    expect(flattenVNodes([[child]])).toHaveLength(1)
    expect(flattenVNodes(h(Fragment, [child]))).toEqual([child])
    expect(flattenVNodes('text')).toEqual([])
  })

  it('resolves children from arrays, single vnodes and slots objects', () => {
    const child = h('span')
    expect(resolveVNodeChildren(null)).toEqual([])
    expect(resolveVNodeChildren(h('div', [child]))).toEqual([child])
    expect(resolveVNodeChildren(h('div', child))).toEqual([child])
    expect(resolveVNodeChildren(h('div', null, { default: () => [child] }))).toEqual([child])
  })

  it('collects text from vnodes and ignores comments', () => {
    expect(getTextContent('  hi  ')).toBe('hi')
    expect(getTextContent(0)).toBe('0')
    expect(getTextContent(10n)).toBe('10')
    expect(getTextContent([h('span', 'a'), 2, null])).toBe('a2')
    expect(getTextContent(createCommentVNode('x'))).toBe('')
    expect(getTextContent(createTextVNode('t'))).toBe('t')
    expect(getTextContent({ default: () => 'slot' })).toBe('slot')
    expect(getTextContent({ plain: true })).toBe('')
  })

  it('evaluates named slots defensively', () => {
    const scoped = h('div', null, {
      label: (scope?: unknown) => `值:${(scope as { value: string }).value}`
    })
    expect(getNamedSlotText(scoped, 'label', { value: 'x' })).toBe('值:x')
    expect(getNamedSlotText(scoped, 'missing')).toBe('')
    expect(getNamedSlotText(h('div'), 'label')).toBe('')
    expect(
      getNamedSlotText(
        h('div', null, {
          label: () => {
            throw new Error('boom')
          }
        }),
        'label'
      )
    ).toBe('')
    expect(getNamedSlotVNode(scoped, 'label', { value: 'x' })).toBeTruthy()
    expect(getNamedSlotVNode(h('div'), 'label')).toBeUndefined()
    expect(getNamedSlotVNode(h('div', null, { label: 'nope' }), 'label')).toBeUndefined()
    expect(
      getNamedSlotVNode(
        h('div', null, {
          label: () => {
            throw new Error('boom')
          }
        }),
        'label'
      )
    ).toBeUndefined()
  })

  it('returns default slot content in every shape', () => {
    const child = h('span')
    // 中文：`h` 会把单个 VNode 规范化为数组，这里手动构造单 VNode children。
    // English: `h` normalizes a single VNode into an array; build one manually.
    const singleChildVNode = Object.assign({}, h('div'), { children: child })
    expect(getDefaultSlotVNode(null)).toBeUndefined()
    expect(getDefaultSlotVNode(h('div', [child]))).toEqual([child])
    expect(getDefaultSlotVNode(h('div', []))).toBeUndefined()
    expect(getDefaultSlotVNode(singleChildVNode)).toBe(child)
    expect(getDefaultSlotVNode(h('div', () => child))).toBe(child)
    expect(getDefaultSlotVNode(h('div', null, { default: () => child }))).toBe(child)
    expect(getDefaultSlotVNode(h('div', null, { other: () => child }))).toBeUndefined()
  })

  it('finds components in a slot tree and the parent chain', () => {
    const target = h(Named)
    const tree = [h(Fragment, [h('span', [target])])]
    expect(findComponentVNode(tree, new Set(['ElDemo']))).toBe(target)
    expect(findComponentVNode(tree, new Set(['Missing']))).toBeNull()

    const grandParent = { type: Named, parent: null }
    const instance = { parent: { type: { name: 'ElForm' }, parent: grandParent } }
    expect(findParentComponentName(instance, new Set(['ElForm']))).toBe('ElForm')
    expect(findParentComponentName(instance, new Set(['Missing']))).toBeUndefined()
    expect(findParentComponentName(null, new Set(['ElForm']))).toBeUndefined()
  })
})

describe('shared formatters', () => {
  const context: FormatContext = {
    config: resolveConfig(),
    separator: ';',
    rangeSeparator: '~',
    dateFormat: '',
    timeFormat: '',
    optionProps: DEFAULT_OPTION_PROPS,
    includeAffixes: true,
    rateMode: 'text',
    inputTagMode: 'text'
  }

  it('formats generic values', () => {
    expect(formatGeneric(['a', 1], context)).toBe('a;1')
    expect(formatGeneric(new Date(2024, 4, 20), context)).toBe('2024-05-20')
    expect(formatGeneric(true, context)).toBe('是')
    expect(formatGeneric(false, context)).toBe('否')
    expect(formatGeneric({ label: '对象' }, context)).toBe('对象')
    expect(formatGeneric({ id: 1 }, context)).toBe('{"id":1}')
    expect(formatGeneric(0, context)).toBe('0')
  })

  it('finds option labels including object values', () => {
    const options: FieldViewOption[] = [{ label: '北京', value: { id: 1 } }, { value: 'sh' }]
    expect(findOptionLabel(options, { id: 1 }, 'id')).toBe('北京')
    expect(findOptionLabel(options, { id: 2 }, 'id')).toBeUndefined()
    expect(findOptionLabel(options, 'sh')).toBe('sh')
    expect(findOptionLabel([{ label: 'x', value: { id: 1 } }], { id: 1 })).toBeUndefined()
  })

  it('reads mapped keys and booleans', () => {
    expect(readKey({ label: 'text' }, 'label')).toBe('text')
    expect(readKey({ label: 1 }, 'label')).toBeUndefined()
    expect(readKey(null, 'label')).toBeUndefined()
    expect(readBoolean({ multiple: true }, 'multiple')).toBe(true)
    expect(readBoolean(null, 'multiple')).toBe(false)
  })
})

describe('config', () => {
  it('creates reactive config and installs it on an app', () => {
    const app = { provide: vi.fn(), config: { globalProperties: {} } } as unknown as App
    const config = installConfig(app, { separator: '、' })
    expect(config.separator).toBe('、')
    expect(app.provide).toHaveBeenCalledWith(EP_FIELD_VIEW_CONFIG_KEY, config)
    expect((app.config.globalProperties as Record<string, unknown>).$EpFieldView).toBe(config)

    const reactiveConfig = createConfig()
    expect(reactiveConfig.emptyText).toBe(DEFAULT_CONFIG.emptyText)
  })

  it('reads the provided config below a subtree', () => {
    const Consumer = defineComponent({
      setup() {
        return () => h('span', useEpFieldViewConfig().separator)
      }
    })
    const Provider = defineComponent({
      setup() {
        provideEpFieldViewConfig({ separator: '|' })
        return () => h(Consumer)
      }
    })
    // 中文：provide 只对子组件生效，因此消费者必须是子组件。
    // English: provide only reaches descendants, so the consumer is a child.
    expect(mount(Provider).text()).toBe('|')
    expect(mount(Consumer).text()).toBe(DEFAULT_CONFIG.separator)
  })
})

describe('option extraction', () => {
  const Option = { name: 'ElOption', render: () => null }
  const OptionGroup = { name: 'ElOptionGroup', render: () => null }
  const Select = { name: 'ElSelect', render: () => null }
  const TreeSelect = { name: 'ElTreeSelect', render: () => null }

  it('returns no options without a vnode', () => {
    expect(extractOptions(null, DEFAULT_OPTION_PROPS)).toEqual([])
  })

  it('collects grouped slot options and skips optionless vnodes', () => {
    const tree = h(Select, null, {
      default: () => [
        h(OptionGroup, null, { default: () => [h(Option, { label: '北京', value: 'bj' })] }),
        h('div', null, [h(Option, { label: '上海', value: 'sh' })]),
        h(Option)
      ]
    })
    expect(extractOptions(tree, DEFAULT_OPTION_PROPS)).toEqual([
      { label: '北京', value: 'bj' },
      { label: '上海', value: 'sh' }
    ])
  })

  it('finds option vnodes and reports missing values', () => {
    const option = h(Option, { label: '北京', value: 'bj' })
    const tree = h(Select, null, { default: () => [option] })
    expect(findOptionVNode(tree, 'bj')).toBe(option)
    expect(findOptionVNode(tree, 'sh')).toBeUndefined()
  })

  it('flattens primitive tree data entries', () => {
    const tree = h(TreeSelect, {
      data: ['plain', { value: 'parent', label: '父级', children: ['child'] }]
    })
    expect(extractOptions(tree, DEFAULT_OPTION_PROPS)).toEqual([
      { label: 'plain', value: 'plain' },
      { label: '父级', value: 'parent', children: ['child'] },
      { label: 'child', value: 'child' }
    ])
  })
})
