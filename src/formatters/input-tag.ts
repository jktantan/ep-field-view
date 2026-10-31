import { h } from 'vue'
import type { VNode, VNodeChild } from 'vue'
import { ElTag } from 'element-plus'
import type { TagProps } from 'element-plus'
import { getVNodeProp } from '../utils/vnode'
import { toText } from '../utils/value'
import type { FormatContext } from './types'

/**
 * 中文：`inputTagMode: 'tag'` 时，把 `el-input-tag` 的每个值渲染为只读
 * `el-tag`，并保留组件自身的 `tagType` / `tagEffect`。标签统一放入
 * `.ep-field-view__tags` 容器，由 CSS `gap` 提供与编辑态一致的间距与换行。
 * 默认的 `text` 模式返回 `undefined`，回退到分隔符拼接的纯文本。
 *
 * English: When `inputTagMode` is `'tag'`, render each `el-input-tag` value as
 * a readonly `el-tag` and keep the component's `tagType` / `tagEffect`. Tags
 * share an `.ep-field-view__tags` container so CSS `gap` provides the same
 * spacing and wrapping as edit mode. The default `text` mode returns
 * `undefined` and falls back to the separator-joined plain text.
 */
export function resolveInputTagDisplay(value: unknown, vnode: VNode, context: FormatContext): VNodeChild | undefined {
  if (context.inputTagMode !== 'tag') return undefined
  const values = Array.isArray(value) ? value : [value]
  if (values.length === 0) return undefined
  const type = getVNodeProp(vnode, 'tagType', 'tag-type') as TagProps['type'] | undefined
  const effect = getVNodeProp(vnode, 'tagEffect', 'tag-effect') as TagProps['effect'] | undefined
  return h(
    'span',
    { class: 'ep-field-view__tags' },
    values.map((item) => h(ElTag, { type, effect, disableTransitions: true }, () => toText(item)))
  )
}
