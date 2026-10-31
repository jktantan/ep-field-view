# 测试指南

测试使用 Vitest + jsdom + `@vue/test-utils`，重点覆盖值解析、文本模式、VNode 富内容、主题与校验。

## 文件结构

```
tests/
  setup.ts                  jsdom 补丁：ResizeObserver、matchMedia
  utils.spec.ts             纯函数：getByPath、isEmptyValue、isSameValue、resolveConfig
  TextFormItem.spec.ts  组件行为：文本、值、格式化、富内容、主题、校验
vitest.config.ts            环境、alias、setup、覆盖率
```

## 测试辅助

`tests/TextFormItem.spec.ts` 中的 `mountItem`：

```ts
const { wrapper } = mountItem({
  model: { city: 'bj' },
  itemProps: { prop: 'city' },
  formProps: { size: 'small' }, // 可选：el-form 属性
  slot: (model) => h(ElSelect, { modelValue: model.city }, { ... }),
  textSlot: (scope) => ...,
  labelSlot: () => ...
})
```

- `text` 可传 boolean 或 `ref`（用于动态切换）；
- `slot` 负责构造编辑态组件（文本模式不会挂载，文本取 VNode）；
- `content(wrapper)` 读取 `.ep-field-view__content` 的文本；
- `settle()` 等待 Vue 更新与 `MutationObserver` 回调（动态文本切换必须使用）。

## 覆盖范围

| describe                           | 覆盖点                                                                                                               |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `text state`                       | 编辑态、继承 `el-form text`、prop 覆盖、运行时切换                                                                   |
| `value resolution`                 | 嵌套路径、显式 value、空值 / 0 / false、数组分隔符、空值文案                                                         |
| `value formatters`                 | select/radio/checkbox/cascader/switch/date/time/slider/transfer/formatter                                            |
| `component display extensions`     | 输入框前后缀、`includeAffixes`、select `#label` VNode、多选 label、option label 语义、InputNumber formatter、size 类 |
| `global configuration and theming` | 全局配置、主题类、nowrap 类                                                                                          |
| `slots and validation`             | text 插槽、label 插槽、文本模式跳过校验与编辑态恢复                                                                  |

`utils.spec.ts` 覆盖路径/空值/比较/配置合并。

## 新增测试

### 新增组件格式化

1. 在 `src/constants.ts` 的 `CAPTURED_COMPONENTS` 注册组件名；
2. 在 `src/formatters/` 新增组件文件，并在 `src/formatters/index.ts` 注册；
3. 在 `value formatters` 中增加用例，覆盖单选/多选/空值/边界；
4. 如组件有自定义显示插槽，在 `component display extensions` 增加 VNode 断言。

```ts
it('formats a new component', async () => {
  const { wrapper } = mountItem({
    model: { value: 'a' },
    itemProps: { prop: 'value' },
    slot: (model) => h(ElSomeComponent, { modelValue: model.value })
  })
  await nextTick()
  expect(content(wrapper)).toBe('A')
})
```

### 新增富内容

断言元素存在，而不仅是文本：

```ts
expect(wrapper.find('.rich-select-label').exists()).toBe(true)
expect(content(wrapper)).toBe('★北京')
```

同时保留一个“纯文本不渲染 VNode”的用例，防止模板空白影响分隔符。

### 动态文本切换

```ts
const textMode = ref(true)
const { wrapper } = mountItem({ text, ... })
text.value = false
await settle()
expect(wrapper.find('input').exists()).toBe(true)
```

`settle()` 会等待 MutationObserver，普通 `nextTick()` 不足以覆盖属性观察回调。

### 校验

测试文本模式下 `formRef.fields.length === 0` 且 `validate()` resolve；编辑态 `fields.length === 1`、存在 `is-required`、字段 `validate()` 失败。

## 运行

```bash
pnpm test
pnpm test:watch
pnpm test:coverage
```

CI 与 `pnpm check` 会运行 `pnpm test`。

## 视觉验证

单测不加载 CSS，涉及布局/字体/主题的改动需要：

1. `pnpm dev`，在 playground 切换文本、尺寸、主题、暗色；
2. `pnpm docs:build`，确认用户文档构建与示例渲染；
3. 必要时用浏览器检查 `getComputedStyle`（例如 small 字号 12px、large 14px）。

## 测试原则

- 行为优先于实现：断言 DOM/文本/字段注册，不依赖内部变量名；
- 每个修复先补失败用例；
- 动态切换、VNode 富内容、校验恢复是最易回归的区域；
- 不引入对真实网络的依赖；Element Plus 组件只在编辑态挂载，文本模式仅解析 VNode。
