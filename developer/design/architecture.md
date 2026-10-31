# 架构设计

本文说明 `ep-field-view` 的模块划分、运行时数据流和关键设计取舍。更新实现时请同步维护本文件。

## 目标与边界

**目标**

- 用一个组件替代编辑态与详情态两套模板。
- 文本值从 `el-form` 的 model 与插槽中的 Element Plus 组件推导，无需重复声明展示字段。
- 保留 Element Plus 的视觉与交互规范，包括尺寸、主题变量与暗色模式。
- 文本模式不参与校验，切回编辑态后校验行为恢复。

**不做**

- 不接管表单渲染、校验规则或数据请求。
- 不解析任意自定义组件的内部实现；自定义组件通过 `formatter`、`text` 插槽或显式 `options` 接入。
- 不轮询、不修改宿主的 VNode props。

## 模块职责

| 模块                 | 职责                                                    | 关键约束                       |
| -------------------- | ------------------------------------------------------- | ------------------------------ |
| `TextFormItem.vue`   | 文本模式、字段注册、插槽转发、内容渲染、主题与尺寸类    | 不直接读写 DOM（文本模式除外） |
| `utils/value.ts`     | `prop` 路径读取、空值判定、值比较、文本化               | 不依赖 Vue                     |
| `utils/vnode.ts`     | slot/VNode 遍历、文本提取、命名/默认插槽内容            | 文本遍历，不挂载子组件         |
| `formatters/`        | 按组件拆分的文本格式化与富内容解析，`index.ts` 为注册表 | 纯函数，输入 VNode + 配置      |
| `utils/form-text.ts` | 观察 `el-form` 的 `text` 属性                           | 仅客户端运行                   |
| `config.ts`          | 全局配置、`app.use`、`provide/inject`                   | 配置对象响应式                 |
| `styles/index.css`   | CSS 变量、尺寸、内置主题、表格截断                      | 只使用 Element Plus 语义变量   |

## 格式化器拆分

原先所有组件格式化逻辑集中在一个约 600 行的 `utils/format.ts` 中，新增或修改组件需要在大段分支中定位。现在按组件/组件家族拆分为 `src/formatters/`：

| 文件                                       | 职责                                                                         |
| ------------------------------------------ | ---------------------------------------------------------------------------- |
| `index.ts`                                 | 文本格式化器与富内容解析器注册表、`formatFieldValue`、`resolveCustomDisplay` |
| `options.ts`                               | 选项收集、option VNode 查找                                                  |
| `select.ts`                                | `el-select` / `el-select-v2` / `el-tree-select`                              |
| `choice.ts`                                | radio / checkbox                                                             |
| `input.ts`                                 | `el-input` / `el-input-number`                                               |
| `rate.ts`                                  | `el-rate` 的 `rateMode` 渲染                                                 |
| `switch.ts` / `slider.ts` / `segmented.ts` | 对应组件                                                                     |
| `date-time.ts`                             | 日期 / 时间选择器                                                            |
| `cascader.ts` / `transfer.ts`              | 级联 / 穿梭框                                                                |
| `shared.ts` / `types.ts`                   | 通用格式化、上下文与类型                                                     |

取舍：按组件家族拆分后，新增组件只需新增一个文件并在 `index.ts` 注册，`CAPTURED_COMPONENTS` 自动从注册表推导；代价是文件数量增加、跨文件导入增多。相比原先的单文件，维护性和可测试性更高，因此采用该结构。

## 数据流

```
el-form (text attr, model, size)
        │
        ├── formContextKey ──► model / size / rules
        ├── attrs.text ──► MutationObserver ──► formReadonly(ref)
        │
TextFormItem
  text = props.text ?? formReadonly ?? false
  value    = props.value（显式） ?? getByPath(model, props.prop)
  vnode    = findComponentVNode(slots.default(), CAPTURED_COMPONENTS)
  text     = formatter?.(value) ?? formatFieldValue(value, vnode, config)
  rich     = resolveCustomDisplay(value, vnode, config)
        │
        ├── 文本：rich ? render VNode : text
        └── 编辑：<slot />
```

### 文本模式优先级

1. `TextFormItem` 的 `text` prop；
2. 父级 `el-form` 的 `text` 属性（fallthrough attr，`MutationObserver` 同步）；
3. `false`。

### 值优先级

1. 显式 `value`（即使为 `undefined` 也视为显式提供）；
2. `el-form` 的 `model` 按 `prop` 路径读取（支持 `a.b[0].c` 与 `a.b.0.c`）；
3. 空值 → `emptyText`。

### 渲染优先级

1. 用户提供的 `text` 插槽；
2. 组件自身的富内容（`el-select` 的 `#label`、`el-radio` / `el-checkbox` 选中项默认插槽中的元素）；
3. `formatter` 文本；
4. 内置格式化文本；
5. `emptyText`。

`formatter` 存在时不会渲染富内容（显式文本优先）。需要富内容时使用 `text` 插槽。

## 关键设计决策

### 1. 用 MutationObserver 同步 `el-form text`

Element Plus 的 `ElForm` 没有声明 `text` prop，它作为 fallthrough attribute 存在。Vue 实例的 `attrs` 是普通对象，不是响应式的，`computed` 读取它不会在属性变化时失效。

因此：

- 初始值从 `attrs.text` 读取；
- 挂载后用 `MutationObserver` 观察表单根元素的 `text` 属性；
- 属性变化时更新一个 `ref`，驱动组件重新渲染。

代价是每个文本项一个 observer；属性变化频率极低，开销可接受。SSR 不执行 observer，首屏使用初始 attrs。

### 2. 文本模式下移除 `prop`，并用 `key` 重建 `ElFormItem`

文本模式字段不应参与校验，也不应显示必填星号。Element Plus 的 `ElFormItem` 会合并表单级 rules，单纯传 `rules: []` 无法阻止 form rules 匹配。

方案：

- 文本模式下不传 `prop`，`ElFormItem` 不注册字段；
- 通过 `:key="isText ? 'text' : 'edit'"` 在状态切换时重建 `ElFormItem`，确保编辑态 `onMounted` 重新注册字段与规则；
- 代价是切换瞬间的校验状态（错误提示）被清除，表单数据不受影响。

### 3. 富内容直接渲染组件选中值插槽的 VNode

`el-select` 的选中值由 `#label` 插槽或 `label` 决定；`el-option` 的 `#label` 只影响下拉列表。文本模式要“与组件最终显示一致”，因此：

- 渲染 `el-select` 的 `#label` 插槽 VNode；
- **忽略** `el-option` 的 `#label`，只使用其 `label` 文本；
- 渲染 `el-radio` / `el-checkbox` 选中项默认插槽中的元素；
- 纯文本仍走字符串格式化，避免模板空白节点影响分隔符与文本。

### 4. 文本与 VNode 分离

- `displayText` 始终是字符串，用于 `text` 插槽作用域、`formatter` 与纯文本渲染；
- `resolveCustomDisplay` 返回 VNodeChild，仅在文本模式且存在富内容时使用；
- VNode 在每次组件更新时重新求值（依赖 revision），避免复用已挂载的 VNode。

### 5. 尺寸与字体遵循 Element Plus

- 文本字号：`small` 12px，`default` / `large` 14px；
- 最小行高：24 / 32 / 40px；
- 尺寸通过 `ep-field-view--size-{large|small}` 类与 CSS 变量实现；
- 内置主题（`compact` 等）可覆盖字号，主题规则位于尺寸规则之后。

### 6. 不引入额外运行时依赖

除 `dayjs`（与 Element Plus 共用日期格式化）外无运行时依赖。不使用 `default-passive-events` 等全局补丁。

## 构建与产物

- Vite 库模式，入口 `src/index.ts`；
- 外部化 `vue`、`element-plus`、`dayjs`；
- 产物：`dist/index.mjs`、`dist/index.umd.cjs`、`dist/style.css`、`dist/*.d.ts`；
- 样式集中输出，宿主需显式引入 `ep-field-view/style.css`；
- `vite-plugin-dts` 生成类型，`files` 仅包含 `dist`、README、LICENSE、NOTICE。

## 已知限制

- 插槽 VNode 解析依赖 Element Plus 组件的 `name`，升级 EP 大版本需回归。
- 异步选项依赖父组件重渲染后刷新，不轮询。
- 文本切换会重建 `ElFormItem`。
- `el-option` 的富内容不会进入文本选中值（与 EP 行为一致），需要时用 `el-select` 的 `#label` 或 `text` 插槽。
- SSR 首屏无法响应 `text` 的运行时变化。

## 参考与归属

组件思路参考 [element-plus-readonly-form-item](https://github.com/fuchengwei/element-plus-readonly-form-item)（MIT）。本项目在其基础上重写并修复了轮询、空值、动态切换与校验问题，完整第三方许可见根目录 [NOTICE](../../NOTICE)。
