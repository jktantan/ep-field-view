# JsonPreview

`JsonPreview` 用于对象 / 数组字段的结构化展示，避免详情页出现 `[object Object]` 或难以阅读的单行 JSON。它通常放在 `TextFormItem` 的 `text` 插槽中。

```vue
<script setup lang="ts">
import { JsonPreview, TextFormItem } from 'ep-field-view'
</script>

<template>
  <TextFormItem label="扩展信息" :value="model.profile">
    <el-input v-model="model.profileText" readonly />
    <template #text="{ value }">
      <JsonPreview :value="value" />
    </template>
  </TextFormItem>
</template>
```

文本模式渲染结果：

```json
{
  "name": "张三",
  "roles": ["admin", "editor"],
  "address": {
    "city": "上海"
  }
}
```

## Props

| 参数        | 说明                                  | 类型               | 默认值 |
| ----------- | ------------------------------------- | ------------------ | ------ |
| `value`     | 需要展示的值                          | `unknown`          | —      |
| `space`     | 缩进空格数或字符串；`0` 输出单行 JSON | `number \| string` | `2`    |
| `emptyText` | 空值文案                              | `string`           | `-`    |
| `maxHeight` | 最大高度，超出后滚动；数字按像素处理  | `number \| string` | —      |

空值判定与 `TextFormItem` 一致：`null`、`undefined`、`''`、空数组、空 `Map` / `Set` 显示 `emptyText`；空对象 `{}` 会显示 `{}`。

## 序列化规则

- `Date` → ISO 字符串；
- `Map` → 以字符串键构造的对象；
- `Set` → 数组；
- `BigInt` → 字符串；
- 循环引用 → `"[Circular]"`；
- `function` / `symbol` → `String(value)`。

## 样式

`JsonPreview` 会使用 `TextFormItem` 继承下来的 `--ep-field-view-*` 变量，也可以单独覆盖：

| 变量                                | 默认值                      |
| ----------------------------------- | --------------------------- |
| `--ep-field-view-json-bg`           | `--el-fill-color-light`     |
| `--ep-field-view-json-border-color` | `--el-border-color-lighter` |
| `--ep-field-view-json-font-family`  | 等宽字体栈                  |
| `--ep-field-view-json-font-size`    | `12px`                      |
| `--ep-field-view-json-radius`       | `4px`                       |

```css
.order-detail .ep-field-view__json {
  --ep-field-view-json-bg: var(--el-fill-color-lighter);
  --ep-field-view-json-font-size: 13px;
}
```

也可以在 `TextFormItem` 的 `text` 插槽中渲染自己的结构（例如 `el-descriptions` 或字段列表），`JsonPreview` 只是最省事的默认方案。
