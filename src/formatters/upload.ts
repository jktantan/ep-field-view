import type { VNode } from 'vue'
import { getVNodeProp } from '../utils/vnode'
import { isEmptyValue, toText } from '../utils/value'
import { formatGeneric } from './shared'
import type { FormatContext } from './types'

/**
 * 中文：格式化 `el-upload` 的文件列表。优先展示文件名，其次展示 URL；
 * 多个文件使用 `separator` 连接。
 *
 * English: Format an `el-upload` file list. File names are preferred, then
 * URLs; multiple files are joined with `separator`.
 */
export function formatUpload(value: unknown, vnode: VNode, context: FormatContext): string {
  const files = normalizeUploadFiles(value) ?? normalizeUploadFiles(readUploadFiles(vnode))
  if (!files) return formatGeneric(value, context)
  return files.map((item) => uploadFileText(item)).join(context.separator)
}

/**
 * 中文：读取 `el-upload` 的 `file-list`，作为 model 值为空时的兜底。
 *
 * English: Read `el-upload`'s `file-list` as a fallback when the model value is
 * empty.
 */
export function readUploadFiles(vnode: VNode): unknown {
  return getVNodeProp(vnode, 'fileList', 'file-list')
}

function normalizeUploadFiles(value: unknown): unknown[] | undefined {
  if (Array.isArray(value)) return value.length > 0 ? value : undefined
  if (isEmptyValue(value)) return undefined
  if (typeof value === 'string') return [value]
  if (typeof value === 'object') return [value]
  return undefined
}

function uploadFileText(item: unknown): string {
  if (item === null || item === undefined) return ''
  if (typeof item === 'string') return item
  if (typeof item !== 'object') return toText(item)

  // 中文：原生 `File` 与 `el-upload` 的 `UploadFile` / `UploadRawFile` 都带 name。
  // English: Native `File`, `UploadFile` and `UploadRawFile` all expose a name.
  const record = item as Record<string, unknown>
  if (typeof record.name === 'string' && record.name) return record.name
  if (typeof record.url === 'string' && record.url) return record.url
  const raw = record.raw
  if (raw && typeof raw === 'object' && typeof (raw as Record<string, unknown>).name === 'string') {
    return String((raw as Record<string, unknown>).name)
  }
  return toText(item)
}
