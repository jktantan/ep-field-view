import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'ep-field-view',
  description: 'Element Plus 表单只读态组件：写一次表单，编辑与详情自动切换。',
  base: process.env.DOCS_BASE || '/',
  cleanUrls: true,
  lastUpdated: true,
  vite: {
    resolve: {
      alias: {
        'ep-field-view': fileURLToPath(new URL('../../src/index.ts', import.meta.url))
      }
    }
  },
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/installation' },
      { text: '组件', link: '/components/readonly-form-item' },
      { text: '更新日志', link: '/changelog' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '安装', link: '/guide/installation' },
            { text: '快速开始', link: '/guide/quick-start' },
            { text: '值解析规则', link: '/guide/value-resolution' },
            { text: '主题定制', link: '/guide/theming' },
            { text: '与参考项目的差异', link: '/guide/comparison' }
          ]
        }
      ],
      '/components/': [
        {
          text: '组件',
          items: [{ text: 'ReadonlyFormItem', link: '/components/readonly-form-item' }]
        }
      ]
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/jktantan/ep-field-view' }],
    footer: {
      message: '基于 MIT 协议发布 · 参考并致谢 element-plus-readonly-form-item',
      copyright: 'Copyright © 2026 jktantan'
    },
    outline: { label: '本页目录', level: [2, 3] },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: { text: '最后更新' },
    darkModeSwitchLabel: '外观',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '返回顶部',
    search: { provider: 'local' }
  }
})
