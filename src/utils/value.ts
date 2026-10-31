/**
 * Read a nested value from an object using a dot/bracket path.
 *
 * `getByPath(model, 'user.address[0].city')` and
 * `getByPath(model, 'user.address.0.city')` are equivalent.
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
 * A value is considered empty when it renders as nothing in a form. `0` and
 * `false` are meaningful values and are therefore NOT empty.
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
 * Compare two option values. Primitives are compared both strictly and by
 * string representation so that `1` and `'1'` match, as they do in Element Plus
 * selects.
 */
export function isSameValue(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true
  if (left === null || right === null || left === undefined || right === undefined) return false
  if (typeof left === 'object' || typeof right === 'object') return false
  return String(left) === String(right)
}

/**
 * Best-effort label for a plain object value.
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
 * Convert a primitive value to text.
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
