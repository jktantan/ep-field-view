import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import JsonPreview from '../src/components/JsonPreview.vue'

function render(props: Record<string, unknown>) {
  return mount(JsonPreview, { props })
}

describe('JsonPreview', () => {
  it('renders objects with indentation', () => {
    const wrapper = render({ value: { name: 'Ada', tags: ['vue', 'ts'] } })
    const json = wrapper.find('.ep-field-view__json')
    expect(json.exists()).toBe(true)
    expect(json.text()).toContain('"name": "Ada"')
    expect(json.text()).toContain('\n')
    expect(wrapper.find('code').exists()).toBe(true)
  })

  it('supports compact output and a maximum height', () => {
    const wrapper = render({ value: { a: 1 }, space: 0, maxHeight: 120 })
    expect(wrapper.find('.ep-field-view__json').text()).toBe('{"a":1}')
    expect(wrapper.find('.ep-field-view__json').attributes('style')).toContain('max-height: 120px')
  })

  it('serializes dates, maps, sets and bigints', () => {
    const wrapper = render({
      value: {
        date: new Date(Date.UTC(2024, 4, 20)),
        map: new Map([['a', 1]]),
        set: new Set([1, 2]),
        big: BigInt(10)
      },
      space: 0
    })
    const text = wrapper.find('.ep-field-view__json').text()
    expect(text).toContain('"2024-05-20T00:00:00.000Z"')
    expect(text).toContain('"map":{"a":1}')
    expect(text).toContain('"set":[1,2]')
    expect(text).toContain('"big":"10"')
  })

  it('replaces circular references', () => {
    const value: Record<string, unknown> = { name: 'Ada' }
    value.self = value
    const wrapper = render({ value, space: 0 })
    expect(wrapper.find('.ep-field-view__json').text()).toBe('{"name":"Ada","self":"[Circular]"}')
  })

  it('shows emptyText for empty values', () => {
    expect(render({ value: null }).find('.ep-field-view__json-empty').text()).toBe('-')
    expect(render({ value: [], emptyText: '暂无数据' }).find('.ep-field-view__json-empty').text()).toBe('暂无数据')
  })

  it('renders an empty object instead of emptyText', () => {
    expect(render({ value: {}, space: 0 }).find('.ep-field-view__json').text()).toBe('{}')
  })
})
