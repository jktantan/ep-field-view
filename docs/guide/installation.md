# 安装

## 环境要求

| 依赖                     | 版本         |
| ------------------------ | ------------ |
| Vue                      | `>= 3.3.0`   |
| Element Plus             | `>= 2.6.0`   |
| Node.js（仅构建 / 开发） | `>= 20.19.0` |

`vue` 与 `element-plus` 是 peer 依赖，不会被重复打包。`dayjs` 是运行时依赖，与 Element Plus 使用同一套日期格式化能力。

## 包管理器安装

::: code-group

```bash [pnpm]
pnpm add ep-field-view
```

```bash [npm]
npm install ep-field-view --save
```

```bash [yarn]
yarn add ep-field-view
```

:::

## 引入样式

组件样式独立发布在 `ep-field-view/style.css`，需要与 Element Plus 的样式一起引入：

```ts
import 'element-plus/dist/index.css'
import 'ep-field-view/style.css'
```

如果宿主项目使用按需引入（`unplugin-vue-components` + `unplugin-auto-import`），Element Plus 的组件样式会按需加载；本组件样式仍建议显式引入一次。

## 注册组件

### 全量安装（推荐）

```ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import EpFieldView from 'ep-field-view'
import App from './App.vue'

import 'element-plus/dist/index.css'
import 'ep-field-view/style.css'

createApp(App)
  .use(ElementPlus)
  .use(EpFieldView, {
    emptyText: '-',
    separator: '、',
    rangeSeparator: '至'
  })
  .mount('#app')
```

`app.use(EpFieldView, options)` 会完成两件事：

1. 提供全局配置（可通过 `emptyText`、`separator`、`rangeSeparator`、`dateFormat`、`timeFormat`、`theme` 等覆盖默认值）；
2. 全局注册 `<TextFormItem>` 组件。

### 局部引入

```vue
<script setup lang="ts">
import { TextFormItem } from 'ep-field-view'
</script>

<template>
  <TextFormItem label="姓名" prop="name">
    <el-input v-model="model.name" />
  </TextFormItem>
</template>
```

局部引入时，全局配置仍可通过 `app.use(EpFieldView, options)` 或 `provideEpFieldViewConfig` 提供。

### 浏览器直接引入

```html
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="https://unpkg.com/element-plus/dist/index.full.min.js"></script>
<script src="https://unpkg.com/dayjs/dayjs.min.js"></script>
<script src="https://unpkg.com/ep-field-view/dist/index.umd.cjs"></script>

<link rel="stylesheet" href="https://unpkg.com/element-plus/dist/index.css" />
<link rel="stylesheet" href="https://unpkg.com/ep-field-view/dist/style.css" />

<script>
  const app = Vue.createApp(App)
  app.use(ElementPlus)
  app.use(EpFieldView, { emptyText: '-' })
  app.mount('#app')
</script>
```

UMD 构建的全局变量名为 `EpFieldView`，外部依赖为 `Vue`、`ElementPlus` 与 `dayjs`。

## 下一步

- [快速开始](/guide/quick-start)
- [值解析规则](/guide/value-resolution)
- [主题定制](/guide/theming)
