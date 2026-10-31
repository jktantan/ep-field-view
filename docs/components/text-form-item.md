# TextFormItem API

`TextFormItem` 是 `ElFormItem` 的增强包装：编辑态渲染默认插槽，文本模式渲染从 `el-form` model 与插槽组件中解析出的展示内容。

## 三种状态

Element Plus 表单字段有三种相互独立的状态：

| 状态       | 控制方式                                                           | 表现                       |
| ---------- | ------------------------------------------------------------------ | -------------------------- |
| `disabled` | `el-form` / `el-form-item` / 表单控件的 `disabled`                 | 控件禁用                   |
| `readonly` | Element Plus 原生的 `readonly`（例如 `el-input` 的 `readonly`）    | 控件可见、不可编辑         |
| `text`     | `TextFormItem` 的 `text` prop，或父级 `el-form` 的 `text` 扩展属性 | 纯文本展示（本项目的能力） |

`text` 模式与 Element Plus 原生的 `disabled` / `readonly` **互不影响**：

```vue
<el-form :model="model" text> ... </el-form>
```

## Props

| 参数             | 说明                                                           | 类型                                            | 默认值                                                                           |
| ---------------- | -------------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------- |
| `prop`           | 表单字段路径，支持 `a.b[0].c` 与 `a.b.0.c`                     | `string`                                        | —                                                                                |
| `value`          | 显式显示值，优先于从 model 读取                                | `unknown`                                       | —                                                                                |
| `text`           | 文本模式；不传时继承 `el-form` 的 `text` 属性，否则为编辑态    | `boolean`                                       | —                                                                                |
| `emptyText`      | 空值文案                                                       | `string`                                        | `-`                                                                              |
| `separator`      | 多值分隔符                                                     | `string`                                        | `;`                                                                              |
| `rangeSeparator` | 范围值分隔符                                                   | `string`                                        | `~`                                                                              |
| `dateFormat`     | 日期格式，覆盖组件 `format` 与内置格式                         | `string`                                        | `''`                                                                             |
| `timeFormat`     | 时间格式，覆盖组件 `format` 与内置格式                         | `string`                                        | `''`                                                                             |
| `formatter`      | 自定义文本格式化函数                                           | `FieldViewFormatter`                            | —                                                                                |
| `options`        | 显式选项，绕过插槽解析                                         | `FieldViewOption[]`                             | —                                                                                |
| `optionProps`    | 选项字段映射                                                   | `FieldViewOptionProps`                          | `{ label: 'label', value: 'value', children: 'children', disabled: 'disabled' }` |
| `includeAffixes` | 拼接输入框 `prefix` / `prepend` / `append` / `suffix` 插槽文本 | `boolean`                                       | `true`                                                                           |
| `nowrap`         | 单行省略；表格内默认开启                                       | `boolean`                                       | 表格内 `true`                                                                    |
| `skipValidation` | 文本模式跳过校验                                               | `boolean`                                       | `true`                                                                           |
| `rateMode`       | `el-rate` 的显示方式：`text` 分数 / `rate` 评分样式            | `'text' \| 'rate'`                              | `text`                                                                           |
| `theme`          | 主题名，添加 `ep-field-view--theme-{name}` 类                  | `string`                                        | `''`                                                                             |
| `contentClass`   | 文本内容元素的额外类名                                         | `string \| string[] \| Record<string, boolean>` | —                                                                                |
| `contentStyle`   | 文本内容元素的内联样式                                         | `StyleValue`                                    | —                                                                                |

> 未传 `text`、`nowrap`、`skipValidation`、`rateMode` 时使用 `undefined`，以便继承表单或全局配置；显式 `false` 会覆盖继承值。

### FieldViewFormatter

```ts
export type FieldViewFormatter = (
  value: unknown,
  context: {
    prop?: string
    value: unknown
    componentName?: string
    options: FieldViewOption[]
  }
) => string | number | null | undefined
```

返回 `null` / `undefined` 时显示 `emptyText`。

### FieldViewOption / FieldViewOptionProps

```ts
interface FieldViewOption {
  label?: string | number
  value?: unknown
  [key: string]: unknown
}

interface FieldViewOptionProps {
  label?: string
  value?: string
  children?: string
  disabled?: string
}
```

## Slots

| 名称      | 说明                                                             | 作用域                            |
| --------- | ---------------------------------------------------------------- | --------------------------------- |
| `default` | 编辑态内容；文本模式下不会渲染（但仍会被解析用于提取展示值）     | —                                 |
| `text`    | 文本模式自定义内容；未提供时渲染默认 `<span>` 或组件自身的富内容 | `{ value, text, options, empty }` |
| 其他      | 透传给 `ElFormItem`，如 `label`、`error`                         | 同 `ElFormItem`                   |

## Expose

| 名称          | 说明                   |
| ------------- | ---------------------- |
| `formItemRef` | 内部 `ElFormItem` 实例 |
| `value`       | 当前原始值             |
| `displayText` | 格式化后的展示文本     |
| `isText`      | 当前是否为文本模式     |
| `options`     | 当前解析出的选项       |

## 全局配置

通过 `app.use(EpFieldView, options)` 或 `provideEpFieldViewConfig(options)` 提供：

| 字段             | 类型                   | 默认值 | 说明                              |
| ---------------- | ---------------------- | ------ | --------------------------------- |
| `emptyText`      | `string`               | `-`    | 空值文案                          |
| `separator`      | `string`               | `;`    | 多值分隔符                        |
| `rangeSeparator` | `string`               | `~`    | 范围分隔符                        |
| `dateFormat`     | `string`               | `''`   | 日期格式；为空时使用组件 `format` |
| `timeFormat`     | `string`               | `''`   | 时间格式；为空时使用组件 `format` |
| `activeText`     | `string`               | `开`   | 开关激活文案                      |
| `inactiveText`   | `string`               | `关`   | 开关关闭文案                      |
| `theme`          | `string`               | `''`   | 默认主题                          |
| `skipValidation` | `boolean`              | `true` | 文本模式跳过校验                  |
| `rateMode`       | `'text' \| 'rate'`     | `text` | 评分显示方式                      |
| `nowrapInTable`  | `boolean`              | `true` | 表格内自动省略                    |
| `optionProps`    | `FieldViewOptionProps` | 见上   | 选项字段映射                      |
| `includeAffixes` | `boolean`              | `true` | 拼接输入框前后缀插槽文本          |

单字段 props 优先级高于全局配置。

## 导出

```ts
import EpFieldView, {
  TextFormItem,
  // 全局配置
  EP_FIELD_VIEW_CONFIG_KEY,
  createConfig,
  provideEpFieldViewConfig,
  resolveConfig,
  useEpFieldViewConfig,
  DEFAULT_CONFIG,
  DEFAULT_OPTION_PROPS,
  // 工具
  formatFieldValue,
  extractOptions,
  getByPath,
  isEmptyValue,
  isSameValue
} from 'ep-field-view'
```

类型导出：`EpFieldViewConfig`、`EpFieldViewOptions`、`TextFormItemProps`、`RateMode`、`FieldViewFormatter`、`FieldViewFormatterContext`、`FieldViewOption`、`FieldViewOptionProps`。

## 注意事项

- `skipValidation` 为 `true` 时，文本模式字段不会注册到 `el-form`，因此 `validate()` 不会校验它；切回编辑态会重新注册。
- 文本模式切换会重建内部 `ElFormItem`，以保证校验注册正确；瞬时校验状态会被清除，表单数据不受影响。
- `el-form` 的 `text` 是本组件识别的扩展属性，不是 Element Plus 官方 prop；它通过 fallthrough attribute 传递。
- 表格内的文本项没有 `el-form` 上下文时，请使用 `value` 传入值，或确保外层存在表单。
- `formatter` 只返回文本；需要图标、链接、Tag 等富内容时使用 `text` 插槽。
- 组件自身的选中值插槽（如 `el-select` 的 `#label`）会被渲染为 VNode；`el-option` 的 `#label` 只影响下拉项，不用于选中值。
- 在 `el-config-provider` 下使用时，组件类名固定为 `ep-field-view`，但颜色/尺寸仍跟随 Element Plus 变量。
