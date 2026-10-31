import { h } from 'vue'
import type { VNode, VNodeChild } from 'vue'
import { ElTag } from 'element-plus'
import type { TagProps } from 'element-plus'
import { getVNodeProp } from '../utils/vnode'
import { toText } from '../utils/value'
import type { FormatContext } from './types'

/**
 * 中文：`inputTagMode: 'tag'` 时，把 `el-input-tag` 的每个值渲染为只读
 * `el-tag`，并保留组件自身的 `tagType` / `tagEffect`。默认的 `text` 模式
 * 返回 `undefined`，回退到分隔符拼接的纯文本。
 *
 * English: When `inputTagMode` is `'tag'`, render each `el-input-tag` value as
 * a readonly `el-tag` and keep the component's `tagType` / `tagEffect`. The
 * default `text` mode returns `undefined` and falls back to the
 * separator-joined plain text.
 */
export function resolveInputTagDisplay(value: unknown, vnode: VNode, context: FormatContext): VNodeChild | undefined {
  if (context.inputTagMode !== 'tag') return undefined
  const values = Array.isArray(value) ? value : [value]
  if (values.length === 0) return undefined
  const type = getVNodeProp(vnode, 'tagType', 'tag-type') as TagProps['type'] | undefined
  const effect = getVNodeProp(vnode, 'tagEffect', 'tag-effect') as TagProps['effect'] | undefined
  return values.map((item) => h(ElTag, { type, effect, disableTransitions: true }, () => toText(item)))
}
