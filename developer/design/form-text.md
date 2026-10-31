# 文本模式与校验设计

本文说明 `text` 的来源、动态同步机制、字段注册与校验恢复，以及尺寸/主题状态。

## 三种状态

Element Plus 表单字段有三种相互独立的状态：

| 状态       | 控制方式                                                       | 表现               |
| ---------- | -------------------------------------------------------------- | ------------------ |
| `disabled` | `el-form` / `el-form-item` / 表单控件的 `disabled`             | 控件禁用           |
| `readonly` | Element Plus 原生 `readonly`（例如 `el-input` 的 `readonly`）  | 控件可见、不可编辑 |
| `text`     | `TextFormItem` 的 `text` prop，或 `el-form` 的 `text` 扩展属性 | 纯文本展示         |

本项目只负责 `text` 状态，不改变 Element Plus 的 `disabled` / `readonly` 行为。

## `text` 的三种来源

优先级从高到低：

1. `TextFormItem` 的 `text` prop；
2. 父级 `el-form` 的 `text` 属性；
3. `false`。

`props.text` 通过 `withDefaults` 保持 `undefined`，以区分“未传”和显式 `false`。Vue 会把未传的 Boolean prop 转换为 `false`，这是必须显式设置 `undefined` 的原因。

## 为什么 `el-form text` 需要 MutationObserver

Element Plus 的 `ElForm` **没有**声明 `text` prop。宿主传入的 `text` 是本项目约定的扩展属性，作为 fallthrough attribute 存在：

```vue
<el-form :model="model" :text="textMode" />
```

在 Vue 中：

- 未声明 prop 的属性进入组件实例的 `attrs`；
- `attrs` 是一个普通对象（`instance.attrs`），**不是响应式对象**；
- 因此 `computed(() => form.attrs.text)` 在属性变化后不会失效。

实现（`src/utils/form-text.ts`）：

1. 初始化时从 `attrs.text` 读取；
2. `onMounted` 后找到 `el-form` 的根元素，`MutationObserver` 观察 `text` 属性；
3. 属性变化时更新 `formText` ref；
4. `onBeforeUnmount` 断开 observer。

```ts
const formText = ref(readFormText(parentForm?.attrs))
onMounted(() => {
  formText.value = readFormText(parentForm?.attrs)
  stopObservingForm = observeFormText(parentForm?.proxy?.$el, () => {
    formText.value = readFormText(parentForm?.attrs)
  })
})
```

注意事项：

- 只在客户端运行；SSR 首屏使用初始 attrs。
- 每个文本项一个 observer。属性变化极少，长表单开销可接受；如需优化，可改为共享 observer。
- Element Plus 原生的 `readonly` 不会触发文本模式；不要用 `el-form readonly` 控制本组件。
- 如果未来改为自定义 provider，可减少对 DOM 属性的依赖。

## 字段注册与校验跳过

### 目标

- 文本模式：字段不参与 `el-form.validate()`，不显示必填星号；
- 编辑态：恢复规则、校验与星号；
- 表单数据不受切换影响。

### 为什么不能只传 `rules: []`

`ElFormItem` 的 `normalizedRules` 会合并：

- 自身的 `props.rules`；
- `formContext.rules[prop]`（表单级规则）。

只传空数组无法阻止表单级规则匹配，字段仍会被校验。

### 实现

```ts
const skip = isText.value && shouldSkipValidation.value
if (props.prop && !skip) result.prop = props.prop
else delete result.prop

if (skip) {
  result.rules = []
  result.required = false
}
```

- 文本模式移除 `prop`，`ElFormItem` 不注册字段；
- 同时清空 item rules 与 required，避免星号；
- 编辑态恢复 `prop`；
- 通过 `key="text|edit"` 重建 `ElFormItem`，确保编辑态 `onMounted` 重新 `addField`。

### 为什么需要 key 重建

文本 → 编辑时，`ElFormItem` 的 `prop` 从空变为字段名，理论上 watch 会重新注册。但实际测试中字段注册时机与 `ElForm` 的 fields 数组可能不同步，导致 `validate()` 跳过字段。使用 key 重建可以让 `ElFormItem` 走完整的 `onMounted` 注册流程，行为确定。

代价：

- 切换时内部 `ElFormItem` 重建；
- 瞬时校验状态（错误提示）被清除；
- 表单 model 与外部状态不变。

### 关闭跳过

设置 `:skip-validation="false"` 或全局 `skipValidation: false` 后，文本模式字段仍以真实 `prop` 注册并参与校验，星号恢复。适用于“文本展示但仍需校验”的场景。

## 尺寸与主题

### 尺寸

`size` 来源：

- `TextFormItem` 的 `size`（未声明 prop，进入 attrs）；
- 父级 `el-form` 的 `size`（`formContext.size`）。

尺寸类：

- `ep-field-view--size-large`；
- `ep-field-view--size-small`；
- `default` 不加类。

字号与最小行高遵循 Element Plus：

| size      | 字号 | 最小行高 |
| --------- | ---- | -------- |
| `large`   | 14px | 40px     |
| `default` | 14px | 32px     |
| `small`   | 12px | 24px     |

`large` 不放大字号（与 `el-input--large` 一致），尺寸主要影响行高。

### 主题

- `theme` prop / 全局配置 → `ep-field-view--theme-{name}`；
- CSS 变量定义在 `.ep-field-view`；
- 内置 `compact` / `bold` / `plain`；
- 主题规则位于尺寸规则之后，可覆盖字号；
- 表格内 `nowrap` 由父链检测（`ElTable` / `ElTableBody` / `ElTableRow`）。

## 测试与调试

相关测试：

- `text mode`：编辑态、继承、prop 覆盖、动态切换、`el-form readonly` 不触发文本模式；
- `slots and validation`：文本模式跳过、编辑态字段恢复；
- `component display extensions`：尺寸类。

调试建议：

1. 在浏览器中检查 `.el-form` 的 `text` 属性是否真实变化；
2. 检查 `.ep-field-view--size-*` 类与 `getComputedStyle`；
3. 检查内部 `ElFormItem` 是否在切换后重建（Vue Devtools）；
4. 检查 `el-form` 的 exposed `fields` 数量与 `propString`。

## 潜在改进

- 共享 MutationObserver，减少长表单 observer 数量；
- 评估用 `provide/inject` 的自定义 text provider 替代表单属性，减少对 DOM 属性的依赖；
- 在文档与 demo 中并列展示 `disabled` / `readonly` / `text` 三种状态。
