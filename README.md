# ep-field-view

基于 Element Plus 的表单只读态组件：**写一次表单，编辑页与详情页自动切换**。

[![npm version](https://img.shields.io/npm/v/ep-field-view.svg)](https://www.npmjs.com/package/ep-field-view)
[![npm downloads](https://img.shields.io/npm/dm/ep-field-view.svg)](https://www.npmjs.com/package/ep-field-view)
[![license](https://img.shields.io/npm/l/ep-field-view.svg)](./LICENSE)

参考并致敬 [element-plus-readonly-form-item](https://github.com/fuchengwei/element-plus-readonly-form-item)（MIT），在其思路基础上重写并修复了轮询、空值、动态切换等问题。

## 特性

- **自动解析选项标签**：从插槽中的 `el-select`、`el-radio-group`、`el-checkbox-group`、`el-cascader`、`el-transfer`、`el-tree-select` 等组件提取 label，不再显示裸值。
- **日期 / 时间 / 范围格式化**：读取组件 `format` / `value-format`，回退到与 Element Plus 一致的内置格式。
- **只读继承与动态切换**：支持 `el-form readonly`、单字段覆盖，运行时切换立即生效（无定时器轮询）。
- **校验自动跳过**：只读字段不参与校验、不显示必填星号；切回编辑态自动恢复。
- **组件自定义显示**：直接渲染 `el-select` 的 `#label` 与 `el-radio` / `el-checkbox` 选中项的 VNode，保留图标、Tag 等富内容。
- **可扩展**：`formatter`、`readonly` 插槽、显式 `options` / `optionProps`。
- **主题化**：CSS 变量、内置主题、自定义主题类、暗色模式，默认跟随 Element Plus 变量。
- **TypeScript**：完整类型与 d.ts，ESM / UMD / CSS / sourcemap。
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

## 快速开始

```vue
<template>
  <el-form :model="model" :readonly="readonly" label-width="100px" label-suffix="：">
    <ReadonlyFormItem label="姓名" prop="name">
      <el-input v-model="model.name" />
    </ReadonlyFormItem>

    <ReadonlyFormItem label="角色" prop="role">
      <el-select v-model="model.role">
        <el-option label="管理员" value="admin" />
        <el-option label="访客" value="guest" />
      </el-select>
    </ReadonlyFormItem>

    <ReadonlyFormItem label="入职日期" prop="joinedAt">
      <el-date-picker v-model="model.joinedAt" type="date" />
    </ReadonlyFormItem>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ReadonlyFormItem } from 'ep-field-view'

const readonly = ref(true)
const model = reactive({
  name: '张三',
  role: 'admin',
  joinedAt: new Date(2024, 4, 20)
})
</script>
```

只读态将渲染：

| 字段     | 展示                                    |
| -------- | --------------------------------------- |
| 姓名     | 张三                                    |
| 角色     | 管理员（自动解析 `el-option` 的 label） |
| 入职日期 | 2024-05-20（自动读取日期格式）          |

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
<ReadonlyFormItem label="金额" prop="amount" theme="brand">
  <el-input-number v-model="model.amount" />
</ReadonlyFormItem>
```

```css
.ep-field-view--theme-brand {
  --ep-field-view-color: var(--el-color-primary);
  --ep-field-view-font-weight: 600;
}
```

暗色模式只需引入 `element-plus/theme-chalk/dark/css-vars.css` 并切换 `.dark`。

## API 摘要

| 参数                                         | 说明                            | 默认值               |
| -------------------------------------------- | ------------------------------- | -------------------- |
| `prop`                                       | model 字段路径，支持 `a.b[0].c` | —                    |
| `value`                                      | 显式显示值，优先于 model        | —                    |
| `readonly`                                   | 强制只读 / 编辑，不传则继承表单 | —                    |
| `emptyText` / `separator` / `rangeSeparator` | 空值、多值、范围文案            | `-` / `,` / `~`      |
| `dateFormat` / `timeFormat`                  | 日期 / 时间格式                 | 组件 `format` 或内置 |
| `formatter`                                  | 自定义文本格式化                | —                    |
| `options` / `optionProps`                    | 显式选项与字段映射              | —                    |
| `includeAffixes`                             | 拼接输入框前后缀插槽文本        | `true`               |
| `nowrap` / `skipValidation` / `theme`        | 表格省略 / 跳过校验 / 主题      | 自动 / `true` / `''` |
| `contentClass` / `contentStyle`              | 只读内容元素样式                | —                    |

其余 `el-form-item` 属性与插槽（`label`、`error` 等）原样透传。完整文档见 [docs](https://github.com/jktantan/ep-field-view/tree/main/docs)：

- [安装](https://github.com/jktantan/ep-field-view/blob/main/docs/guide/installation.md)
- [快速开始](https://github.com/jktantan/ep-field-view/blob/main/docs/guide/quick-start.md)
- [值解析规则](https://github.com/jktantan/ep-field-view/blob/main/docs/guide/value-resolution.md)
- [主题定制](https://github.com/jktantan/ep-field-view/blob/main/docs/guide/theming.md)
- [组件 API](https://github.com/jktantan/ep-field-view/blob/main/docs/components/readonly-form-item.md)
- [与参考项目的差异](https://github.com/jktantan/ep-field-view/blob/main/docs/guide/comparison.md)

## 开发

```bash
pnpm install
pnpm dev          # playground 演示页
pnpm docs:dev     # 文档
pnpm check        # prettier + eslint + stylelint + vue-tsc + vitest
pnpm build        # 库构建
pnpm docs:build   # 文档构建
```

## 开发者文档

设计、内部实现、开发环境、测试、发布与计划集中在 [`developer/`](https://github.com/jktantan/ep-field-view/blob/main/developer/README.md)，不进入用户文档站：

- [架构设计](https://github.com/jktantan/ep-field-view/blob/main/developer/design/architecture.md)
- [VNode 解析设计](https://github.com/jktantan/ep-field-view/blob/main/developer/design/vnode-resolution.md)
- [只读状态与校验设计](https://github.com/jktantan/ep-field-view/blob/main/developer/design/form-readonly.md)
- [开发环境](https://github.com/jktantan/ep-field-view/blob/main/developer/development/getting-started.md)
- [测试指南](https://github.com/jktantan/ep-field-view/blob/main/developer/development/testing.md)
- [贡献流程](https://github.com/jktantan/ep-field-view/blob/main/developer/development/contributing.md)
- [发布流程](https://github.com/jktantan/ep-field-view/blob/main/developer/development/releasing.md)
- [开发计划](https://github.com/jktantan/ep-field-view/blob/main/developer/plan/roadmap.md)
- [升级计划](https://github.com/jktantan/ep-field-view/blob/main/developer/plan/upgrade.md)
- [BUG 修正计划](https://github.com/jktantan/ep-field-view/blob/main/developer/plan/bugfix.md)
- [CHANGELOG](https://github.com/jktantan/ep-field-view/blob/main/CHANGELOG.md)

## 兼容性

| 依赖            | 版本         |
| --------------- | ------------ |
| Vue             | `>= 3.3.0`   |
| Element Plus    | `>= 2.6.0`   |
| Node.js（开发） | `>= 20.19.0` |

## License

[MIT](./LICENSE)。本项目参考了 element-plus-readonly-form-item，其版权声明与许可保留在 [NOTICE](./NOTICE) 中。
