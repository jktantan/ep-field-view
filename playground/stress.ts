import { createApp, defineComponent, h, nextTick, reactive, ref } from 'vue'
import ElementPlus, { ElForm, ElInput } from 'element-plus'
import 'element-plus/dist/index.css'
import EpFieldView, { TextFormItem } from '../src'
import '../src/styles/index.css'

/**
 * 中文：200 个字段的长表单基准页，供 Playwright 测量文本切换耗时。
 * English: A 200-field long-form benchmark page for Playwright timing.
 */
const fieldCount = 200
const model = reactive(
  Object.fromEntries(Array.from({ length: fieldCount }, (_, index) => [`field${index}`, `值 ${index}`]))
)
const text = ref(false)

const App = defineComponent({
  setup() {
    return () =>
      h(ElForm, { model, text: text.value } as Record<string, unknown>, {
        default: () =>
          Array.from({ length: fieldCount }, (_, index) =>
            h(TextFormItem, { prop: `field${index}`, label: `字段 ${index}` } as Record<string, unknown>, {
              default: () => h(ElInput, { modelValue: model[`field${index}`] })
            })
          )
      })
  }
})

createApp(App).use(ElementPlus).use(EpFieldView).mount('#app')

declare global {
  interface Window {
    __stress?: { fieldCount: number; toggle: () => Promise<number> }
  }
}

// 中文：切换 text 并等待 MutationObserver 与渲染完成，返回毫秒耗时。
// English: Toggle text, wait for the MutationObserver and render, return ms.
window.__stress = {
  fieldCount,
  async toggle() {
    const started = performance.now()
    text.value = !text.value
    await nextTick()
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))
    return performance.now() - started
  }
}
