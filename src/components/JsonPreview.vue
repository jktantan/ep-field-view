<template>
  <pre v-if="!empty" class="ep-field-view__json" :style="preStyle"><code>{{ json }}</code></pre>
  <span v-else class="ep-field-view__json-empty">{{ emptyText }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { isEmptyValue, toText } from '../utils/value'

/**
 * 中文：对象 / 数组字段的结构化 JSON 预览。用于 `TextFormItem` 的 `text`
 * 插槽，避免详情页直接显示 `[object Object]` 或单行 JSON。
 *
 * English: Structured JSON preview for object / array fields. Use it in
 * `TextFormItem`'s `text` slot to avoid `[object Object]` or one-line JSON in
 * detail pages.
 */
const props = withDefaults(
  defineProps<{
    /**
     * 中文：需要展示的值。
     *
     * English: Value to display.
     */
    value?: unknown
    /**
     * 中文：缩进空格数或字符串；`0` 输出单行 JSON。
     *
     * English: Indentation spaces or string; `0` renders compact JSON.
     */
    space?: number | string
    /**
     * 中文：空值文案，默认 `-`。
     *
     * English: Text shown for empty values. Defaults to `-`.
     */
    emptyText?: string
    /**
     * 中文：最大高度，超出后滚动；数字按像素处理。
     *
     * English: Maximum height with scrolling. Numbers are treated as pixels.
     */
    maxHeight?: number | string
  }>(),
  {
    value: undefined,
    space: 2,
    emptyText: '-',
    maxHeight: undefined
  }
)

const empty = computed(() => isEmptyValue(props.value))

const json = computed(() => {
  const text = JSON.stringify(toSerializable(props.value, new WeakSet()), null, props.space)
  return text ?? toText(props.value)
})

const preStyle = computed(() => {
  if (props.maxHeight === undefined) return undefined
  return {
    maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
  }
})

function toSerializable(value: unknown, seen: WeakSet<object>): unknown {
  if (value === null || value === undefined) return value
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'function' || typeof value === 'symbol') return String(value)
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? String(value) : value.toISOString()
  if (value instanceof Map) {
    return Object.fromEntries(
      [...value.entries()].map(([key, item]) => [String(key), toSerializable(item, seen)] as const)
    )
  }
  if (value instanceof Set) return [...value.values()].map((item) => toSerializable(item, seen))
  if (Array.isArray(value)) return value.map((item) => toSerializable(item, seen))
  if (typeof value !== 'object') return value

  // 中文：只记录祖先节点，重复引用仍完整展示，只有真正的环被替换。
  // English: Only ancestors are tracked, so shared references serialize fully
  // and only actual cycles become a placeholder.
  if (seen.has(value)) return '[Circular]'
  seen.add(value)
  const result: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value)) {
    result[key] = toSerializable(item, seen)
  }
  seen.delete(value)
  return result
}
</script>
