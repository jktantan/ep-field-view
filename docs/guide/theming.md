# 主题定制

组件的视觉默认继承 Element Plus 的 CSS 变量，宿主项目无需额外配置即可与现有设计系统保持一致。需要定制时有三层方式：

1. 覆盖组件暴露的 CSS 自定义属性；
2. 使用内置主题或自定义主题类；
3. 通过全局配置设置默认主题。

## CSS 变量

所有变量都定义在 `.ep-field-view` 上，可在任意祖先容器中覆盖：

| 变量                            | 默认值                             | 说明                           |
| ------------------------------- | ---------------------------------- | ------------------------------ |
| `--ep-field-view-color`         | `var(--el-text-color-regular)`     | 只读文本颜色                   |
| `--ep-field-view-empty-color`   | `var(--el-text-color-placeholder)` | 空值文本颜色                   |
| `--ep-field-view-font-size`     | `var(--el-font-size-base)`         | 字号                           |
| `--ep-field-view-font-weight`   | `400`                              | 字重                           |
| `--ep-field-view-line-height`   | `1.6`                              | 行高                           |
| `--ep-field-view-word-break`    | `break-all`                        | 长文本断行策略                 |
| `--ep-field-view-content-width` | `100%`                             | 内容宽度                       |
| `--ep-field-view-min-height`    | `var(--el-component-size)`         | 只读行最小高度（随 size 变化） |

```css
/* 某个详情页容器内统一调整 */
.order-detail .ep-field-view {
  --ep-field-view-color: var(--el-text-color-primary);
  --ep-field-view-font-size: 14px;
}
```

## 尺寸联动

只读文本自动跟随 `el-form` 或 `ReadonlyFormItem` 的 `size`，无需额外配置：

| size      | 字号                                 | 最小高度                            | 类名                        |
| --------- | ------------------------------------ | ----------------------------------- | --------------------------- |
| `large`   | `--el-font-size-base`（14px）        | `--el-component-size-large`（40px） | `ep-field-view--size-large` |
| `default` | `--el-font-size-base`（14px）        | `--el-component-size`（32px）       | —                           |
| `small`   | `--el-font-size-extra-small`（12px） | `--el-component-size-small`（24px） | `ep-field-view--size-small` |

与 Element Plus 保持一致：只有 `small` 会缩小字号（`el-input--small` 为 12px），`large` 不会放大字号，尺寸主要影响最小行高。显式主题（如 `compact`）在 CSS 中位于尺寸规则之后，会覆盖字号；也可以直接覆盖 `--ep-field-view-font-size` / `--ep-field-view-min-height`。

## 内置主题

通过 `theme` prop 或全局配置使用：

| 主题      | 效果                                 |
| --------- | ------------------------------------ |
| `compact` | 更小字号、更紧凑行高，标签同步缩小   |
| `bold`    | 文本加粗、主色文本                   |
| `plain`   | 次要文本颜色，适合信息密度低的详情页 |

```vue
<ReadonlyFormItem label="姓名" prop="name" theme="compact">
  <el-input v-model="model.name" />
</ReadonlyFormItem>
```

```ts
// 或全局默认使用紧凑主题
app.use(EpFieldView, { theme: 'compact' })
```

主题类名为 `ep-field-view--theme-{name}`，宿主可以按需覆盖：

```css
.ep-field-view--theme-compact {
  --ep-field-view-font-size: 12px;
}
```

## 自定义主题

传入任意主题名，组件会添加 `ep-field-view--theme-{name}` 类，宿主自行定义样式即可：

```vue
<ReadonlyFormItem label="品牌字段" prop="brand" theme="brand">
  <el-input v-model="model.brand" />
</ReadonlyFormItem>
```

```css
.ep-field-view--theme-brand {
  --ep-field-view-color: var(--el-color-primary);
  --ep-field-view-font-weight: 600;
}
```

也可配合 `content-class` / `content-style` 只影响只读内容元素：

```vue
<ReadonlyFormItem
  label="金额"
  prop="amount"
  content-class="amount-value"
  :content-style="{ fontVariantNumeric: 'tabular-nums' }"
>
  <el-input-number v-model="model.amount" />
</ReadonlyFormItem>
```

## 暗色模式

组件只使用 Element Plus 的语义变量，因此引入 Element Plus 的暗色变量并切换 `.dark` 即可：

```ts
import 'element-plus/theme-chalk/dark/css-vars.css'

document.documentElement.classList.toggle('dark', isDark)
```

如果需要为暗色模式单独覆盖组件变量：

```css
.dark .ep-field-view {
  --ep-field-view-color: var(--el-text-color-primary);
  --ep-field-view-empty-color: var(--el-text-color-secondary);
}
```

## 与 Element Plus 配置提供者配合

`el-config-provider` 设置的命名空间不会改变组件的类名，但组件内部使用 Element Plus 组件与变量，因此仍会跟随 `el-config-provider` 的尺寸、语言与主题变量。组件的 BEM 类名固定为 `ep-field-view`，便于宿主稳定覆盖。

## 表格中的样式

在 `el-table` 内组件会自动：

- 去掉 `el-form-item` 的底部间距；
- 对内容使用单行省略号截断（`nowrap`）。

需要保持多行显示时显式关闭：

```vue
<ReadonlyFormItem :value="row.note" :nowrap="false" />
```
