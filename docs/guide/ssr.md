# Nuxt 3 与 SSR

`ep-field-view` 的文本模式依赖 `el-form` 上的 `text` 扩展属性；该属性通过 `MutationObserver` 在运行时同步。服务端没有 `MutationObserver`，因此 SSR 场景需要了解首屏与客户端接管的行为差异。

## 工作方式

| 阶段       | 行为                                                                 |
| ---------- | -------------------------------------------------------------------- |
| 服务端渲染 | 只读取初始 props / attrs：`<TextFormItem text>` 或 `<el-form :text>` |
| 客户端挂载 | 读取一次表单当前状态，随后由 `MutationObserver` 接管属性变化         |
| 属性变化   | 同一表单共用一个观察器，统一通知所有 `TextFormItem`                  |
| 组件卸载   | 最后一个字段卸载时断开观察器，无残留监听                             |

组件在 `setup` 中不访问 `window` / `document`，可以直接参与 SSR 渲染。

## Nuxt 3 集成

### 1. 安装依赖

```bash
pnpm add element-plus ep-field-view
pnpm add -D @element-plus/nuxt
```

### 2. 配置 `nuxt.config.ts`

```ts
export default defineNuxtConfig({
  modules: ['@element-plus/nuxt'],
  css: ['ep-field-view/style.css']
})
```

`@element-plus/nuxt` 会处理 Element Plus 的组件与样式；本组件样式需要单独引入一次。

### 3. 注册组件

```ts
// plugins/ep-field-view.ts
import EpFieldView from 'ep-field-view'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(EpFieldView, {
    emptyText: '-',
    separator: '、'
  })
})
```

插件默认在服务端与客户端都会执行，保证两端注册一致。

### 4. 页面示例

```vue
<script setup lang="ts">
const model = reactive({
  name: 'Ada',
  tags: ['vue', 'vite']
})

// 详情页 / 表格首屏直接使用文本模式，避免闪烁。
const text = ref(true)
</script>

<template>
  <el-form :model="model" :text="text">
    <TextFormItem label="姓名" prop="name">
      <el-input v-model="model.name" />
    </TextFormItem>

    <TextFormItem label="标签" prop="tags" input-tag-mode="tag">
      <el-input-tag v-model="model.tags" />
    </TextFormItem>
  </el-form>
</template>
```

## 避免 hydration mismatch

- **不要在 `setup` 中根据 `window` / 屏幕宽度决定 `text`**：服务端与客户端算出的初始值不同会触发 hydration 警告。
- **动态切换放到挂载之后**：例如 `onMounted(() => { text.value = ... })`，首屏会先渲染编辑态，再切换为文本态。
- **按路由或权限决定文本模式时**，使用两端都可确定的状态（`useState` + 服务端可读的数据），或直接在页面模板上写死 `text`。
- **异步选项**：服务端渲染时选项若尚未加载，文本会回退为原始值；客户端选项到达后自动刷新，这是预期行为。

## 已知限制

| 限制                       | 表现                                | 规避                                                      |
| -------------------------- | ----------------------------------- | --------------------------------------------------------- |
| 首屏无法观察动态 `text`    | 服务端只读取初始 attrs              | 首屏使用确定的文本模式，挂载后再切换                      |
| `week` 格式依赖 dayjs 语言 | 不同 locale 下 `gggg[w]ww` 结果不同 | 服务端与客户端显式设置相同的 dayjs locale / `date-format` |
| 异步 options               | 选项未返回时显示原始值              | 预取选项，或使用 `formatter` 自行查询                     |
| 自定义包装组件             | 无法识别组件名，回退通用格式化      | 使用 `formatter` / `text` 插槽，或显式 `options`          |

更多与运行环境无关的已知问题见[值解析规则](./value-resolution.md)与组件 API 文档。
