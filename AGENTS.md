# AGENTS.md

本文件面向 AI 编程代理与贡献者，说明本仓库的约定、命令与不可破坏的设计边界。

## 中文

### 项目定位

`ep-field-view` 是 Element Plus 的**表单文本模式**组件库。Element Plus 原生有 `disabled` 与 `readonly` 两种状态，本项目提供第三种独立状态 `text`：

- `disabled`：控件禁用；
- `readonly`：Element Plus 原生只读（控件可见、不可编辑）；
- `text`：本项目的纯文本展示。

**不要**把 `text` 命名成 `readonly`，也不要用 `el-form readonly` 驱动文本模式。组件名是 `TextFormItem`，模式开关是 `text` prop / `el-form` 的 `text` 扩展属性。

### 常用命令

```bash
pnpm install
pnpm dev          # playground
pnpm docs:dev     # 用户文档
pnpm check        # prettier + eslint + stylelint + vue-tsc + vitest
pnpm build        # ESM / UMD / CSS / d.ts
pnpm docs:build   # VitePress 用户文档
pnpm release:dry  # 发布预演（release-it）
pnpm release      # 发布：CHANGELOG、tag、npm、GitHub Release
npm pack --dry-run
```

提交/发布前至少运行 `pnpm check && pnpm build && pnpm docs:build`。

### 目录与职责

```
src/
  components/TextFormItem.vue   组件状态、slot、渲染、校验、主题类
  components/JsonPreview.vue    对象/数组字段的 JSON 结构化预览
  nuxt.ts                       Nuxt 3 / 4 模块入口与类型声明
  formatters/
    index.ts                    组件 → 格式化器 / 富内容解析器注册表
    options.ts                  选项收集与 option VNode 查找
    select.ts                   el-select 家族
    choice.ts                   radio / checkbox
    input.ts                    el-input / el-input-number
    rate.ts                     el-rate 的 rateMode 渲染
    switch.ts / slider.ts / segmented.ts
    date-time.ts                el-date-picker / el-time-picker
    cascader.ts / transfer.ts
    shared.ts / types.ts        通用格式化与上下文
  utils/vnode.ts                VNode / 插槽工具
  utils/value.ts                路径、空值、比较、文本化
  utils/form-text.ts            el-form text 的 MutationObserver
  config.ts / constants.ts / types.ts
  styles/index.css
tests/                          Vitest
playground/                     开发演示页
docs/                           VitePress 用户文档
developer/                      设计、开发、计划文档（不进 VitePress）
```

### 新增/修改组件格式化

1. 在 `src/formatters/` 新增或修改对应组件文件；
2. 在 `src/formatters/index.ts` 的 `TEXT_FORMATTERS` / `CUSTOM_DISPLAY_RESOLVERS` 注册；
3. `CAPTURED_COMPONENTS` 会自动从注册表推导，不要手动维护第二份清单；
4. 补充 `tests/TextFormItem.spec.ts` 用例；
5. 更新 `docs/guide/value-resolution.md` 与组件 API。

### 默认值与配置

- 多值分隔符 `separator` 默认 `;`，可按语言/产品规范通过 prop 或全局配置覆盖；
- 范围分隔符 `rangeSeparator` 默认 `~`；
- 评分 `rateMode` 默认 `text`（分数）；`rate` 渲染禁用状态的 `el-rate`，保留 `icons` / `void-icon` 等自定义图片配置；
- `el-form` 的 `text` 是本项目扩展属性，不是 Element Plus 官方 prop。

### 注释规范

**所有代码注释必须中英文双语，并且中文与英文分块书写，不混排。** 推荐格式：

```ts
/**
 * 中文：说明中文含义与原因。
 *
 * English: Explain the meaning and reason in English.
 */
```

单行注释同样分块：

```ts
// 中文：...
// English: ...
```

新增代码必须遵守；修改已有代码时顺手补齐。

### 文档边界

- `docs/`：用户文档，进入 VitePress；
- `developer/`：设计、开发、计划、发布文档，**不要**加入 VitePress 导航/侧边栏；
- `AGENTS.md`：给代理与贡献者的操作约定；
- `README.md`：项目概览，npm 页面可见，链接使用 GitHub 绝对地址。

### 测试与发布

- 测试：Vitest + jsdom + `@vue/test-utils`；动态文本切换使用 `settle()` 等待 MutationObserver；
- 富内容测试要断言元素存在，而不仅是文本；
- 发布：`RELEASING.md` 是入口，完整流程见 `developer/development/releasing.md`；
- 不要提交 `dist/`、`node_modules/`、`.reasonix/`、`docs/.vitepress/cache|dist/`；
- 提交信息使用 Conventional Commits（`feat:`、`fix:`、`docs:`、`test:`、`chore:`）。

### 禁止事项

- 不要把 `text` 改回 `readonly` 命名；
- 不要用 `el-form readonly` 触发文本模式；
- 不要在源码中引入轮询（`setInterval`）刷新只读值；
- 不要修改 `dist/` 手工产物；
- 不要把开发者/计划文档写进 `docs/`。

---

## English

### Project identity

`ep-field-view` is an Element Plus **form text-mode** component library. Element Plus already has native `disabled` and `readonly` states; this project provides a third, independent `text` state:

- `disabled`: control disabled;
- `readonly`: native Element Plus read-only (control visible, not editable);
- `text`: plain text display provided by this project.

Do **not** rename `text` to `readonly`, and do not drive text mode with `el-form readonly`. The component is `TextFormItem`; the switch is the `text` prop / the `text` extension attribute on `el-form`.

### Commands

```bash
pnpm install
pnpm dev          # playground
pnpm docs:dev     # user docs
pnpm check        # prettier + eslint + stylelint + vue-tsc + vitest
pnpm build        # ESM / UMD / CSS / d.ts
pnpm docs:build   # VitePress user docs
npm pack --dry-run
```

Before commit/release run at least `pnpm check && pnpm build && pnpm docs:build`.

### Layout

```
src/
  components/TextFormItem.vue   state, slots, rendering, validation, theme classes
  formatters/
    index.ts                    component → formatter / rich-display registry
    options.ts                  option collection and option VNode lookup
    select.ts                   el-select family
    choice.ts                   radio / checkbox
    input.ts                    el-input / el-input-number
    rate.ts                     el-rate rateMode rendering
    switch.ts / slider.ts / segmented.ts
    date-time.ts                el-date-picker / el-time-picker
    cascader.ts / transfer.ts
    shared.ts / types.ts        shared formatting and context
  utils/vnode.ts                VNode / slot helpers
  utils/value.ts                path, empty, comparison, text helpers
  utils/form-text.ts            el-form text MutationObserver
  config.ts / constants.ts / types.ts
  styles/index.css
tests/                          Vitest
playground/                     development demo
docs/                           VitePress user docs
developer/                      design / development / plan docs (not in VitePress)
```

### Adding a component formatter

1. Add or edit the component file under `src/formatters/`;
2. Register it in `TEXT_FORMATTERS` / `CUSTOM_DISPLAY_RESOLVERS` in `src/formatters/index.ts`;
3. `CAPTURED_COMPONENTS` is derived from the registry — do not maintain a second list;
4. Add tests in `tests/TextFormItem.spec.ts`;
5. Update `docs/guide/value-resolution.md` and the component API.

### Defaults

- Multiple-value `separator` defaults to `;`; override per prop or global config;
- Range `rangeSeparator` defaults to `~`;
- Rate `rateMode` defaults to `text` (score); `rate` renders a disabled `el-rate` and keeps custom `icons` / `void-icon` images;
- `el-form`'s `text` is a project extension attribute, not an official Element Plus prop.

### Comment policy

**All code comments must be bilingual (Chinese + English) in separate blocks, never mixed.** Use:

```ts
/**
 * 中文：...
 *
 * English: ...
 */
```

Inline:

```ts
// 中文：...
// English: ...
```

New code must follow this; when editing existing code, fill in the missing language.

### Documentation boundaries

- `docs/`: user docs, built by VitePress;
- `developer/`: design, development, plan, release docs — **never** add these to VitePress nav/sidebar;
- `AGENTS.md`: operational rules for agents/contributors;
- `README.md`: project overview shown on npm; use absolute GitHub links.

### Testing and release

- Vitest + jsdom + `@vue/test-utils`; use `settle()` for dynamic text switching (MutationObserver);
- Rich-content tests must assert the element exists, not only text;
- Release entry: `RELEASING.md`; full flow: `developer/development/releasing.md`;
- Never commit `dist/`, `node_modules/`, `.reasonix/`, or `docs/.vitepress/cache|dist/`;
- Use Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).

### Never

- Rename `text` back to `readonly`;
- Use `el-form readonly` to trigger text mode;
- Add polling (`setInterval`) to refresh values;
- Hand-edit `dist/`;
- Put developer/plan documents under `docs/`.
