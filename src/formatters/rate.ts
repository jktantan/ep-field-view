import { h } from 'vue'
import type { VNode, VNodeChild } from 'vue'
import { ElRate } from 'element-plus'
import type { FormatContext } from './types'

/**
 * 中文：按 `rateMode` 渲染评分。`rate` 模式复用禁用状态的 el-rate，
 * 因此自定义图标 / 图片、颜色、半星等配置都会保留。
 *
 * English: Render `el-rate` according to `rateMode`. The `rate` mode reuses a
 * disabled `el-rate`, preserving custom icons/images, colors and half-star
 * settings.
 */
export function resolveRateDisplay(value: unknown, vnode: VNode, context: FormatContext): VNodeChild | undefined {
  if (context.rateMode !== 'rate') return undefined
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return undefined

  const props: Record<string, unknown> = {}
  for (const [key, prop] of Object.entries(vnode.props ?? {})) {
    if (key === 'modelValue' || key === 'disabled' || key.startsWith('on')) continue
    props[key] = prop
  }

  // 中文：禁用 `el-rate` 已不可交互；再移除焦点与辅助技术暴露，并配合
  // `.ep-field-view__rate` 的 `pointer-events: none`，避免文本态留下表单控件语义。
  // English: A disabled `el-rate` is already non-interactive; also remove focus
  // and assistive-technology exposure and pair it with `pointer-events: none` on
  // `.ep-field-view__rate` so text mode keeps no form-control semantics.
  return h(ElRate, {
    ...props,
    modelValue: numeric,
    disabled: true,
    class: 'ep-field-view__rate',
    'aria-hidden': 'true',
    tabindex: -1
  })
}
