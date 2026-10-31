# VNode 解析设计

只读值不是从组件的 `v-model` 反向读取，而是从默认插槽的 VNode 结构推导。本文说明解析流程、支持的组件与边界。

## 入口

```
ReadonlyFormItem
  └── slots.default()                     // 父组件插槽，返回 VNode[]
        └── findComponentVNode(...)       // 深度优先，找到第一个可识别组件
              └── getComponentName(vnode) // ElSelect / ElDatePicker / ...
```

`findComponentVNode` 只遍历已经存在的 VNode，**不会挂载**或执行组件内部逻辑。它跳过 `Fragment`、`Comment`，并递归进入普通元素的 children。

可识别组件清单见 `src/constants.ts` 的 `CAPTURED_COMPONENTS`：

- 输入类：`ElInput`、`ElInputNumber`、`ElInputTag`、`ElMention`、`ElAutocomplete`、`ElTimeSelect`
- 选择类：`ElSelect`、`ElSelectV2`、`ElTreeSelect`、`ElCascader`、`ElTransfer`、`ElSegmented`
- 布尔与范围：`ElSwitch`、`ElSlider`、`ElRate`、`ElColorPicker`
- 选项组：`ElRadioGroup`、`ElRadio`、`ElRadioButton`、`ElCheckboxGroup`、`ElCheckbox`、`ElCheckboxButton`
- 日期时间：`ElDatePicker`、`ElTimePicker`

未识别的组件走通用格式化，或由 `formatter` / `readonly` 插槽接管。

## 选项收集

`extractOptions(vnode, optionProps)` 按以下顺序查找：

1. `vnode.props.options`（`el-select-v2`、`el-cascader`、`el-segmented` 等）
2. `vnode.props.data`（`el-tree-select`、`el-transfer`）
3. 默认插槽中的 `el-option` / `el-radio` / `el-checkbox`（递归 `el-option-group` / 组）

选项值映射：

- 对象数组使用 `optionProps`（默认 `label` / `value` / `children` / `disabled`）；
- 组件 `props` 属性中的映射（如 `el-tree-select` 的 `:props="{ label, value }"`）优先；
- 静态选项的 `value` 优先，旧版 `el-radio` / `el-checkbox` 使用 `label` 作为值；
- 选项文本优先取默认插槽文本，其次 `label` prop。

## 文本格式化

`formatFieldValue(value, vnode, context)` 按组件分支：

| 组件                                       | 处理                                                                  |
| ------------------------------------------ | --------------------------------------------------------------------- |
| `ElSelect` / `ElSelectV2` / `ElTreeSelect` | 选项 label；多选 join(separator)；`#label` 插槽文本作为后备           |
| `ElCascader`                               | 构建 value → label path 索引，输出完整路径                            |
| `ElTransfer`                               | `data` 中按 key 查找 label                                            |
| `ElDatePicker` / `ElTimePicker`            | 读取 `format` / `value-format`，回退内置格式                          |
| `ElSwitch`                                 | `activeText` / `inactiveText`，回退全局配置                           |
| `ElInput`                                  | 值 + `prefix/prepend/append/suffix` 插槽文本（可关闭）                |
| `ElInputNumber`                            | 组件自身 `formatter`，否则原值                                        |
| `ElSlider`                                 | 范围用 `rangeSeparator`                                               |
| `ElCheckbox`                               | `true-label` / `false-label` 或选项文本                               |
| 其他                                       | 数组 join(separator)、布尔是/否、对象取 label/name/title、其余 String |

文本提取由 `getTextContent` 完成，它会：

- 递归数组与 `Fragment`；
- 处理编译后的 slots 对象（`children.default()`）；
- 进入组件子树的文本节点（radio/checkbox 的文本）；
- 忽略 `Comment` 与图标组件的非文本内容。

## 富内容

文本无法保留图标、`el-tag`、颜色等，因此只读态提供 `resolveCustomDisplay`：

```
el-select 的 #label 插槽  ──► 渲染 VNode
el-radio / el-checkbox 选中项默认插槽中的元素 ──► 渲染 VNode
```

关键约束：

1. **只使用组件最终选中显示相关的插槽**。`el-option` 的 `#label` 只影响下拉列表，选中值由 `el-select` 的 `#label` 或 option `label` 决定，因此不用于只读值。
2. **纯文本不渲染 VNode**。`containsElementVNode` 判断默认插槽是否包含元素；纯文本继续走字符串格式化，避免模板缩进产生的空白进入分隔符。
3. **VNode 每次更新重新求值**。`customContent` 读取 `revision`，`onBeforeUpdate` 递增 revision，避免复用已挂载的 VNode。
4. **`formatter` 优先**。显式 formatter 时只输出文本。

## 动态数据

插槽 VNode 不是响应式的。父组件重新渲染时：

1. 父组件的 options / 插槽内容更新；
2. 子组件 `onBeforeUpdate` 递增 revision；
3. `formVNode`、`customContent`、`displayText` 重新计算。

因此异步加载的选项、远程搜索结果在父组件更新后会同步，无需轮询。

## 边界与扩展

| 场景                                 | 行为                     | 建议                                              |
| ------------------------------------ | ------------------------ | ------------------------------------------------- |
| 自定义组件包装 `el-select`           | 无法识别内部组件         | 用 `formatter`、显式 `options` 或 `readonly` 插槽 |
| 选项完全来自接口                     | 插槽中无静态 option      | 传 `options` / `optionProps`                      |
| `el-option` 的富内容需要在只读态显示 | 默认不会进入选中值       | 在 `el-select` 上提供 `#label` 插槽               |
| 需要链接、图片、头像组               | 文本/VNode 无法满足      | 使用 `readonly` 插槽                              |
| 组件名在 EP 升级后变化               | 解析失败，回退通用格式化 | 升级计划中的回归清单必查项                        |

## 代码位置

- 组件识别与 VNode 工具：`src/utils/vnode.ts`
- 选项与格式化：`src/utils/format.ts`（`extractOptions`、`formatFieldValue`、`resolveCustomDisplay`）
- 组件清单与日期格式：`src/constants.ts`
- 渲染入口：`src/components/ReadonlyFormItem.vue`

## 测试建议

- 新增组件解析：覆盖单选、多选、范围、空值、异步 options；
- 新增 VNode 行为：断言富内容元素存在（而不仅是文本）；
- 修改选项语义：同时验证编辑态选中值与只读值的文本一致；
- 保留一个“纯文本不引入模板空白”的用例。
