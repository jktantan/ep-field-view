import { Comment, Fragment, Text, isVNode } from 'vue'
import type { VNode, VNodeChild } from 'vue'

interface ComponentType {
  name?: string
  __name?: string
}

/**
 * 中文：解析 VNode 的组件名（如果存在）。
 *
 * English: Resolve the component name of a VNode, if it has one.
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
 * 中文：读取 VNode 的 prop，同时兼容 camelCase 与 kebab-case。
 *
 * English: Read a prop from a VNode, accepting camelCase and kebab-case names.
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
 * 中文：将插槽子节点、模板 Fragment 与文本节点展开为 VNode 列表。
 *
 * English: Flatten slot children, template fragments and text nodes into a list
 * of VNodes.
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
 * 中文：解析 VNode 的子节点；当子节点被编译为 slots 对象时执行默认插槽。
 *
 * English: Resolve the children of a VNode, evaluating its default slot when
 * the children were compiled into a slots object.
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
 * 中文：返回 VNode、插槽结果或子节点数组的文本内容。
 *
 * English: Return the text content of a VNode, slot result or array of
 * children.
 */
export function getTextContent(input: unknown): string {
  const parts: string[] = []
  collectText(input, parts)
  return parts.join('').trim()
}

/**
 * 中文：执行组件的命名插槽并返回原始内容。与 `getNamedSlotText` 不同，
 * 这里保留 VNode，以便图标、Tag、自定义结构等富内容完整渲染。
 *
 * English: Evaluate a named slot and return its raw content. Unlike
 * `getNamedSlotText`, VNodes are preserved so rich content (icons, tags,
 * custom markup) renders as-is.
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
 * 中文：返回 VNode 的默认插槽原始内容。
 *
 * English: Return the raw default-slot content of a VNode.
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
 * 中文：执行组件的命名插槽并返回文本内容；插槽不存在或抛错时返回空字符串。
 *
 * English: Evaluate a named slot and return its text content. Returns an empty
 * string when the slot is missing or throws.
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
    // 中文：组件 children 被编译为 slots 对象时执行默认插槽，以获取文本。
    // English: Evaluate the default slot when children are a slots object.
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
  // 中文：选项文本位于组件子节点中，需要继续遍历；图标通常没有文本。
  // English: Option labels live in component children, so subtrees are
  // traversed; icons simply contribute no text.
  collectText(input.children, parts)
}

/**
 * 中文：深度优先查找第一个名称在 `names` 中的组件 VNode。只检查插槽树中
 * 已存在的 VNode，不会挂载或执行子组件。
 *
 * English: Depth-first search for the first component VNode whose name is in
 * `names`. Only VNodes already present in the slot tree are inspected, so the
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
 * 中文：沿父组件链向上查找匹配名称的组件。
 *
 * English: Walk up the parent component chain and return the first component
 * matching one of the given names.
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
