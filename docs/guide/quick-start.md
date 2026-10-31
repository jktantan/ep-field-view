# 快速开始

`ReadonlyFormItem` 是 `ElFormItem` 的增强版：编辑态渲染默认插槽，只读态渲染从 `el-form` 数据模型与插槽组件中解析出的展示值。

## 基础用法

```vue
<template>
  <el-form :model="model" :readonly="readonly" label-width="100px" label-suffix="：">
    <ReadonlyFormItem label="姓名" prop="name">
      <el-input v-model="model.name" placeholder="请输入姓名" />
    </ReadonlyFormItem>

    <ReadonlyFormItem label="城市" prop="city">
      <el-select v-model="model.city" placeholder="请选择城市">
        <el-option label="上海" value="sh" />
        <el-option label="北京" value="bj" />
      </el-select>
    </ReadonlyFormItem>

    <ReadonlyFormItem label="入职日期" prop="joinedAt">
      <el-date-picker v-model="model.joinedAt" type="date" />
    </ReadonlyFormItem>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ReadonlyFormItem } from 'ep-field-view'

const readonly = ref(false)
const model = reactive({
  name: '张三',
  city: 'sh',
  joinedAt: new Date(2024, 4, 20)
})
</script>
```

只读态渲染结果：

<div class="demo-card">
  <el-form :model="{ name: '张三', city: 'sh', joinedAt: new Date(2024, 4, 20) }" readonly label-width="100px" label-suffix="：">
    <ReadonlyFormItem label="姓名" prop="name" :value="'张三'" />
    <ReadonlyFormItem label="城市" prop="city" :value="'sh'" />
    <ReadonlyFormItem label="入职日期" :value="new Date(2024, 4, 20)" />
  </el-form>
</div>

## 控制只读状态

优先级从高到低：

1. 组件自身的 `readonly` prop；
2. 父级 `el-form` 的 `readonly` 属性；
3. 默认为编辑态。

```vue
<!-- 整个表单只读 -->
<el-form :model="model" readonly> ... </el-form>

<!-- 单独某个字段只读，即使表单是编辑态 -->
<ReadonlyFormItem label="创建时间" prop="createdAt" readonly>
  <el-date-picker v-model="model.createdAt" type="datetime" />
</ReadonlyFormItem>

<!-- 单独某个字段强制编辑，即使表单只读 -->
<ReadonlyFormItem label="备注" prop="note" :readonly="false">
  <el-input v-model="model.note" />
</ReadonlyFormItem>
```

运行时切换 `el-form` 的 `readonly` 会立即生效，无需重新挂载表单。

## 显式指定显示值

当字段值不在 `el-form` 的 model 中，或需要展示派生值时，使用 `value`：

```vue
<ReadonlyFormItem label="订单号" :value="orderNo">
  <el-input v-model="orderNo" />
</ReadonlyFormItem>
```

`value` 优先级高于从 model 读取的值。显式传入 `undefined` 会被视为提供了 value；如果希望回退到 model，请移除该 prop。

## 空值与格式化

- `null`、`undefined`、`''`、空数组、空集合、非法日期视为空，显示 `emptyText`（默认 `-`）；
- `0`、`false` 是有效值，不会被当成空；
- 数组默认用 `separator` 连接；
- 日期、选项标签等会自动解析，详见[值解析规则](/guide/value-resolution)。

```vue
<ReadonlyFormItem label="备注" prop="remark" empty-text="暂无备注">
  <el-input v-model="model.remark" />
</ReadonlyFormItem>
```

## 自定义只读内容

默认只读内容是一个 `<span>`。需要标签、链接、图片等复杂内容时，使用 `readonly` 插槽：

```vue
<ReadonlyFormItem label="状态" prop="status">
  <el-select v-model="model.status">
    <el-option label="正常" value="active" />
    <el-option label="停用" value="disabled" />
  </el-select>

  <template #readonly="{ text, value }">
    <el-tag :type="value === 'active' ? 'success' : 'info'">{{ text }}</el-tag>
  </template>
</ReadonlyFormItem>
```

插槽参数：`value`（原始值）、`text`（格式化后的文本）、`options`（解析出的选项）、`empty`（是否为空值）。

## 自定义格式化函数

只需要改变文本时，使用 `formatter`：

```ts
import type { FieldViewFormatter } from 'ep-field-view'

const scoreFormatter: FieldViewFormatter = (value) => `${String(value ?? 0)} 分`
```

```vue
<ReadonlyFormItem label="评分" prop="score" :formatter="scoreFormatter">
  <el-input-number v-model="model.score" :min="0" />
</ReadonlyFormItem>
```

## 下一步

- [值解析规则](/guide/value-resolution)
- [主题定制](/guide/theming)
- [组件 API](/components/readonly-form-item)
