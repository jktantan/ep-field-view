# 与参考项目的差异

本项目参考了 [element-plus-readonly-form-item](https://github.com/fuchengwei/element-plus-readonly-form-item)（MIT，Copyright © 2023 付成伟）的设计与实现思路，并在此基础上重写。

## 命名差异：readonly vs text

Element Plus 的表单字段已经有原生的 `disabled` 与 `readonly` 状态。本项目的定位不是再实现一个“只读”，而是第三种展示方式：**纯文本模式**，因此组件与 API 使用 `text` 命名：

| 能力           | 参考项目                     | 本项目                                                 |
| -------------- | ---------------------------- | ------------------------------------------------------ |
| 组件           | `ReadonlyFormItem`           | `TextFormItem`                                         |
| 模式开关       | `readonly` prop              | `text` prop                                            |
| 表单级开关     | `el-form` 的 `readonly` 属性 | `el-form` 的 `text` 扩展属性                           |
| 文本模式自定义 | 无                           | `#text` 插槽                                           |
| 全局属性       | `$ReadonlyFormItem`          | `$EpFieldView`                                         |
| 全局配置       | `emptyText`、`separator` 等  | 相同，并新增 `timeFormat` / `theme` / `optionProps` 等 |

三种状态的含义：

- `disabled`：表单控件禁用；
- `readonly`：Element Plus 原生只读（控件可见、不可编辑）；
- `text`：本项目的纯文本展示。

`text` 与 `disabled` / `readonly` 相互独立。**不要用 `el-form readonly` 驱动文本模式**。

## 迁移

参考项目的常用配置与值解析能力是对等的，但 API 名称不同，不是直接替换包名即可：

```diff
- import ReadonlyFormItem from 'element-plus-readonly-form-item'
+ import EpFieldView, { TextFormItem } from 'ep-field-view'
```

```diff
- app.use(ReadonlyFormItem, { emptyText: '-' })
+ app.use(EpFieldView, { emptyText: '-' })
```

```diff
- <el-form :model="model" :readonly="readonly">
+ <el-form :model="model" :text="textMode">
-   <ReadonlyFormItem label="姓名" prop="name">
+   <TextFormItem label="姓名" prop="name">
```

- `readonly` / `:readonly` → `text` / `:text`；
- `#readonly`（如果使用自定义只读内容）→ `#text`；
- `el-form readonly` → `el-form text`；
- 组件名 `ReadonlyFormItem` → `TextFormItem`。

## 主要改进

| 方面           | 参考项目                                 | 本项目                                                              |
| -------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| 值更新         | `setInterval` 每秒轮询 10 次             | 完全响应式；父组件更新时重新检查插槽 VNode                          |
| 动态切换       | 读取非响应式 attrs                       | `MutationObserver` 监听表单 `text` 属性                             |
| 空值           | `value \|\| emptyText`，`0`/`false` 被吞 | 显式空值判定，保留 `0` / `false`                                    |
| 校验           | 通过删除 vnode props 规避                | 文本模式字段不注册，切换时重建 `ElFormItem` 恢复校验                |
| 扩展性         | 仅内置格式化                             | `formatter`、`text` 插槽、显式 `options` / `optionProps`            |
| 自定义选中显示 | 提取文本                                 | 渲染 `el-select #label` / radio / checkbox 的 VNode，保留富内容     |
| 主题           | 无                                       | CSS 变量、内置主题、自定义主题类、暗色模式                          |
| 尺寸           | 无                                       | 跟随 `el-form` / `el-form-item` 的 `size`，与 Element Plus 字号一致 |
| 类型           | 手写 `index.d.ts`                        | 源码 TypeScript + 自动生成 d.ts                                     |
| 依赖           | `dayjs` + `default-passive-events`       | 仅 `dayjs`                                                          |
| 构建           | Vite 4                                   | Vite 8，ESM / UMD / CSS                                             |

## 行为差异

- **文本模式字段不注册校验**：默认 `skipValidation: true`。如果希望在文本模式仍参与校验，设置 `:skip-validation="false"`。
- **切换文本模式会重建 `ElFormItem`**：确保 Element Plus 重新注册字段与规则。瞬时校验状态（错误提示）会被清除；表单数据不受影响。
- **`value` 的显式判定**：显式传入 `value` 时优先于 model；如果是 `undefined`，仍会使用 `value` 而不是回退 model。需要回退时请移除字段。
- **选项解析时机**：文本值依赖插槽中静态声明的 `el-option` / `el-radio` 等。异步选项在父组件更新后同步，不进行轮询。
- **`el-option` 的 `#label` 不用于选中值**：与 Element Plus 行为一致；需要在文本模式显示富内容时，使用 `el-select` 的 `#label` 或 `TextFormItem` 的 `text` 插槽。
- **`dateFormat` 全局默认值**：默认为空，以便组件自身的 `format` 生效。若全局设置，会覆盖所有日期组件的显示格式。

## 未实现的能力

如果参考项目或其他实现中依赖以下能力，请评估后再迁移：

- `default-passive-events` 的全局事件处理；
- 通过修改 VNode props 来影响宿主渲染的 hack；
- 每秒轮询强制刷新。

这些能力在本项目中以更可预测的方式实现：响应式数据、MutationObserver 与显式插槽。
