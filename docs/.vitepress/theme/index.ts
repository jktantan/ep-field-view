import DefaultTheme from 'vitepress/theme'
import ElementPlus, { ID_INJECTION_KEY } from 'element-plus'
import EpFieldView from 'ep-field-view'
import type { Theme } from 'vitepress'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './custom.css'

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Stable ids for SSR hydration (Element Plus requirement).
    app.provide(ID_INJECTION_KEY, { prefix: 1024, current: 0 })
    app.use(ElementPlus)
    app.use(EpFieldView, {
      emptyText: '-',
      separator: '、',
      rangeSeparator: '至',
      activeText: '启用',
      inactiveText: '停用'
    })
  }
}

export default theme
