import { describe, expect, it } from 'vitest'
import { ELEMENT_PLUS_STYLE_COMPONENTS, ELEMENT_PLUS_STYLE_PATHS, getElementPlusStylePath } from '../src/nuxt-styles'

describe('nuxt module Element Plus styles', () => {
  it('covers every Element Plus component imported inside the package', () => {
    expect(ELEMENT_PLUS_STYLE_COMPONENTS).toEqual(['ElFormItem', 'ElImage', 'ElRate', 'ElTag'])
  })

  it('maps component names to on-demand style entries', () => {
    expect(getElementPlusStylePath('ElFormItem')).toBe('element-plus/es/components/form-item/style/css')
    expect(getElementPlusStylePath('ElImage')).toBe('element-plus/es/components/image/style/css')
    expect(getElementPlusStylePath('ElRate')).toBe('element-plus/es/components/rate/style/css')
    expect(getElementPlusStylePath('ElTag')).toBe('element-plus/es/components/tag/style/css')
  })

  it('keeps the precomputed paths in sync with the component list', () => {
    expect(ELEMENT_PLUS_STYLE_PATHS).toEqual(ELEMENT_PLUS_STYLE_COMPONENTS.map(getElementPlusStylePath))
  })
})
