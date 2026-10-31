/**
 * 中文：按点号 / 方括号路径读取嵌套值。
 *
 * `getByPath(model, 'user.address[0].city')` 与
 * `getByPath(model, 'user.address.0.city')` 等价。
 *
 * English: Read a nested value from an object using a dot/bracket path.
 *
 * The two calls above are equivalent.
 */
export function getByPath(source: unknown, path?: string): unknown {
  if (!path) return source
  const segments = path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter((segment) => segment !== '')
  let current: unknown = source
  for (const segment of segments) {
    if (current === null || current === undefined) return undefined
    current = (current as Record<string, unknown>)[segment]
  }
  return current
}

/**
 * 中文：判断值是否为空。`0` 与 `false` 是有效值，不视为空。
 *
 * English: A value is empty when it renders as nothing in a form. `0` and
 * `false` are meaningful values and are NOT empty.
 */
export function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return true
  if (typeof value === 'number' && Number.isNaN(value)) return true
  if (value instanceof Date) return Number.isNaN(value.getTime())
  if (Array.isArray(value)) return value.length === 0
  if (value instanceof Map || value instanceof Set) return value.size === 0
  return false
}

/**
 * 中文：比较两个选项值。原始类型同时按严格值与字符串比较，`1` 与 `'1'` 视为相同。
 *
 * English: Compare two option values. Primitives are compared strictly and by
 * string representation, so `1` and `'1'` match.
 */
export function isSameValue(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true
  if (left === null || right === null || left === undefined || right === undefined) return false
  if (typeof left === 'object' || typeof right === 'object') return false
  return String(left) === String(right)
}

/**
 * 中文：为普通对象值取一个最佳展示文案。
 *
 * English: Best-effort label for a plain object value.
 */
export function getObjectLabel(value: object): string | undefined {
  const record = value as Record<string, unknown>
  for (const key of ['label', 'name', 'title', 'text']) {
    const candidate = record[key]
    if (typeof candidate === 'string' || typeof candidate === 'number') return String(candidate)
  }
  return undefined
}

/**
 * 中文：将原始值转换为字符串。
 *
 * English: Convert a primitive value to text.
 */
export function toText(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'bigint') return String(value)
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'symbol') return value.toString()
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object') return getObjectLabel(value) ?? JSON.stringify(value)
  return String(value)
}
