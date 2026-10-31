import { describe, expect, it } from 'vitest'
import { dateFormatter, dictFormatter, moneyFormatter, percentFormatter } from '../src/presets'
import type { FieldViewFormatterContext } from '../src/types'

function context(overrides: Partial<FieldViewFormatterContext> = {}): FieldViewFormatterContext {
  return {
    value: undefined,
    options: [],
    separator: ';',
    ...overrides
  }
}

describe('moneyFormatter', () => {
  it('formats numbers with grouping, precision and the default symbol', () => {
    const format = moneyFormatter()
    expect(format(1234.5, context())).toBe('¥1,234.50')
    expect(format('¥1,234.5', context())).toBe('¥1,234.50')
    expect(format(0, context())).toBe('¥0.00')
  })

  it('supports currency codes, symbol position and trimmed zeros', () => {
    expect(moneyFormatter({ locale: 'en-US', currency: 'USD' })(1234.5, context())).toBe('$1,234.50')
    expect(moneyFormatter({ symbol: '元', symbolPosition: 'suffix' })(12, context())).toBe('12.00元')
    expect(moneyFormatter({ precision: 2, trimTrailingZeros: true })(12, context())).toBe('¥12')
  })

  it('joins arrays and falls back for empty or invalid values', () => {
    const format = moneyFormatter()
    expect(format([1, 2], context({ separator: '、' }))).toBe('¥1.00、¥2.00')
    expect(format(null, context())).toBeNull()
    expect(format('', context())).toBeNull()
    expect(format('not-a-number', context())).toBe('not-a-number')
  })
})

describe('percentFormatter', () => {
  it('turns ratios into percentages', () => {
    const format = percentFormatter()
    expect(format(0.125, context())).toBe('12.5%')
    expect(format(0.5, context())).toBe('50%')
    expect(format(1, context())).toBe('100%')
  })

  it('supports a custom multiplier and precision', () => {
    expect(percentFormatter({ multiplier: 1 })(25, context())).toBe('25%')
    expect(percentFormatter({ multiplier: 1, precision: 1, trimTrailingZeros: false })(25, context())).toBe('25.0%')
    expect(percentFormatter({ useGrouping: false })(1234.5, context())).toBe('123450%')
  })

  it('joins arrays and falls back for empty or invalid values', () => {
    const format = percentFormatter()
    expect(format([0.1, 0.25], context({ separator: '/' }))).toBe('10%/25%')
    expect(format(undefined, context())).toBeNull()
    expect(format('n/a', context())).toBe('n/a')
  })
})

describe('dateFormatter', () => {
  it('formats dates, timestamps and parseable strings', () => {
    const format = dateFormatter('YYYY-MM-DD')
    expect(format(new Date(2024, 4, 20), context())).toBe('2024-05-20')
    expect(format(new Date(2024, 4, 20).getTime(), context())).toBe('2024-05-20')
    expect(format('2024/05/20', context())).toBe('2024-05-20')
  })

  it('keeps invalid strings and joins arrays', () => {
    const format = dateFormatter('YYYY-MM-DD')
    expect(format('not-a-date', context())).toBe('not-a-date')
    expect(format([new Date(2024, 0, 1), new Date(2024, 0, 2)], context({ separator: '~' }))).toBe(
      '2024-01-01~2024-01-02'
    )
    expect(format(null, context())).toBeNull()
  })
})

describe('dictFormatter', () => {
  const dictionary = { active: '启用', disabled: '停用' }

  it('maps values from objects, maps and option arrays', () => {
    expect(dictFormatter(dictionary)('active', context())).toBe('启用')
    expect(dictFormatter(new Map([['active', '启用']]))('active', context())).toBe('启用')
    expect(
      dictFormatter(
        [
          { key: 'active', name: '启用' },
          { key: 'disabled', name: '停用' }
        ],
        { valueKey: 'key', labelKey: 'name' }
      )('disabled', context())
    ).toBe('停用')
  })

  it('supports fallbacks and multiple values', () => {
    expect(dictFormatter(dictionary)('unknown', context())).toBe('unknown')
    expect(dictFormatter(dictionary, { fallback: 'empty' })('unknown', context())).toBeNull()
    expect(dictFormatter(dictionary, { fallback: '未知' })('unknown', context())).toBe('未知')
    expect(dictFormatter(dictionary, { fallback: (value) => `#${String(value)}` })('unknown', context())).toBe(
      '#unknown'
    )
    expect(dictFormatter(dictionary)(['active', 'disabled'], context({ separator: '、' }))).toBe('启用、停用')
    expect(dictFormatter(dictionary)([], context())).toBeNull()
  })

  it('matches numeric and string values like option resolution', () => {
    const format = dictFormatter({ 1: '一级', 2: '二级' })
    expect(format('1', context())).toBe('一级')
    expect(format(2, context())).toBe('二级')
  })
})
