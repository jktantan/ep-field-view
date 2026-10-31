# 快速开始

`TextFormItem` 是 `ElFormItem` 的增强版：编辑态渲染默认插槽，文本模式渲染从 `el-form` 数据模型与插槽组件中解析出的展示值。

## 基础用法

```vue
<template>
  <el-form :model="model" :text="textMode" label-width="100px" label-suffix="：">
    <TextFormItem label="姓名" prop="name">
      <el-input v-model="model.name" placeholder="请输入姓名" />
    </TextFormItem>

    <TextFormItem label="城市" prop="city">
      <el-select v-model="model.city" placeholder="请选择城市">
        <el-option label="上海" value="sh" />
        <el-option label="北京" value="bj" />
      </el-select>
    </TextFormItem>

    <TextFormItem label="入职日期" prop="joinedAt">
      <el-date-picker v-model="model.joinedAt" type="date" />
    </TextFormItem>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { TextFormItem } from 'ep-field-view'

const textMode = ref(false)
const model = reactive({
  name: '张三',
  city: 'sh',
  joinedAt: new Date(2024, 4, 20)
})
</script>
```

文本模式渲染结果：

<div class="demo-card">
  <el-form :model="{ name: '张三', city: 'sh', joinedAt: new Date(2024, 4, 20) }" text label-width="100px" label-suffix="：">
    <TextFormItem label="姓名" prop="name" :value="'张三'" />
    <TextFormItem label="城市" prop="city" :value="'sh'" />
    <TextFormItem label="入职日期" :value="new Date(2024, 4, 20)" />
  </el-form>
</div>

## 控制文本模式

优先级从高到低：

1. 组件自身的 `text` prop；
2. 父级 `el-form` 的 `text` 属性；
3. 默认为编辑态。

::: tip 与 Element Plus 原生状态的区别
`el-form readonly` 或表单控件的 `readonly` 不会触发文本模式；它们与本组件的 `text` 模式相互独立。
:::

```vue
<!-- 整个表单文本模式 -->
<el-form :model="model" text> ... </el-form>

<!-- 单独某个字段文本模式，即使表单是编辑态 -->
<TextFormItem label="创建时间" prop="createdAt" text>
  <el-date-picker v-model="model.createdAt" type="datetime" />
</TextFormItem>

<!-- 单独某个字段强制编辑，即使表单是文本模式 -->
<TextFormItem label="备注" prop="note" :text="false">
  <el-input v-model="model.note" />
</TextFormItem>
```

运行时切换 `el-form` 的 `text` 会立即生效，无需重新挂载表单。

## 显式指定显示值

当字段值不在 `el-form` 的 model 中，或需要展示派生值时，使用 `value`：

```vue
<TextFormItem label="订单号" :value="orderNo">
  <el-input v-model="orderNo" />
</TextFormItem>
```

`value` 优先级高于从 model 读取的值。显式传入 `undefined` 会被视为提供了 value；如果希望回退到 model，请移除该 prop。

## 空值与格式化

- `null`、`undefined`、`''`、空数组、空集合、非法日期视为空，显示 `emptyText`（默认 `-`）；
- `0`、`false` 是有效值，不会被当成空；
- 数组默认用 `separator` 连接，默认分隔符为 `;`；
- 日期、选项标签等会自动解析，详见[值解析规则](/guide/value-resolution)。

```vue
<TextFormItem label="备注" prop="remark" empty-text="暂无备注">
  <el-input v-model="model.remark" />
</TextFormItem>
```

## 评分显示

`ElRate` 默认显示分数；需要保留评分样式时设置 `rate-mode="rate"`：

```vue
<TextFormItem label="评分" prop="score" rate-mode="rate">
  <el-rate v-model="model.score" allow-half />
</TextFormItem>
```

文本模式会渲染一个禁用状态的 `el-rate`，`max`、`allow-half`、`colors`、`icons`、`void-icon` 等配置都会保留，因此可以用自定义图片替换评分图标。

## 自定义文本内容

默认文本内容是一个 `<span>`。需要标签、链接、图片等复杂内容时，使用 `text` 插槽：

```vue
<TextFormItem label="状态" prop="status">
  <el-select v-model="model.status">
    <el-option label="正常" value="active" />
    <el-option label="停用" value="disabled" />
  </el-select>

  <template #text="{ text, value }">
    <el-tag :type="value === 'active' ? 'success' : 'info'">{{ text }}</el-tag>
  </template>
</TextFormItem>
```

插槽参数：`value`（原始值）、`text`（格式化后的文本）、`options`（解析出的选项）、`empty`（是否为空值）。

## 自定义格式化函数

只需要改变文本模式下，使用 `formatter`：

```ts
import type { FieldViewFormatter } from 'ep-field-view'

const scoreFormatter: FieldViewFormatter = (value) => `${String(value ?? 0)} 分`
```

```vue
<TextFormItem label="评分" prop="score" :formatter="scoreFormatter">
  <el-input-number v-model="model.score" :min="0" />
</TextFormItem>
```

金额、百分比、日期与字典映射可以直接使用内置预设：

```ts
import { dictFormatter, moneyFormatter } from 'ep-field-view'

const amountFormatter = moneyFormatter({ precision: 2 })
const statusFormatter = dictFormatter({ active: '启用', disabled: '停用' })
```

详见[格式化预设](/guide/presets)。

## 对象与数组字段

对象 / 数组字段可以在 `text` 插槽中使用 `JsonPreview` 做结构化展示：

```vue
<TextFormItem label="扩展信息" :value="model.profile">
  <el-input v-model="model.profileText" readonly />
  <template #text="{ value }">
    <JsonPreview :value="value" />
  </template>
</TextFormItem>
```

详见 [JsonPreview](/components/json-preview)。

## 下一步

- [值解析规则](/guide/value-resolution)
- [格式化预设](/guide/presets)
- [主题定制](/guide/theming)
- [组件 API](/components/text-form-item)
