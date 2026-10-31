import { describe, expectTypeOf, it } from 'vitest'
import type { GlobalComponents } from 'vue'
import type { JsonPreview, TextFormItem, TextFormItemProps } from '../src'

/**
 * 中文：`app.use(EpFieldView)` 会全局注册组件，主入口必须同时增强
 * `GlobalComponents`，否则 Volar / vue-tsc 会把模板里的 `<TextFormItem>`
 * 当成未知标签。该测试由 `vue-tsc --noEmit` 执行，运行时为空断言。
 *
 * English: `app.use(EpFieldView)` registers the components globally, so the
 * main entry must also augment `GlobalComponents`. Otherwise Volar / vue-tsc
 * reports `<TextFormItem>` in templates as an unknown tag. This test is
 * enforced by `vue-tsc --noEmit`; the runtime assertions are no-ops.
 */
describe('global component types', () => {
  it('declares TextFormItem and JsonPreview for template type checking', () => {
    expectTypeOf<GlobalComponents['TextFormItem']>().toEqualTypeOf<typeof TextFormItem>()
    expectTypeOf<GlobalComponents['JsonPreview']>().toEqualTypeOf<typeof JsonPreview>()
  })
})

/**
 * 中文：`TextFormItem` 转发 `ElFormItem` 的属性，类型上必须同样可见，
 * 否则开启 `strictTemplates` 后 `<TextFormItem label="…">` 会报未知属性。
 *
 * English: `TextFormItem` forwards `ElFormItem` props, so the types must
 * expose them too. Otherwise `<TextFormItem label="...">` fails with
 * `strictTemplates`.
 */
describe('TextFormItem props', () => {
  it('includes forwarded el-form-item props', () => {
    expectTypeOf<TextFormItemProps['prop']>().toEqualTypeOf<string | string[] | undefined>()
    expectTypeOf<TextFormItemProps['label']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<TextFormItemProps['labelWidth']>().toEqualTypeOf<string | number | undefined>()
    expectTypeOf<TextFormItemProps['required']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<TextFormItemProps['showMessage']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<TextFormItemProps['size']>().toEqualTypeOf<'default' | 'large' | 'small' | '' | undefined>()
  })
})
