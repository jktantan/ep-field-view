/**
 * 中文：`el-form` 没有声明 `text` prop，因此文本模式开关作为 fallthrough
 * attribute 传入（`<el-form :text="true">`）。Vue 实例的 attrs 是普通对象，
 * 不是响应式的，`computed` 读取它不会在属性变化时失效。
 *
 * 初始值读取一次，挂载后用 MutationObserver 观察表单元素，保持响应式且不轮询。
 * Element Plus 原生的 `readonly` 是另一种状态，这里刻意不使用它。
 *
 * English: `el-form` does not declare a `text` prop, so the text switch is
 * passed as a fallthrough attribute. Vue exposes component attrs as a plain
 * (non-reactive) object, so a `computed` would never invalidate on change.
 *
 * We read the attribute once for the initial value and observe the form element
 * with a MutationObserver, keeping it reactive without polling. Element Plus'
 * native `readonly` state is separate and deliberately not used here.
 */
export function readFormText(attrs: Record<string, unknown> | undefined | null): boolean {
  if (!attrs) return false
  const raw = attrs.text
  if (raw === undefined || raw === null || raw === false || raw === 'false') return false
  return true
}

/**
 * 中文：一个表单元素上的共享观察器及其订阅者。
 *
 * English: The shared observer for one form element and its subscribers.
 */
interface FormTextObservation {
  observer: MutationObserver
  listeners: Set<() => void>
}

/**
 * 中文：按表单元素缓存观察器。长表单通常有大量 `TextFormItem`，每个字段
 * 单独创建 `MutationObserver` 会成倍增加观察开销；同一表单只保留一个观察器，
 * 属性变化时统一通知所有字段。最后一个订阅者离开时断开观察器。
 *
 * English: Cache observers per form element. A long form usually contains many
 * `TextFormItem` fields, and one `MutationObserver` per field multiplies the
 * observation cost. Keep a single observer per form and notify every field on
 * change. Disconnect it when the last subscriber leaves.
 */
const observations = new WeakMap<Element, FormTextObservation>()

/**
 * 中文：观察元素上的 `text` 属性，返回清理函数；非 DOM 环境下安全返回。
 * 清理函数可重复调用。
 *
 * English: Observe the `text` attribute on an element. Returns a cleanup
 * function. Safe to call in non-DOM environments and safe to call twice.
 */
export function observeFormText(element: Element | null | undefined, onChange: () => void): () => void {
  if (!element || typeof MutationObserver === 'undefined') return () => {}
  let observation = observations.get(element)
  if (!observation) {
    const listeners = new Set<() => void>()
    const observer = new MutationObserver(() => {
      for (const listener of listeners) listener()
    })
    observer.observe(element, { attributes: true, attributeFilter: ['text'] })
    observation = { observer, listeners }
    observations.set(element, observation)
  }
  const listeners = observation.listeners
  listeners.add(onChange)
  return () => {
    if (!listeners.delete(onChange)) return
    if (listeners.size > 0) return
    observation.observer.disconnect()
    if (observations.get(element) === observation) observations.delete(element)
  }
}
