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

  return h(ElRate, { ...props, modelValue: numeric, disabled: true })
}
