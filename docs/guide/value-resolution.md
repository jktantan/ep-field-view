# 值解析规则

只读值由两部分共同决定：

1. **原始值**：`value` prop（若显式提供），否则按 `prop` 路径从父级 `el-form` 的 `model` 中读取；
2. **展示格式**：由插槽中第一个可识别的 Element Plus 组件、全局配置与组件 props 共同推导。

## 取值路径

`prop` 支持点号、数组索引与数字下标：

```vue
<ReadonlyFormItem label="城市" prop="user.addresses[0].city"> ... </ReadonlyFormItem>
<ReadonlyFormItem label="城市" prop="user.addresses.0.city"> ... </ReadonlyFormItem>
```

两者等价。路径不存在时按空值处理。

## 空值判定

以下值视为空，显示 `emptyText`：

- `null` / `undefined`
- 空字符串 `''`
- 空数组 `[]`、空 `Map` / `Set`
- 非法日期（`Invalid Date`）
- `NaN`

`0` 与 `false` **不会**被当作空值。

## 组件解析表

| 插槽组件                                               | 展示内容                      | 说明                                                                                                         |
| ------------------------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `ElInput`、`ElInputTag`、`ElMention`、`ElAutocomplete` | 原值                          | `ElInput` 会拼接 `prefix` / `prepend` / `append` / `suffix` 插槽文本；数组按 `separator` 连接                |
| `ElInputNumber`                                        | 原值                          | 优先使用组件自身的 `formatter`                                                                               |
| `ElSelect`、`ElSelectV2`、`ElTreeSelect`               | 选项 label                    | 支持单选、多选、`options` prop、`data` 树、静态 `el-option`，以及 `el-option` / `el-select` 的 `#label` 插槽 |
| `ElRadioGroup`、`ElRadio`、`ElRadioButton`             | 选项文本 / label              | 支持 EP 2.6+ 的 `value` 与旧版 `label`                                                                       |
| `ElCheckboxGroup`、`ElCheckbox`、`ElCheckboxButton`    | 选项文本 / label              | 多选按 `separator` 连接；支持 `true-label` / `false-label`                                                   |
| `ElCascader`                                           | 完整路径                      | 路径分隔符取组件 `separator`（默认 `/`），多个值用 `separator`                                               |
| `ElTransfer`                                           | `data` 中对应项的 label       | 支持 `props.key` / `props.label` 映射                                                                        |
| `ElSwitch`                                             | `activeText` / `inactiveText` | 缺省回退到全局配置，默认“开 / 关”                                                                            |
| `ElDatePicker`                                         | 日期文本                      | 支持 `date`、`datetime`、`week`、`month`、`year`、`dates`、`*range`                                          |
| `ElTimePicker`                                         | 时间文本                      | 时间字符串原样展示；`Date` / 时间戳按 `timeFormat`                                                           |
| `ElTimeSelect`                                         | 原值                          | 时间字符串原样展示                                                                                           |
| `ElSlider`                                             | 数字 / 范围                   | 范围用 `rangeSeparator`（默认 `~`）                                                                          |
| `ElRate`、`ElColorPicker`                              | 原值                          |                                                                                                              |
| `ElSegmented`                                          | 选项 label                    | 读取 `options` prop                                                                                          |

未识别的组件或自定义组件会走通用格式化：

- 数组 → 逐项格式化后用 `separator` 连接；
- 布尔值 → `是` / `否`（`ElSwitch` / `ElCheckbox` 除外，按各自文案）；
- 对象 → 优先读取 `label`、`name`、`title`、`text`，否则 `JSON.stringify`；
- 其他 → `String(value)`。

## 组件自定义显示

只读态会尽量复用组件自身的**最终选中显示**：

- `el-select` 的 `#label` 插槽会被直接渲染为 VNode，因此图标、`el-tag`、颜色等富内容与编辑态完全一致（单选/多选均按值调用）；
- `el-option` 的 `#label` 插槽只影响下拉列表中的选项，**不会**影响 `el-select` 输入框中的选中值，只读态也不会使用它；
- `el-radio` / `el-checkbox` 会渲染选中项的默认插槽内容（同样保留富内容）；
- `el-input-number` 使用组件自身的 `formatter`；
- `el-input` 的 `#prefix`、`#prepend`、`#append`、`#suffix` 会以文本形式按顺序拼接（例如 `https://` + 值 + `.com`、值 + `元`）。可用 `:include-affixes="false"` 或全局配置关闭；
- `el-date-picker` / `el-time-picker` 使用组件的 `format` / `value-format`；
- `el-cascader`、`el-tree-select`、`el-select-v2` 使用 `options` / `data` 中映射出的 label。

如果希望只读态显示 `el-option` 的自定义富内容而不是选中文本，请在 `el-select` 上提供 `#label` 插槽，或在 `ReadonlyFormItem` 上使用 `readonly` 插槽。`formatter` 只返回文本。

## 日期格式优先级

对 `ElDatePicker`：

1. 组件 `dateFormat` prop；
2. 全局配置 `dateFormat`；
3. 插槽组件的 `format` prop；
4. 内置映射（与 Element Plus 一致）：

| type                           | 默认格式              |
| ------------------------------ | --------------------- |
| `date` / `dates` / `daterange` | `YYYY-MM-DD`          |
| `datetime` / `datetimerange`   | `YYYY-MM-DD HH:mm:ss` |
| `week`                         | `gggg[w]ww`           |
| `month` / `monthrange`         | `YYYY-MM`             |
| `year`                         | `YYYY`                |

`value-format` 为 `x`（毫秒）或 `X`（秒）时会先转换时间戳，再格式化。字符串日期若无法被 dayjs 解析，会原样展示。

对 `ElTimePicker`：`timeFormat` prop → 全局 `timeFormat` → 组件 `format` → `HH:mm:ss`。

::: tip
全局 `dateFormat` / `timeFormat` 默认为空字符串。保持为空才能让组件自身的 `format` 生效；一旦在全局配置中设置，会覆盖所有同类组件的 `format`。
:::

## 多值与范围

```ts
createApp(App).use(EpFieldView, {
  separator: '、', // 多选、数组
  rangeSeparator: '至' // 日期范围、时间范围、滑块
})
```

- `ElSelect multiple`、`ElCheckboxGroup`、`ElCascader multiple`、`ElTransfer` 等使用 `separator`；
- `daterange`、`datetimerange`、`monthrange`、`ElTimePicker is-range`、`ElSlider range` 使用 `rangeSeparator`。

## 显式 options 与字段映射

当选项不是通过插槽组件静态声明（例如完全由后端返回），可以显式传入 `options`：

```vue
<ReadonlyFormItem label="负责人" prop="ownerId" :options="users" :option-props="{ label: 'name', value: 'id' }">
  <el-select v-model="model.ownerId">
    <el-option v-for="user in users" :key="user.id" :label="user.name" :value="user.id" />
  </el-select>
</ReadonlyFormItem>
```

`optionProps` 默认 `{ label: 'label', value: 'value', children: 'children', disabled: 'disabled' }`，可用于 `options`、`data` 树以及级联/树选择的字段映射。

## 动态数据

组件在父组件重新渲染时会重新检查插槽 VNode，因此异步加载、分页、远程搜索后更新的 `options` 会在父级更新后同步到只读展示，无需轮询。

## 无法自动解析时

以下情况建议使用 `formatter` 或 `readonly` 插槽：

- 值来自接口而不是 model；
- 选项 label 需要走异步接口二次查询；
- 组件被自定义包装，插槽 VNode 中找不到可识别的 Element Plus 组件；
- 希望渲染富内容（链接、标签、图片、头像组）。
