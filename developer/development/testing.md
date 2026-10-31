# 测试指南

测试使用 Vitest + jsdom + `@vue/test-utils`，重点覆盖值解析、文本模式、VNode 富内容、主题与校验。

## 文件结构

```
tests/
  setup.ts                  jsdom 补丁：ResizeObserver、matchMedia
  utils.spec.ts             纯函数：getByPath、isEmptyValue、isSameValue、resolveConfig
  presets.spec.ts           格式化预设：金额、百分比、日期、字典映射
  JsonPreview.spec.ts       结构化预览：缩进、序列化、循环引用、空值
  TextFormItem.spec.ts  组件行为：文本、值、格式化、富内容、主题、校验
  visual/                   Playwright 视觉回归与长表单基准
    playground.spec.ts      浅色 / 暗色 / compact 截图比对
    long-form.spec.ts       200 项切换性能基准（生产 preview）
    __screenshots__/        基线截图（随代码提交）
vitest.config.ts            环境、alias、setup、覆盖率
playwright.config.ts        视觉回归配置：webServer、视口、快照路径
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

| describe                           | 覆盖点                                                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `text state`                       | 编辑态、继承 `el-form text`、prop 覆盖、运行时切换                                                                             |
| `value resolution`                 | 嵌套路径、显式 value、空值 / 0 / false、数组分隔符、空值文案                                                                   |
| `value formatters`                 | select/radio/checkbox/cascader/switch/date/time/slider/transfer/upload/image/formatter，含 `emitPath: false` 去重              |
| `component display extensions`     | 输入框前后缀、`includeAffixes`、select `#label` VNode、多选 label、option label 语义、InputNumber formatter、图片预览、size 类 |
| `global configuration and theming` | 全局配置、主题类、nowrap 类、`el-config-provider` 命名空间                                                                     |
| `slots and validation`             | text 插槽、label 插槽、文本模式跳过校验与编辑态恢复                                                                            |

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

`pnpm check` 会运行 `pnpm test`。

## 视觉回归

基于 Playwright，截图基线位于 `tests/visual/__screenshots__/`，覆盖浅色、暗色与 compact 主题：

```bash
pnpm exec playwright install chromium-headless-shell   # 首次安装浏览器
pnpm test:visual                                       # 截图比对（自动复用/启动 dev server）
pnpm test:visual:update                                # 有意修改 UI 后更新基线
```

- 基线截图必须随改动提交，否则视觉回归形同虚设；
- playground 支持 `?text=false`、`?theme=compact`、`?dark=true` 复现固定状态，避免脚本操作 UI 带来的不稳定；
- 快照使用固定视口（1280×900）、禁用动画并等待字体就绪，像素差异应视为回归。

### 长表单性能基准

验收目标：200 个文本项切换耗时 ≤100ms。必须对生产构建测量，dev server 有额外编译开销：

```bash
pnpm build:playground
pnpm preview:playground          # 另一个终端，端口 4173
PLAYWRIGHT_BASE_URL=http://localhost:4173 pnpm test:visual
```

Windows PowerShell：

```powershell
$env:PLAYWRIGHT_BASE_URL = "http://localhost:4173"
pnpm test:visual
```

实测（Chromium headless，生产构建）：编辑 → 文本 61.6ms，文本 → 编辑 55.4ms。

`pnpm test:visual` 默认只跑截图；`long-form.spec.ts` 仅在 `PLAYWRIGHT_BASE_URL` 指向 4173 时执行，避免在 dev server 上产生误报。

## 测试原则

- 行为优先于实现：断言 DOM/文本/字段注册，不依赖内部变量名；
- 每个修复先补失败用例；
- 动态切换、VNode 富内容、校验恢复是最易回归的区域；
- 不引入对真实网络的依赖；Element Plus 组件只在编辑态挂载，文本模式仅解析 VNode。
