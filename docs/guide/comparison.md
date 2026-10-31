# 与参考项目的差异

本项目参考了 [element-plus-readonly-form-item](https://github.com/fuchengwei/element-plus-readonly-form-item)（MIT，Copyright © 2023 付成伟）的设计与实现思路，并在此基础上重写。两者在常用 API 上保持兼容，同时修复了若干问题、补充了主题化与扩展能力。

## 保持兼容的部分

- 组件名 `ReadonlyFormItem` 与全局安装方式；
- 核心 props：`value`、`readonly`、`emptyText`、`separator`、`rangeSeparator`、`dateFormat`；
- 全局配置的四个字段：`emptyText`、`separator`、`rangeSeparator`、`dateFormat`；
- 支持 `el-form` 的 `readonly` 属性，以及 `el-form-item` 的属性与插槽透传；
- `el-form-item` 与 `readonly-form-item` 可以混用；
- 默认值 `emptyText: '-'`、`separator: ','`、`rangeSeparator: '~'`。

因此从参考项目迁移时，通常只需要替换包名与导入：

```diff
- import ReadonlyFormItem from 'element-plus-readonly-form-item'
+ import EpFieldView, { ReadonlyFormItem } from 'ep-field-view'
```

```diff
- app.use(ReadonlyFormItem, { emptyText: '-' })
+ app.use(EpFieldView, { emptyText: '-' })
```

## 主要改进

| 方面                        | 参考项目                           | 本项目                                                                                                            |
| --------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 值更新                      | `setInterval` 每秒轮询 10 次       | 完全响应式；父组件更新时重新检查插槽 VNode                                                                        |
| 动态切换 `el-form` readonly | 读取非响应式 attrs                 | `MutationObserver` 监听表单 `readonly` 属性                                                                       |
| 空值                        | `value                             |                                                                                                                   | emptyText`，`0`/`false` 被吞 | 显式空值判定，保留 `0` / `false` |
| 校验                        | 通过删除 vnode props 规避          | 只读时字段不注册，切换时重建 `ElFormItem` 恢复校验                                                                |
| 扩展性                      | 仅内置格式化                       | `formatter`、`readonly` 插槽、显式 `options` / `optionProps`                                                      |
| 主题                        | 无                                 | CSS 变量、内置主题、自定义主题类、暗色模式                                                                        |
| 全局配置                    | 4 个字段                           | 4 个字段 + `timeFormat`、`theme`、`skipValidation`、`nowrapInTable`、`activeText` / `inactiveText`、`optionProps` |
| 表格                        | 手动处理                           | 自动去除间距并截断，`nowrap` 可覆盖                                                                               |
| 类型                        | 手写 `index.d.ts`                  | 源码 TypeScript + 自动生成 d.ts                                                                                   |
| 依赖                        | `dayjs` + `default-passive-events` | 仅 `dayjs`                                                                                                        |
| 构建                        | Vite 4                             | Vite 8，ESM / UMD / CSS / sourcemap                                                                               |

## 行为差异

- **只读字段不注册校验**：默认 `skipValidation: true`。如果希望在只读态仍参与校验，设置 `:skip-validation="false"`。
- **切换只读状态会重建 `ElFormItem`**：这是为了确保 Element Plus 重新注册字段与校验规则。瞬时校验状态（例如正在显示的错误）会被清除；表单数据不受影响。
- **`value` 的显式判定**：显式传入 `value` 时优先于 model；如果是 `undefined`，仍会使用 `value` 而不是回退 model。需要回退时请移除字段。
- **选项解析时机**：只读值依赖插槽中静态声明的 `el-option` / `el-radio` 等。异步选项在父组件更新后同步，不进行轮询。
- **`dateFormat` 全局默认值**：默认为空，以便组件自身的 `format` 生效。若全局设置，会覆盖所有日期组件的显示格式。

## 未实现的能力

如果参考项目或其他实现中依赖以下能力，请评估后再迁移：

- `default-passive-events` 的全局事件处理；
- 通过修改 VNode props 来影响宿主渲染的 hack；
- 每秒轮询强制刷新。

这些能力在本项目中以更可预测的方式实现：响应式数据、MutationObserver 与显式插槽。
