import { describe, expect, it } from 'vitest'
import { getByPath, getObjectLabel, isEmptyValue, isSameValue, toText } from '../src/utils/value'
import { DEFAULT_CONFIG } from '../src/constants'
import { resolveConfig } from '../src/config'
import { DEFAULT_OPTION_PROPS } from '../src/constants'

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
