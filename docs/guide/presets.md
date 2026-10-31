# 格式化预设

`ep-field-view` 提供四个可直接用于 `formatter` 的预设工厂，覆盖金额、百分比、日期与字典映射。预设只负责文本，富内容仍使用 `text` 插槽。

```ts
import { dateFormatter, dictFormatter, moneyFormatter, percentFormatter } from 'ep-field-view'
```

## 金额

```vue
<TextFormItem label="金额" prop="amount" :formatter="amountFormatter">
  <el-input-number v-model="model.amount" :precision="2" />
</TextFormItem>
```

```ts
import { moneyFormatter } from 'ep-field-view'

const amountFormatter = moneyFormatter({ precision: 2 })
// 1234.5 -> ¥1,234.50
```

| 选项                | 类型               | 默认值   | 说明                                                  |
| ------------------- | ------------------ | -------- | ----------------------------------------------------- |
| `locale`            | `string`           | `zh-CN`  | `Intl.NumberFormat` 语言区域                          |
| `currency`          | `string`           | —        | ISO 4217 代码（如 `CNY`、`USD`）；设置后忽略 `symbol` |
| `symbol`            | `string`           | `¥`      | 货币符号                                              |
| `symbolPosition`    | `prefix \| suffix` | `prefix` | 符号位置                                              |
| `precision`         | `number`           | `2`      | 小数位数                                              |
| `useGrouping`       | `boolean`          | `true`   | 是否使用千分位                                        |
| `trimTrailingZeros` | `boolean`          | `false`  | 是否去掉末尾的 `0`                                    |

字符串形式的金额（例如 `¥1,234.50`）会先提取数字再格式化；无法解析的值原样展示。

## 百分比

```ts
import { percentFormatter } from 'ep-field-view'

const completionFormatter = percentFormatter()
// 0.86 -> 86%
```

| 选项                | 类型      | 默认值  | 说明                                                 |
| ------------------- | --------- | ------- | ---------------------------------------------------- |
| `locale`            | `string`  | `zh-CN` | `Intl.NumberFormat` 语言区域                         |
| `precision`         | `number`  | `2`     | 最大小数位数                                         |
| `multiplier`        | `number`  | `100`   | `0.25` → `25%`；若原值已是 `25` 表示 `25%`，设为 `1` |
| `useGrouping`       | `boolean` | `true`  | 是否使用千分位                                       |
| `trimTrailingZeros` | `boolean` | `true`  | 是否去掉末尾的 `0`                                   |

## 日期

```ts
import { dateFormatter } from 'ep-field-view'

const dateFormatter = dateFormatter('YYYY年MM月DD日')
```

支持 `Date`、时间戳与 dayjs 可解析的字符串；无法解析时保留原字符串。数组会按 `separator` 连接，也可以用 `{ separator }` 覆盖：

```ts
const rangeFormatter = dateFormatter('YYYY-MM-DD', { separator: ' 至 ' })
```

## 字典映射

```vue
<TextFormItem label="状态" prop="status" :formatter="statusFormatter">
  <el-select v-model="model.status">
    <el-option label="启用" value="active" />
    <el-option label="停用" value="disabled" />
  </el-select>
</TextFormItem>
```

```ts
import { dictFormatter } from 'ep-field-view'

const statusFormatter = dictFormatter({
  active: '启用',
  disabled: '停用'
})
```

字典源支持普通对象、`Map` 与选项数组：

```ts
dictFormatter(new Map([['active', '启用']]))
dictFormatter([{ label: '启用', value: 'active' }])
dictFormatter([{ name: '启用', id: 'active' }], { labelKey: 'name', valueKey: 'id' })
```

| 选项        | 类型                                                          | 默认值     | 说明               |
| ----------- | ------------------------------------------------------------- | ---------- | ------------------ |
| `separator` | `string`                                                      | 组件分隔符 | 多值连接符         |
| `fallback`  | `'value' \| 'empty' \| string \| ((value) => string \| null)` | `value`    | 未命中字典时的兜底 |
| `labelKey`  | `string`                                                      | `label`    | 选项数组的标签字段 |
| `valueKey`  | `string`                                                      | `value`    | 选项数组的值字段   |

未命中时：

- `fallback: 'value'`：显示原始值；
- `fallback: 'empty'`：显示 `emptyText`；
- 字符串 / 函数：显示指定文案。

空值（`null`、`undefined`、`''`）统一返回 `null`，由 `TextFormItem` 显示 `emptyText`；`0` 与 `false` 不会被当成空值。

## 与组件内置解析的关系

`formatter` 优先级最高：设置后会跳过组件自身的选项、日期等解析。若只想在自动解析基础上追加单位，可在自定义 `formatter` 中读取 `context`：

```ts
const formatter: FieldViewFormatter = (value, context) => {
  return `${String(value)} 分（${context.componentName ?? 'unknown'}）`
}
```

`context` 包含 `prop`、`value`、`componentName`、`options` 与当前 `separator`。
