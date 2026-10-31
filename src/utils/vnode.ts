import { Comment, Fragment, Text, isVNode } from 'vue'
import type { VNode, VNodeChild } from 'vue'

interface ComponentType {
  name?: string
  __name?: string
}

/**
 * Resolve the component name of a VNode, if it has one.
 */
export function getComponentName(vnode: VNode | null | undefined): string | undefined {
  if (!vnode || vnode.type === null || vnode.type === undefined) return undefined
  if (typeof vnode.type === 'string') return vnode.type
  if (typeof vnode.type === 'object' || typeof vnode.type === 'function') {
    const type = vnode.type as ComponentType
    return type.name ?? type.__name
  }
  return undefined
}

/**
 * Read a prop from a VNode, accepting both camelCase and kebab-case names
 * (`activeText` / `active-text`).
 */
export function getVNodeProp(vnode: VNode | null | undefined, ...names: string[]): unknown {
  const props = vnode?.props
  if (!props) return undefined
  for (const name of names) {
    if (name in props) return props[name]
  }
  return undefined
}

/**
 * Flatten slot children, template fragments and text nodes into a list of
 * VNodes.
 */
export function flattenVNodes(input: unknown): VNode[] {
  if (input === null || input === undefined || typeof input === 'boolean') return []
  if (Array.isArray(input)) return input.flatMap((child) => flattenVNodes(child))
  if (isVNode(input)) {
    if (input.type === Fragment) return flattenVNodes(input.children)
    return [input]
  }
  return []
}

/**
 * Resolve the children of a VNode, evaluating its default slot when the
 * children were compiled into a slots object.
 */
export function resolveVNodeChildren(vnode: VNode | null | undefined): VNode[] {
  if (!vnode) return []
  const { children } = vnode
  if (Array.isArray(children) || isVNode(children)) return flattenVNodes(children)
  if (children && typeof children === 'object') {
    const defaultSlot = (children as Record<string, unknown>).default
    if (typeof defaultSlot === 'function') {
      return flattenVNodes((defaultSlot as () => unknown)())
    }
  }
  return []
}

/**
 * Return the text content of a VNode, slot result or array of children.
 */
export function getTextContent(input: unknown): string {
  const parts: string[] = []
  collectText(input, parts)
  return parts.join('').trim()
}

/**
 * Evaluate a named slot of a component VNode and return its raw content.
 * Unlike `getNamedSlotText`, this keeps the rendered VNodes so rich content
 * (icons, tags, custom markup) is preserved.
 */
export function getNamedSlotVNode(
  vnode: VNode | null | undefined,
  name: string,
  scope?: unknown
): VNodeChild | undefined {
  const { children } = vnode ?? {}
  if (!children || typeof children !== 'object' || Array.isArray(children) || isVNode(children)) {
    return undefined
  }
  const slot = (children as Record<string, unknown>)[name]
  if (typeof slot !== 'function') return undefined
  try {
    return (slot as (slotScope?: unknown) => VNodeChild)(scope)
  } catch {
    return undefined
  }
}

/**
 * Return the raw default-slot content of a VNode.
 */
export function getDefaultSlotVNode(vnode: VNode | null | undefined): VNodeChild | undefined {
  const { children } = vnode ?? {}
  if (typeof children === 'function') return (children as () => VNodeChild)()
  if (Array.isArray(children)) return children.length > 0 ? children : undefined
  if (isVNode(children)) return children
  if (children && typeof children === 'object') {
    const slot = (children as Record<string, unknown>).default
    if (typeof slot === 'function') {
      return (slot as () => VNodeChild)()
    }
  }
  return undefined
}

/**
 * Evaluate a named slot of a component VNode and return its text content.
 * Returns an empty string when the slot does not exist or throws.
 */
export function getNamedSlotText(vnode: VNode | null | undefined, name: string, scope?: unknown): string {
  const { children } = vnode ?? {}
  if (!children || typeof children !== 'object' || Array.isArray(children) || isVNode(children)) {
    return ''
  }
  const slot = (children as Record<string, unknown>)[name]
  if (typeof slot !== 'function') return ''
  try {
    return getTextContent((slot as (slotScope?: unknown) => unknown)(scope))
  } catch {
    return ''
  }
}

function collectText(input: unknown, parts: string[]): void {
  if (input === null || input === undefined || typeof input === 'boolean') return
  if (typeof input === 'string' || typeof input === 'number' || typeof input === 'bigint') {
    parts.push(String(input))
    return
  }
  if (Array.isArray(input)) {
    input.forEach((child) => collectText(child, parts))
    return
  }
  if (typeof input === 'object') {
    // Compiled component children are a slots object. Evaluate its default
    // slot so text inside `<el-radio>` / `<el-checkbox>` is picked up.
    const slot = (input as Record<string, unknown>).default
    if (typeof slot === 'function') {
      collectText((slot as () => unknown)(), parts)
      return
    }
  }
  if (!isVNode(input)) return
  if (input.type === Comment) return
  if (input.type === Text || input.type === Fragment) {
    collectText(input.children, parts)
    return
  }
  // Option labels live in the children of `<el-radio>` / `<el-checkbox>` /
  // `<el-option>`, so component subtrees must be traversed as well. Icons and
  // other components simply contribute no text.
  collectText(input.children, parts)
}

/**
 * Depth-first search for the first component VNode whose name is in `names`.
 * Only VNodes that are already present in the slot tree are inspected, so the
 * search never mounts or evaluates child components.
 */
export function findComponentVNode(vnodes: VNode[], names: Set<string>): VNode | null {
  for (const vnode of vnodes) {
    if (vnode.type === Fragment) {
      const found = findComponentVNode(flattenVNodes(vnode.children), names)
      if (found) return found
      continue
    }
    const name = getComponentName(vnode)
    if (name && names.has(name)) return vnode
    const children = resolveVNodeChildren(vnode)
    if (children.length > 0) {
      const found = findComponentVNode(children, names)
      if (found) return found
    }
  }
  return null
}

/**
 * Walk up the parent component chain and return the first component matching
 * one of the given names.
 */
export function findParentComponentName(
  instance: { parent: { type: unknown; parent: unknown } | null } | null | undefined,
  names: Set<string>
): string | undefined {
  let current = instance?.parent ?? null
  while (current) {
    const type = current.type as ComponentType | null
    const name = type?.name ?? type?.__name
    if (name && names.has(name)) return name
    current = current.parent as typeof current
  }
  return undefined
}
