# 演示

下面的演示与 `playground/App.vue` 保持同步，覆盖日期类型、输入标签、树选择、提及与自动补全。切换开关可以在编辑态与文本态之间对比。

<script setup>
import { reactive, ref } from 'vue'

const textMode = ref(true)

const model = reactive({
  quarter: new Date(2024, 4, 20),
  quarterRange: [new Date(2024, 0, 1), new Date(2024, 6, 1)],
  yearRange: [new Date(2023, 0, 1), new Date(2025, 0, 1)],
  months: [new Date(2024, 0, 1), new Date(2024, 4, 1)],
  tags: ['Vue', 'Element Plus'],
  tree: 'quick-start',
  mention: '@张三 请确认一下',
  autocomplete: 'Element Plus'
})

const treeData = [
  {
    value: 'guide',
    label: '指南',
    children: [
      { value: 'installation', label: '安装' },
      { value: 'quick-start', label: '快速开始' }
    ]
  },
  {
    value: 'components',
    label: '组件',
    children: [{ value: 'text-form-item', label: 'TextFormItem' }]
  }
]

const mentionOptions = [
  { label: '张三', value: '张三' },
  { label: '李四', value: '李四' },
  { label: '王五', value: '王五' }
]

const autocompleteOptions = ['Element Plus', 'Vue', 'Vite', 'VitePress', 'TypeScript']

function querySearch(query, callback) {
  const keyword = query.trim().toLowerCase()
  callback(
    autocompleteOptions
      .filter((item) => !keyword || item.toLowerCase().includes(keyword))
      .map((value) => ({ value }))
  )
}
</script>

<div class="demo-card">
  <el-switch v-model="textMode" active-text="文本模式" inactive-text="编辑模式" />
  <el-form :model="model" :text="textMode" label-width="120px" label-suffix="：" style="margin-top: 16px">
    <TextFormItem label="季度" prop="quarter">
      <el-date-picker v-model="model.quarter" type="quarter" placeholder="选择季度" />
    </TextFormItem>
    <TextFormItem label="季度范围" prop="quarterRange">
      <el-date-picker
        v-model="model.quarterRange"
        type="quarterrange"
        range-separator="至"
        start-placeholder="开始季度"
        end-placeholder="结束季度"
      />
    </TextFormItem>
    <TextFormItem label="年份范围" prop="yearRange">
      <el-date-picker
        v-model="model.yearRange"
        type="yearrange"
        range-separator="至"
        start-placeholder="开始年份"
        end-placeholder="结束年份"
      />
    </TextFormItem>
    <TextFormItem label="月份（多选）" prop="months">
      <el-date-picker v-model="model.months" type="months" placeholder="选择月份" />
    </TextFormItem>
    <TextFormItem label="输入标签" prop="tags" input-tag-mode="tag">
      <el-input-tag v-model="model.tags" tag-type="success" />
    </TextFormItem>
    <TextFormItem label="树选择" prop="tree">
      <el-tree-select v-model="model.tree" :data="treeData" check-strictly />
    </TextFormItem>
    <TextFormItem label="提及" prop="mention">
      <el-mention v-model="model.mention" :options="mentionOptions" prefix="@" />
    </TextFormItem>
    <TextFormItem label="自动补全" prop="autocomplete">
      <el-autocomplete v-model="model.autocomplete" :fetch-suggestions="querySearch" placeholder="请输入" />
    </TextFormItem>
  </el-form>
  <p class="demo-note">
    季度与季度范围使用 <code>YYYY-[Q]Q</code>，年份范围使用 <code>YYYY</code>；输入标签开启了
    <code>input-tag-mode="tag"</code>，文本态渲染只读标签。
  </p>
</div>

## 日期类型

`ElDatePicker` 与 `ElDatePickerPanel` 支持 `quarter`、`quarters`、`quarterrange`、`yearrange`、`years`、`months` 等类型，内置格式与 Element Plus 一致：

```vue
<TextFormItem label="季度" prop="quarter">
  <el-date-picker v-model="model.quarter" type="quarter" />
</TextFormItem>

<TextFormItem label="季度范围" prop="quarterRange">
  <el-date-picker v-model="model.quarterRange" type="quarterrange" range-separator="至" />
</TextFormItem>
```

## 输入标签

`ElInputTag` 默认按 `separator` 拼接；设置 `input-tag-mode="tag"` 后渲染只读 `el-tag`，并保留 `tag-type` / `tag-effect`：

```vue
<TextFormItem label="输入标签" prop="tags" input-tag-mode="tag">
  <el-input-tag v-model="model.tags" tag-type="success" />
</TextFormItem>
```

## 提及与自动补全

两者都以字符串作为值，文本态直接展示输入内容：

```vue
<TextFormItem label="提及" prop="mention">
  <el-mention v-model="model.mention" :options="mentionOptions" prefix="@" />
</TextFormItem>

<TextFormItem label="自动补全" prop="autocomplete">
  <el-autocomplete v-model="model.autocomplete" :fetch-suggestions="querySearch" />
</TextFormItem>
```

## 文本展示扩展

### 格式化预设

```vue
<TextFormItem label="金额" prop="amount" :formatter="amountFormatter">
  <el-input-number v-model="model.amount" :precision="2" />
</TextFormItem>

<TextFormItem label="完成度" prop="completion" :formatter="completionFormatter">
  <el-input-number v-model="model.completion" :min="0" :max="1" :step="0.01" />
</TextFormItem>
```

```ts
import { moneyFormatter, percentFormatter } from 'ep-field-view'

const amountFormatter = moneyFormatter({ precision: 2 })
const completionFormatter = percentFormatter()
```

### 对象字段

```vue
<TextFormItem label="扩展信息" :value="model.profile">
  <el-input v-model="model.profileText" readonly />
  <template #text="{ value }">
    <JsonPreview :value="value" :max-height="180" />
  </template>
</TextFormItem>
```

### 附件与图片

```vue
<TextFormItem label="附件" prop="attachments">
  <el-upload v-model:file-list="model.attachments" action="#" :auto-upload="false" />
</TextFormItem>

<TextFormItem label="头像" prop="avatar" image-mode="image">
  <el-image :src="model.avatar" fit="cover" style="width: 80px; height: 80px" />
</TextFormItem>
```

文件列表显示文件名；`image-mode="image"` 渲染只读图片并支持预览。更多用法见[值解析规则](/guide/value-resolution)与[格式化预设](/guide/presets)。
