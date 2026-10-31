# 更新日志

完整版本记录同步维护在仓库根目录的 [CHANGELOG.md](https://github.com/jktantan/ep-field-view/blob/main/CHANGELOG.md)。

## 0.1.0

首个公开版本。

### 新增

- `TextFormItem` 组件：编辑态渲染插槽，文本模式展示格式化值。
- 支持 `el-form` 的 `text` 继承、单字段覆盖与运行时切换。
- 明确 `text` 模式与 Element Plus 原生 `disabled` / `readonly` 相互独立；`el-form readonly` 不会触发文本模式。
- 自动解析 `el-select`、`el-select-v2`、`el-radio-group`、`el-checkbox-group`、`el-cascader`、`el-date-picker`、`el-time-picker`、`el-switch`、`el-slider`、`el-transfer`、`el-tree-select`、`el-segmented` 等组件。
- 嵌套路径取值、显式 `value`、空值 / 0 / false 判定。
- 全局配置：`emptyText`、`separator`、`rangeSeparator`、`dateFormat`、`timeFormat`、`activeText`、`inactiveText`、`theme`、`skipValidation`、`nowrapInTable`、`optionProps`。
- `formatter`、`text` 插槽、显式 `options` / `optionProps`。
- 评分支持 `rateMode`：默认显示分数，`rate` 模式渲染禁用状态的 `el-rate`（保留自定义图标/图片）。
- 多值分隔符可配置，默认使用 `;`。
- 组件自定义显示：`el-select` 的 `#label` 插槽与 `el-radio` / `el-checkbox` 选中项默认插槽会以 VNode 渲染（保留图标、Tag 等富内容）；同时复用输入框前后缀文本与 `el-input-number` 的 `formatter`。
- 文本行随 `el-form` / `TextFormItem` 的 `size` 联动最小行高与字号（small 12px，default/large 14px，与 Element Plus 一致）。
- 主题：CSS 变量、`compact` / `bold` / `plain` 内置主题、任意自定义主题类、暗色模式。
- 文本模式下跳过校验，切回编辑态恢复字段注册。
- 表格内自动去除间距与单行省略。
- TypeScript 类型、ESM / UMD / CSS / sourcemap 构建。
- VitePress 文档、playground、Vitest、ESLint / Stylelint / Prettier、CI 与发布工作流。

### 修复（相对参考项目）

- `0` 与 `false` 不再被当作空值。
- 使用 `MutationObserver` 替代定时器轮询，动态切换 `el-form text` 立即生效。
- 不再修改 VNode props 来规避校验。
- 多选/范围分隔符使用更一致。
- 级联选择单值、`emitPath: false` 与多选场景不再报错。
- 时间选择器的字符串值原样展示，避免无效日期格式化。

### 依赖

- peer：`vue >= 3.3.0`、`element-plus >= 2.6.0`
- runtime：`dayjs ^1.11`
