/**
 * `el-form` does not declare a `readonly` prop, so it ends up as a fallthrough
 * attribute. Vue exposes component attrs as a plain (non-reactive) object on
 * the internal instance, which means a `computed` reading it never invalidates
 * when the attribute changes.
 *
 * To support toggling read-only mode at runtime we read the attribute once for
 * the initial value and then observe it on the form element with a
 * MutationObserver. That keeps the behaviour reactive without polling.
 */
export function readFormReadonly(attrs: Record<string, unknown> | undefined | null): boolean {
  if (!attrs) return false
  const raw = attrs.readonly
  if (raw === undefined || raw === null || raw === false || raw === 'false') return false
  return true
}

/**
 * Observe `readonly` attribute changes on the given element.
 * Returns a cleanup function. Safe to call in non-DOM environments.
 */
export function observeFormReadonly(element: Element | null | undefined, onChange: () => void): () => void {
  if (!element || typeof MutationObserver === 'undefined') return () => {}
  const observer = new MutationObserver(() => onChange())
  observer.observe(element, { attributes: true, attributeFilter: ['readonly'] })
  return () => observer.disconnect()
}
