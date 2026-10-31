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
 * 中文：观察元素上的 `text` 属性，返回清理函数；非 DOM 环境下安全返回。
 *
 * English: Observe the `text` attribute on an element. Returns a cleanup
 * function. Safe to call in non-DOM environments.
 */
export function observeFormText(element: Element | null | undefined, onChange: () => void): () => void {
  if (!element || typeof MutationObserver === 'undefined') return () => {}
  const observer = new MutationObserver(() => onChange())
  observer.observe(element, { attributes: true, attributeFilter: ['text'] })
  return () => observer.disconnect()
}
