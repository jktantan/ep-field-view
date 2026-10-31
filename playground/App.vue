<template>
  <div class="playground" :class="themeClass">
    <header class="playground__header">
      <div>
        <h1 class="playground__title">ep-field-view</h1>
        <p class="playground__subtitle">Element Plus 表单文本态 · 编辑与详情无缝切换</p>
      </div>
      <div class="playground__toolbar">
        <el-switch v-model="textMode" active-text="文本" inactive-text="编辑" size="large" />
        <el-select v-model="theme" aria-label="主题" style="width: 130px">
          <el-option label="默认主题" value="default" />
          <el-option label="紧凑主题" value="compact" />
          <el-option label="加粗主题" value="bold" />
          <el-option label="次要主题" value="plain" />
          <el-option label="品牌主题" value="brand" />
        </el-select>
        <el-select v-model="size" aria-label="尺寸" style="width: 110px">
          <el-option label="大尺寸" value="large" />
          <el-option label="默认" value="default" />
          <el-option label="小尺寸" value="small" />
        </el-select>
        <el-switch v-model="dark" active-text="暗色" />
      </div>
    </header>

    <main class="playground__main">
      <el-form
        ref="formRef"
        :model="model"
        :text="textMode"
        :size="size"
        label-width="170px"
        label-suffix="："
        :rules="rules"
      >
        <section class="playground__card">
          <div class="playground__card-header">
            <div>
              <h2 class="playground__card-title">基础字段</h2>
              <p class="playground__card-desc">输入、选择、单选/多选与布尔值，全部由插槽内容自动解析。</p>
            </div>
            <div class="playground__actions">
              <el-button @click="validateForm">校验表单</el-button>
              <el-button @click="resetForm">重置</el-button>
            </div>
          </div>
          <el-row :gutter="24">
            <el-col :xs="24" :md="12">
              <TextFormItem label="输入框" prop="input">
                <el-input v-model="model.input" placeholder="请输入" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="文本域" prop="textarea">
                <el-input v-model="model.textarea" type="textarea" :rows="2" placeholder="请输入" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="数字（0 不视为空）" prop="number">
                <el-input-number v-model="model.number" :min="0" controls-position="right" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="下拉框" prop="select">
                <el-select v-model="model.select" placeholder="请选择">
                  <el-option
                    v-for="option in languageOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="下拉框（多选）" prop="selectMultiple">
                <el-select v-model="model.selectMultiple" multiple placeholder="请选择">
                  <el-option
                    v-for="option in languageOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="下拉框（分组）" prop="selectGroup">
                <el-select v-model="model.selectGroup" placeholder="请选择">
                  <el-option-group v-for="group in groupOptions" :key="group.label" :label="group.label">
                    <el-option
                      v-for="option in group.options"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-option-group>
                </el-select>
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="虚拟下拉框" prop="selectV2">
                <el-select-v2 v-model="model.selectV2" :options="languageOptions" placeholder="请选择" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="单选框" prop="radio">
                <el-radio-group v-model="model.radio">
                  <el-radio v-for="option in radioOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </el-radio>
                </el-radio-group>
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="多选框" prop="checkbox">
                <el-checkbox-group v-model="model.checkbox">
                  <el-checkbox v-for="option in checkboxOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </el-checkbox>
                </el-checkbox-group>
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="单个多选框" prop="checkboxSingle">
                <el-checkbox v-model="model.checkboxSingle">是否同意</el-checkbox>
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="开关" prop="switch">
                <el-switch v-model="model.switch" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="滑块（范围）" prop="slider">
                <el-slider v-model="model.slider" range :max="100" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="评分" prop="rate">
                <el-rate v-model="model.rate" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="评分（评分样式）" prop="rate" rate-mode="rate">
                <el-rate v-model="model.rate" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="输入标签（标签样式）" prop="tags" input-tag-mode="tag">
                <el-input-tag v-model="model.tags" tag-type="success" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="提及" prop="mention">
                <el-mention v-model="model.mention" :options="mentionOptions" prefix="@" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="自动补全" prop="autocomplete">
                <el-autocomplete v-model="model.autocomplete" :fetch-suggestions="querySearch" placeholder="请输入" />
              </TextFormItem>
            </el-col>
          </el-row>
        </section>

        <section class="playground__card">
          <div class="playground__card-header">
            <div>
              <h2 class="playground__card-title">日期、时间与级联</h2>
              <p class="playground__card-desc">
                日期格式优先取全局配置、组件 <code>format</code>，最后回退到内置格式。
              </p>
            </div>
          </div>
          <el-row :gutter="24">
            <el-col :xs="24" :md="12">
              <TextFormItem label="日期" prop="date">
                <el-date-picker v-model="model.date" type="date" placeholder="选择日期" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="日期时间" prop="datetime">
                <el-date-picker v-model="model.datetime" type="datetime" placeholder="选择日期时间" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="日期范围" prop="daterange">
                <el-date-picker
                  v-model="model.daterange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="季度" prop="quarter">
                <el-date-picker v-model="model.quarter" type="quarter" placeholder="选择季度" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="季度范围" prop="quarterRange">
                <el-date-picker
                  v-model="model.quarterRange"
                  type="quarterrange"
                  range-separator="至"
                  start-placeholder="开始季度"
                  end-placeholder="结束季度"
                />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="年份范围" prop="yearRange">
                <el-date-picker
                  v-model="model.yearRange"
                  type="yearrange"
                  range-separator="至"
                  start-placeholder="开始年份"
                  end-placeholder="结束年份"
                />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="月份（多选）" prop="months">
                <el-date-picker v-model="model.months" type="months" placeholder="选择月份" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="时间" prop="time">
                <el-time-picker v-model="model.time" placeholder="选择时间" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="时间范围" prop="timeRange">
                <el-time-picker v-model="model.timeRange" is-range range-separator="至" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="时间下拉" prop="timeSelect">
                <el-time-select
                  v-model="model.timeSelect"
                  start="08:00"
                  step="00:30"
                  end="18:00"
                  placeholder="选择时间"
                />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="级联选择" prop="cascader">
                <el-cascader v-model="model.cascader" :options="cascaderOptions" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="级联选择（多选）" prop="cascaderMultiple">
                <el-cascader v-model="model.cascaderMultiple" :options="cascaderOptions" :props="{ multiple: true }" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="穿梭框" prop="transfer">
                <el-transfer v-model="model.transfer" :data="transferData" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="树选择" prop="treeSelect">
                <el-tree-select v-model="model.treeSelect" :data="treeData" check-strictly />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="分段控制器" prop="segmented">
                <el-segmented v-model="model.segmented" :options="segmentedOptions" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="颜色" prop="color">
                <el-color-picker v-model="model.color" />
              </TextFormItem>
            </el-col>
          </el-row>
        </section>

        <section class="playground__card">
          <div class="playground__card-header">
            <div>
              <h2 class="playground__card-title">扩展能力</h2>
              <p class="playground__card-desc">
                显式 value、空值文案、嵌套路径、formatter、组件自定义显示、文本插槽与组件级文本模式覆盖。
              </p>
            </div>
          </div>
          <el-row :gutter="24">
            <el-col :xs="24" :md="12">
              <TextFormItem label="空值" prop="empty" empty-text="暂无数据">
                <el-input v-model="model.empty" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="显式 value" :value="model.input">
                <el-input v-model="model.input" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="嵌套路径" prop="nested.user.name">
                <el-input v-model="model.nested.user.name" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="自定义格式化" prop="number" :formatter="pointsFormatter">
                <el-input-number v-model="model.number" :min="0" controls-position="right" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="强制文本（覆盖表单）" prop="input" :text="true">
                <el-input v-model="model.input" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="组件主题 brand" prop="input" theme="brand">
                <el-input v-model="model.input" />
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="自定义文本插槽" prop="color">
                <el-color-picker v-model="model.color" />
                <template #text="{ text }">
                  <span class="playground__color">
                    <span class="playground__color-dot" :style="{ background: model.color }" />
                    {{ text }}
                  </span>
                </template>
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="自定义标签插槽" prop="input">
                <el-input v-model="model.input" />
                <template #label>
                  <span class="playground__custom-label">自定义标签</span>
                </template>
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="输入框前后缀" prop="website">
                <el-input v-model="model.website">
                  <template #prepend>https://</template>
                  <template #append>.com</template>
                </el-input>
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="自定义选中显示" prop="select">
                <el-select v-model="model.select">
                  <el-option
                    v-for="option in languageOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                  <template #label="{ label }">
                    <el-tag size="small" type="success" effect="plain">★ {{ label }}</el-tag>
                  </template>
                </el-select>
              </TextFormItem>
            </el-col>
            <el-col :xs="24" :md="12">
              <TextFormItem label="数字自带格式化" prop="number">
                <el-input-number v-model="model.number" :formatter="textMode ? priceFormatter : undefined" />
              </TextFormItem>
            </el-col>
          </el-row>
        </section>
      </el-form>

      <section class="playground__card">
        <div class="playground__card-header">
          <div>
            <h2 class="playground__card-title">表格内的文本项</h2>
            <p class="playground__card-desc">在 <code>el-table</code> 内自动去掉底部间距，并对长文本做省略号截断。</p>
          </div>
        </div>
        <el-table :data="tableData" border>
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column label="部门" width="140">
            <template #default="{ row }">
              <TextFormItem :value="row.department" text />
            </template>
          </el-table-column>
          <el-table-column label="备注">
            <template #default="{ row }">
              <TextFormItem :value="row.note" text />
            </template>
          </el-table-column>
        </el-table>
      </section>

      <section class="playground__card">
        <div class="playground__card-header">
          <div>
            <h2 class="playground__card-title">当前数据</h2>
            <p class="playground__card-desc">切换编辑/文本后，表单值保持不变。</p>
          </div>
        </div>
        <pre class="playground__code">{{ modelPreview }}</pre>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { FieldViewFormatter } from 'ep-field-view'

const textMode = ref(true)
const dark = ref(false)
const theme = ref('default')
const size = ref<'large' | 'default' | 'small'>('default')

const formRef = ref<FormInstance>()

const model = reactive({
  input: 'Element Plus',
  textarea: '这是一段较长的说明文字，用来验证文本态下的自动换行与排版是否正确。',
  number: 0,
  select: 'vue',
  selectMultiple: ['vue', 'ts'],
  selectGroup: 'vue',
  selectV2: 'vite',
  radio: 'a',
  checkbox: ['x', 'y'],
  checkboxSingle: true,
  switch: true,
  slider: [20, 60],
  rate: 4,
  tags: ['Vue', 'Element Plus'],
  mention: '@张三 请确认一下',
  autocomplete: 'Element Plus',
  color: '#409eff',
  date: new Date(2024, 4, 20),
  datetime: new Date(2024, 4, 20, 10, 30, 0),
  daterange: [new Date(2024, 4, 1), new Date(2024, 4, 20)],
  quarter: new Date(2024, 4, 20),
  quarterRange: [new Date(2024, 0, 1), new Date(2024, 6, 1)],
  yearRange: [new Date(2023, 0, 1), new Date(2025, 0, 1)],
  months: [new Date(2024, 0, 1), new Date(2024, 4, 1)],
  time: new Date(2024, 4, 20, 9, 15, 0),
  timeRange: [new Date(2024, 4, 20, 9, 0, 0), new Date(2024, 4, 20, 18, 0, 0)],
  timeSelect: '09:30',
  website: 'element-plus',
  cascader: ['guide', 'components'],
  cascaderMultiple: [['guide', 'components'], ['resource']],
  transfer: [1, 3],
  treeSelect: 'leaf-2',
  segmented: 'weekly',
  empty: '',
  nested: {
    user: {
      name: '张三'
    }
  }
})

const rules: FormRules = {
  input: [{ required: true, message: '请输入输入框内容', trigger: 'blur' }],
  textarea: [{ required: true, message: '请输入文本域内容', trigger: 'blur' }],
  select: [{ required: true, message: '请选择下拉框', trigger: 'change' }]
}

const languageOptions = [
  { label: 'Vue', value: 'vue' },
  { label: 'TypeScript', value: 'ts' },
  { label: 'Vite', value: 'vite' },
  { label: 'Element Plus', value: 'element-plus' },
  { label: 'VitePress', value: 'vitepress' }
]

const mentionOptions = [
  { label: '张三', value: '张三' },
  { label: '李四', value: '李四' },
  { label: '王五', value: '王五' }
]

const autocompleteOptions = ['Element Plus', 'Vue', 'Vite', 'VitePress', 'TypeScript']

function querySearch(query: string, callback: (items: Array<{ value: string }>) => void): void {
  const keyword = query.trim().toLowerCase()
  callback(
    autocompleteOptions.filter((item) => !keyword || item.toLowerCase().includes(keyword)).map((value) => ({ value }))
  )
}

const groupOptions = [
  {
    label: '框架',
    options: [
      { label: 'Vue', value: 'vue' },
      { label: 'React', value: 'react' }
    ]
  },
  {
    label: '工具',
    options: [
      { label: 'Vite', value: 'vite' },
      { label: 'Rollup', value: 'rollup' }
    ]
  }
]

const radioOptions = [
  { label: '选项 A', value: 'a' },
  { label: '选项 B', value: 'b' },
  { label: '选项 C', value: 'c' }
]

const checkboxOptions = [
  { label: '选项 X', value: 'x' },
  { label: '选项 Y', value: 'y' },
  { label: '选项 Z', value: 'z' }
]

const cascaderOptions = [
  {
    value: 'guide',
    label: '指南',
    children: [
      {
        value: 'components',
        label: '组件',
        children: [
          { value: 'form', label: '表单' },
          { value: 'table', label: '表格' }
        ]
      },
      { value: 'theming', label: '主题' }
    ]
  },
  {
    value: 'resource',
    label: '资源',
    children: [{ value: 'icons', label: '图标' }]
  }
]

const transferData = Array.from({ length: 6 }, (_, index) => ({
  key: index + 1,
  label: `成员 ${index + 1}`
}))

const treeData = [
  {
    value: 'root',
    label: '总部',
    children: [
      { value: 'leaf-1', label: '研发部' },
      { value: 'leaf-2', label: '产品部' },
      { value: 'leaf-3', label: '设计部' }
    ]
  }
]

const segmentedOptions = [
  { label: '按日', value: 'daily' },
  { label: '按周', value: 'weekly' },
  { label: '按月', value: 'monthly' }
]

const tableData = [
  {
    id: 1,
    name: '张三',
    department: '研发部',
    note: '负责组件库与基础设施建设，长期维护文本态方案。'
  },
  {
    id: 2,
    name: '李四',
    department: '产品部',
    note: '负责表单交互设计与文档。'
  }
]

const pointsFormatter: FieldViewFormatter = (value) => `${String(value ?? 0)} 分`
const priceFormatter = (value: number | undefined): string => `¥ ${value ?? 0}`

const themeClass = computed(() => (theme.value && theme.value !== 'default' ? `playground__theme-${theme.value}` : ''))

const modelPreview = computed(() => JSON.stringify(model, null, 2))

watchEffect(() => {
  document.documentElement.classList.toggle('dark', dark.value)
})

async function validateForm(): Promise<void> {
  try {
    await formRef.value?.validate()
    ElMessage.success(textMode.value ? '文本模式已跳过校验' : '校验通过')
  } catch {
    ElMessage.error('校验未通过')
  }
}

function resetForm(): void {
  formRef.value?.resetFields()
  ElMessage.info('已重置')
}
</script>

<style>
.playground {
  min-height: 100vh;
  padding: 32px;
  background: var(--el-bg-color-page);
  color: var(--el-text-color-primary);
}

.playground__header {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  max-width: 1280px;
  margin: 0 auto 24px;
}

.playground__title {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.playground__subtitle {
  margin: 6px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.playground__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.playground__main {
  max-width: 1280px;
  margin: 0 auto;
}

.playground__card {
  padding: 24px;
  margin-bottom: 24px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
}

.playground__card-header {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.playground__card-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
}

.playground__card-desc {
  margin: 6px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.playground__actions {
  display: flex;
  gap: 8px;
}

.playground__code {
  max-height: 300px;
  padding: 16px;
  margin: 0;
  overflow: auto;
  color: var(--el-text-color-regular);
  font-family: var(--el-font-family-mono, monospace);
  font-size: 12px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.playground__color {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.playground__color-dot {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 50%;
}

.playground__custom-label {
  color: var(--el-color-primary);
  font-weight: 600;
}

/* 中文：宿主级主题：从容器覆盖组件 CSS 变量。
   English: Host-level theming via container CSS variables. */
.playground__theme-compact .ep-field-view {
  --ep-field-view-font-size: var(--el-font-size-small);
  --ep-field-view-line-height: 1.4;
}

.playground__theme-bold .ep-field-view {
  --ep-field-view-color: var(--el-text-color-primary);
  --ep-field-view-font-weight: 600;
}

.playground__theme-plain .ep-field-view {
  --ep-field-view-color: var(--el-text-color-secondary);
}

.playground__theme-brand .ep-field-view {
  --ep-field-view-color: var(--el-color-primary);
  --ep-field-view-font-weight: 600;
}

/* 中文：宿主注册的内置 `brand` 主题。
   English: The host-registered `brand` theme. */
.ep-field-view--theme-brand {
  --ep-field-view-color: var(--el-color-primary);
  --ep-field-view-font-weight: 600;
}
</style>
