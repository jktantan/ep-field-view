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
