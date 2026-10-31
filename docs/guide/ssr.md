# Nuxt 3 / Nuxt 4 与 SSR

`ep-field-view` 的文本模式依赖 `el-form` 上的 `text` 扩展属性；该属性通过 `MutationObserver` 在运行时同步。服务端没有 `MutationObserver`，因此 SSR 场景需要了解首屏与客户端接管的行为差异。

## 工作方式

| 阶段       | 行为                                                                 |
| ---------- | -------------------------------------------------------------------- |
| 服务端渲染 | 只读取初始 props / attrs：`<TextFormItem text>` 或 `<el-form :text>` |
| 客户端挂载 | 读取一次表单当前状态，随后由 `MutationObserver` 接管属性变化         |
| 属性变化   | 同一表单共用一个观察器，统一通知所有 `TextFormItem`                  |
| 组件卸载   | 最后一个字段卸载时断开观察器，无残留监听                             |

组件在 `setup` 中不访问 `window` / `document`，可以直接参与 SSR 渲染。

## 兼容版本

| 依赖                 | 验证版本     | 说明                                          |
| -------------------- | ------------ | --------------------------------------------- |
| Nuxt 3               | `3.21.11`    | 根目录 `app.vue` + `plugins/`                 |
| Nuxt 4               | `4.6.3`      | 默认 `app/` 目录（`compatibilityVersion: 4`） |
| `@element-plus/nuxt` | `1.1.5`      | 同时用于 Nuxt 3 / 4 的组件与样式按需引入      |
| `ep-field-view/nuxt` | `0.3.0`      | 自动注册组件与样式，透传 `epFieldView` 配置   |
| Vue                  | `3.5.44`     | 由 Nuxt 自带                                  |
| Node.js              | `>= 20.19.0` | Nuxt 4 的最低要求                             |

Nuxt 4 兼容模式（`compatibilityVersion: 3`）仍使用 Nuxt 3 的根目录结构，下面的 Nuxt 3 配置同样适用。

## 安装依赖

```bash
pnpm add element-plus ep-field-view
pnpm add -D @element-plus/nuxt
```

## 模块方式安装（推荐）

Nuxt 3 / 4 都使用同一个模块子路径 `ep-field-view/nuxt`：

```bash
pnpm add element-plus ep-field-view
pnpm add -D @element-plus/nuxt
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@element-plus/nuxt', 'ep-field-view/nuxt'],
  epFieldView: {
    emptyText: '-',
    separator: '、'
  },
  compatibilityDate: '2026-01-01'
})
```

模块会自动完成：

1. 全局注册 `<TextFormItem>` 与 `<JsonPreview>`；
2. 把 `ep-field-view/style.css` 加入 Nuxt 的 `css`；
3. 将本包加入 `build.transpile`，避免 Nitro 外置造成重复的 Element Plus 注入 key；
4. 把 `epFieldView` 配置传给 `app.use(EpFieldView, options)`。

`epFieldView` 的类型为 `EpFieldViewOptions`，与 `app.use(EpFieldView, options)` 完全一致；Nuxt 配置中会获得类型提示：

```ts
export default defineNuxtConfig({
  modules: ['ep-field-view/nuxt'],
  epFieldView: {
    emptyText: '暂无',
    separator: '、',
    rangeSeparator: '至',
    rateMode: 'rate'
  }
})
```

`@element-plus/nuxt` 负责 Element Plus 的组件与样式，本模块只负责 `ep-field-view`。

## Nuxt 3 页面

Nuxt 3 的页面入口位于根目录：

```vue
<!-- app.vue -->
<script setup lang="ts">
const model = reactive({
  name: 'Ada',
  tags: ['vue', 'vite']
})

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

## Nuxt 4 页面

Nuxt 4 默认把应用代码放在 `app/` 目录；使用模块方式时不需要额外的插件文件：

```vue
<!-- app/app.vue -->
<script setup lang="ts">
const model = reactive({
  name: 'Ada',
  tags: ['vue', 'vite']
})

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

页面和组件也可以继续放在 `app/pages/`、`app/components/`，`TextFormItem` 已由模块全局注册，无需逐个导入。

## 手动注册（可选）

如果项目需要手动控制插件顺序，可以不使用 `ep-field-view/nuxt`，在插件中注册并自行引入样式：

```ts
// Nuxt 3: plugins/ep-field-view.ts
// Nuxt 4: app/plugins/ep-field-view.ts
import EpFieldView from 'ep-field-view'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(EpFieldView, {
    emptyText: '-',
    separator: '、'
  })
})
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@element-plus/nuxt'],
  css: ['ep-field-view/style.css']
})
```

## 为什么不需要额外配置

Nuxt/Nitro 可能将 `ep-field-view` 外置，同时把 Element Plus 内联打包，导致 `formContextKey` 出现两个 Symbol 实例。组件已经处理了这种情况：

1. 优先使用 `inject(formContextKey)` 获取表单上下文；
2. 取不到时回退到父级 `ElForm` 实例，直接读取其 `model` / `size` props。

模块方式还会主动把 `ep-field-view` 加入 `build.transpile`，进一步避免重复实例；手动注册时上述兜底同样生效。因此 Nuxt 3 与 Nuxt 4 都不需要额外的 `nitro.externals` 配置。

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

### 启动 Nitro 产物时报 `@popperjs/core` 缺失

部分 pnpm + `@element-plus/nuxt` 组合会把 Element Plus 的 popper 别名外置。若 `node .output/server/index.mjs` 报错：

```text
Cannot find package '@popperjs/core'
```

在宿主项目中补上 Element Plus 使用的别名即可（不影响 Nuxt 3 / 4 的组件行为）：

```bash
pnpm add @popperjs/core@npm:@sxzz/popperjs-es
```

更多与运行环境无关的已知问题见[值解析规则](./value-resolution.md)与组件 API 文档。
