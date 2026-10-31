# ep-field-view

基于 Element Plus 的**表单文本模式组件**：**写一次表单，编辑页与详情页自动切换**。

[![npm version](https://img.shields.io/npm/v/ep-field-view.svg)](https://www.npmjs.com/package/ep-field-view)
[![npm downloads](https://img.shields.io/npm/dm/ep-field-view.svg)](https://www.npmjs.com/package/ep-field-view)
[![license](https://img.shields.io/npm/l/ep-field-view.svg)](./LICENSE)

参考并致敬 [element-plus-readonly-form-item](https://github.com/fuchengwei/element-plus-readonly-form-item)（MIT），在其思路基础上重写并修复了轮询、空值、动态切换等问题。

## 三种状态

Element Plus 的表单字段有三种相互独立的状态：

| 状态       | 控制方式                                                       | 表现                       |
| ---------- | -------------------------------------------------------------- | -------------------------- |
| `disabled` | `el-form` / `el-form-item` / 表单控件的 `disabled`             | 控件禁用                   |
| `readonly` | Element Plus 原生 `readonly`（例如 `el-input` 的 `readonly`）  | 控件可见、不可编辑         |
| `text`     | `TextFormItem` 的 `text` prop，或父级 `el-form` 的 `text` 属性 | 纯文本展示（本项目的能力） |

`text` 与 `disabled` / `readonly` **互不影响**。本组件不是把输入框置为只读，而是切换为纯文本展示。

## 特性

- **自动解析选项标签**：从插槽中的 `el-select`、`el-radio-group`、`el-checkbox-group`、`el-cascader`、`el-transfer`、`el-tree-select` 等组件提取 label，不再显示裸值。
- **日期 / 时间 / 范围格式化**：读取组件 `format` / `value-format`，回退到与 Element Plus 一致的内置格式。
- **文本模式继承与动态切换**：支持 `el-form text`、单字段覆盖，运行时切换立即生效（无定时器轮询）。
- **校验自动跳过**：文本模式字段不参与校验、不显示必填星号；切回编辑态自动恢复。
- **组件自定义显示**：直接渲染 `el-select` 的 `#label` 与 `el-radio` / `el-checkbox` 选中项的 VNode，保留图标、Tag 等富内容。
- **可扩展**：`formatter`、`text` 插槽、显式 `options` / `optionProps`。
- **格式化预设**：金额、百分比、日期、字典映射，直接传给 `formatter`。
- **结构化展示**：`JsonPreview` 以缩进 JSON 展示对象 / 数组；`ElUpload` 显示文件名，`ElImage` 支持图片预览。
- **命名空间适配**：支持 `el-config-provider` 的 `namespace`，变量与 form-item 样式同步适配。
- **多值分隔符可配**：默认 `;`，可按语言或产品规范覆盖。
- **评分显示可配**：默认分数文本，`rateMode="rate"` 渲染禁用状态的 `el-rate`，保留自定义图标/图片。
- **主题化**：CSS 变量、内置主题、自定义主题类、暗色模式，默认跟随 Element Plus 变量。
- **TypeScript**：完整类型与 d.ts，ESM / UMD / CSS。
- **表格友好**：`el-table` 内自动去除间距并单行省略。

## 安装

```bash
pnpm add ep-field-view
# 或 npm install ep-field-view --save
```

`vue >= 3.3.0` 与 `element-plus >= 2.6.0` 为 peer 依赖。

```ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import EpFieldView from 'ep-field-view'
import App from './App.vue'

import 'element-plus/dist/index.css'
import 'ep-field-view/style.css'

createApp(App)
  .use(ElementPlus)
  .use(EpFieldView, { emptyText: '-', separator: '、', rangeSeparator: '至' })
  .mount('#app')
```

### Nuxt 3 / 4

Nuxt 3 与 Nuxt 4 使用同一个模块入口：

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@element-plus/nuxt', 'ep-field-view/nuxt'],
  epFieldView: {
    emptyText: '-',
    separator: '、'
  }
})
```

模块会把组件注册进 Nuxt 的组件系统（自动导入并生成 `components.d.ts`），因此模板中的 `<TextFormItem>` / `<JsonPreview>` 有类型；配置也会透传，`epFieldView` 在 Nuxt 配置中有完整类型提示。

模块还会补上包内直接使用的 Element Plus 组件样式（`el-form-item`、`el-image`、`el-rate`、`el-tag`）：`@element-plus/nuxt` 的模板扫描只处理项目模板里的 `<el-*>`，看不到包内源码的静态 import。若宿主自行管理这些样式，可设置 `epFieldView.elementPlusStyles: false` 关闭。详见 [Nuxt 3 / 4 与 SSR](./guide/ssr.md)。

## 快速开始

```vue
<template>
  <el-form :model="model" :text="textMode" label-width="100px" label-suffix="：">
    <TextFormItem label="姓名" prop="name">
      <el-input v-model="model.name" />
    </TextFormItem>

    <TextFormItem label="角色" prop="role">
      <el-select v-model="model.role">
        <el-option label="管理员" value="admin" />
        <el-option label="访客" value="guest" />
      </el-select>
    </TextFormItem>

    <TextFormItem label="入职日期" prop="joinedAt">
      <el-date-picker v-model="model.joinedAt" type="date" />
    </TextFormItem>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { TextFormItem } from 'ep-field-view'

const textMode = ref(true)
const model = reactive({
  name: '张三',
  role: 'admin',
  joinedAt: new Date(2024, 4, 20)
})
</script>
```

文本模式将渲染：

| 字段     | 展示                                    |
| -------- | --------------------------------------- |
| 姓名     | 张三                                    |
| 角色     | 管理员（自动解析 `el-option` 的 label） |
| 入职日期 | 2024-05-20（自动读取日期格式）          |

也可以只让单个字段进入文本模式：

```vue
<TextFormItem label="创建时间" prop="createdAt" text>
  <el-date-picker v-model="model.createdAt" type="datetime" />
</TextFormItem>
```

## 主题化

组件默认使用 Element Plus 的语义变量，可直接覆盖：

```css
.my-detail .ep-field-view {
  --ep-field-view-color: var(--el-text-color-primary);
  --ep-field-view-font-size: 14px;
  --ep-field-view-empty-color: var(--el-text-color-placeholder);
}
```

内置主题：`compact`、`bold`、`plain`。传入任意 `theme` 会生成 `ep-field-view--theme-{name}` 类，宿主自行定义：

```vue
<TextFormItem label="金额" prop="amount" theme="brand">
  <el-input-number v-model="model.amount" />
</TextFormItem>
```

```css
.ep-field-view--theme-brand {
  --ep-field-view-color: var(--el-color-primary);
  --ep-field-view-font-weight: 600;
}
```

暗色模式只需引入 `element-plus/theme-chalk/dark/css-vars.css` 并切换 `.dark`。字体与行高遵循 Element Plus：`small` 字号 12px，`default` / `large` 14px；最小行高 24 / 32 / 40px。

## API 摘要

| 参数                                         | 说明                                     | 默认值               |
| -------------------------------------------- | ---------------------------------------- | -------------------- |
| `prop`                                       | model 字段路径，支持 `a.b[0].c`          | —                    |
| `value`                                      | 显式显示值，优先于 model                 | —                    |
| `text`                                       | 文本模式；不传则继承表单的 `text` 属性   | —                    |
| `emptyText` / `separator` / `rangeSeparator` | 空值、多值、范围文案                     | `-` / `;` / `~`      |
| `dateFormat` / `timeFormat`                  | 日期 / 时间格式                          | 组件 `format` 或内置 |
| `formatter`                                  | 自定义文本格式化                         | —                    |
| `options` / `optionProps`                    | 显式选项与字段映射                       | —                    |
| `includeAffixes`                             | 拼接输入框前后缀插槽文本                 | `true`               |
| `nowrap` / `skipValidation` / `theme`        | 表格省略 / 跳过校验 / 主题               | 自动 / `true` / `''` |
| `rateMode`                                   | 评分显示：`text` 分数 / `rate` 评分样式  | `text`               |
| `inputTagMode`                               | 输入标签：`text` 文本 / `tag` 只读标签   | `text`               |
| `imageMode`                                  | 图片显示：`text` 地址 / `image` 图片预览 | `text`               |
| `contentClass` / `contentStyle`              | 文本内容元素样式                         | —                    |

其余 `el-form-item` 属性与插槽（`label`、`error` 等）原样透传。完整文档见 [文档站](https://jktantan.github.io/ep-field-view/) 或 [docs 目录](https://github.com/jktantan/ep-field-view/tree/main/docs)：

- [安装](https://github.com/jktantan/ep-field-view/blob/main/docs/guide/installation.md)
- [快速开始](https://github.com/jktantan/ep-field-view/blob/main/docs/guide/quick-start.md)
- [值解析规则](https://github.com/jktantan/ep-field-view/blob/main/docs/guide/value-resolution.md)
- [格式化预设](https://github.com/jktantan/ep-field-view/blob/main/docs/guide/presets.md)
- [主题定制](https://github.com/jktantan/ep-field-view/blob/main/docs/guide/theming.md)
- [组件 API](https://github.com/jktantan/ep-field-view/blob/main/docs/components/text-form-item.md)
- [JsonPreview](https://github.com/jktantan/ep-field-view/blob/main/docs/components/json-preview.md)
- [与参考项目的差异](https://github.com/jktantan/ep-field-view/blob/main/docs/guide/comparison.md)

## 开发者文档

设计、内部实现、开发环境、测试、发布与计划集中在 [`developer/`](https://github.com/jktantan/ep-field-view/blob/main/developer/README.md)，不进入用户文档站：

- [架构设计](https://github.com/jktantan/ep-field-view/blob/main/developer/design/architecture.md)
- [VNode 解析设计](https://github.com/jktantan/ep-field-view/blob/main/developer/design/vnode-resolution.md)
- [文本模式与校验设计](https://github.com/jktantan/ep-field-view/blob/main/developer/design/form-text.md)
- [开发环境](https://github.com/jktantan/ep-field-view/blob/main/developer/development/getting-started.md)
- [测试指南](https://github.com/jktantan/ep-field-view/blob/main/developer/development/testing.md)
- [贡献流程](https://github.com/jktantan/ep-field-view/blob/main/developer/development/contributing.md)
- [发布流程](https://github.com/jktantan/ep-field-view/blob/main/developer/development/releasing.md)
- [开发计划](https://github.com/jktantan/ep-field-view/blob/main/developer/plan/roadmap.md)
- [升级计划](https://github.com/jktantan/ep-field-view/blob/main/developer/plan/upgrade.md)
- [BUG 修正计划](https://github.com/jktantan/ep-field-view/blob/main/developer/plan/bugfix.md)
- [CHANGELOG](https://github.com/jktantan/ep-field-view/blob/main/CHANGELOG.md)

## 开发

```bash
pnpm install
pnpm dev          # playground 演示页
pnpm docs:dev     # 文档
pnpm check        # prettier + eslint + stylelint + vue-tsc + vitest
pnpm build        # 库构建
pnpm docs:build   # 文档构建
pnpm release:dry  # 发布预演（release-it）
```

## 兼容性

| 依赖            | 版本          |
| --------------- | ------------- |
| Vue             | `>= 3.3.0`    |
| Element Plus    | `>= 2.6.0`    |
| Nuxt（可选）    | `3.x` / `4.x` |
| Node.js（开发） | `>= 20.19.0`  |

## License

[MIT](./LICENSE)。本项目参考了 element-plus-readonly-form-item，其版权声明与许可保留在 [NOTICE](./NOTICE) 中。
