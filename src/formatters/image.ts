import { h } from 'vue'
import type { VNode, VNodeChild } from 'vue'
import { ElImage } from 'element-plus'
import { getVNodeProp } from '../utils/vnode'
import { toText } from '../utils/value'
import { formatGeneric } from './shared'
import type { FormatContext } from './types'

/**
 * 中文：格式化 `el-image` 的值。默认展示图片地址，多张图片使用 `separator`
 * 连接。
 *
 * English: Format an `el-image` value. Shows image URLs by default and joins
 * multiple images with `separator`.
 */
export function formatImage(value: unknown, vnode: VNode, context: FormatContext): string {
  const sources = normalizeImageSources(value) ?? normalizeImageSources(readImageSource(vnode))
  if (!sources) return formatGeneric(value, context)
  return sources.join(context.separator)
}

/**
 * 中文：`imageMode: 'image'` 时渲染只读的 `el-image`，保留 `fit`、`lazy` 与
 * 预览配置；默认文本模式返回 `undefined`，回退到地址文本。
 *
 * English: When `imageMode` is `'image'`, render readonly `el-image`s and keep
 * `fit`, `lazy` and preview settings. The default text mode returns `undefined`
 * and falls back to the URL text.
 */
export function resolveImageDisplay(value: unknown, vnode: VNode, context: FormatContext): VNodeChild | undefined {
  if (context.imageMode !== 'image') return undefined
  const sources = normalizeImageSources(value) ?? normalizeImageSources(readImageSource(vnode))
  if (!sources) return undefined

  const configuredPreview = getVNodeProp(vnode, 'previewSrcList', 'preview-src-list')
  const previewSrcList = Array.isArray(configuredPreview) && configuredPreview.length > 0 ? configuredPreview : sources
  const fit = getVNodeProp(vnode, 'fit') as 'fill' | 'contain' | 'cover' | 'none' | 'scale-down' | undefined
  const lazy = Boolean(getVNodeProp(vnode, 'lazy'))
  const previewTeleported = getVNodeProp(vnode, 'previewTeleported', 'preview-teleported')
  const zIndex = getVNodeProp(vnode, 'zIndex', 'z-index')

  return h(
    'span',
    { class: 'ep-field-view__images' },
    sources.map((src, index) => {
      // 中文：`el-image` 的 `fit` 在类型上是必填联合类型，但未传时应使用组件默认值。
      // English: `el-image`'s `fit` is a required union type, but absent props
      // should keep the component default, so build a loose props object.
      const imageProps: Record<string, unknown> = {
        src,
        alt: src,
        lazy,
        class: 'ep-field-view__image',
        previewSrcList,
        initialIndex: index,
        previewTeleported: previewTeleported === undefined ? true : Boolean(previewTeleported)
      }
      if (fit) imageProps.fit = fit
      if (zIndex !== undefined) imageProps.zIndex = zIndex
      return h(ElImage, imageProps)
    })
  )
}

/**
 * 中文：读取 `el-image` 的 `src`，作为 model 值为空时的兜底。
 *
 * English: Read `el-image`'s `src` as a fallback when the model value is empty.
 */
export function readImageSource(vnode: VNode): unknown {
  return getVNodeProp(vnode, 'src')
}

function normalizeImageSources(value: unknown): string[] | undefined {
  if (value === null || value === undefined || value === '') return undefined
  const items = Array.isArray(value) ? value : [value]
  const sources = items
    .map((item) => {
      if (typeof item === 'string') return item
      if (typeof item === 'number') return String(item)
      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>
        for (const key of ['src', 'url', 'name']) {
          const candidate = record[key]
          if (typeof candidate === 'string' && candidate) return candidate
        }
      }
      return toText(item)
    })
    .filter((item) => item !== '')
  return sources.length > 0 ? sources : undefined
}
