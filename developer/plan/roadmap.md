# 开发计划

本页记录 `ep-field-view` 的版本路线、验收标准与开发流程。计划会随社区反馈调整，但版本目标与验收标准保持稳定。

## 项目状态

| 项       | 状态                                                                        |
| -------- | --------------------------------------------------------------------------- |
| 当前版本 | `0.3.0`                                                                     |
| 组件 API | `TextFormItem`，参考其能力模型（API 使用 text 命名）                        |
| 测试     | Vitest，106 个用例，覆盖核心值解析、文本切换、校验、主题、预设与结构化展示  |
| 文档     | VitePress 中文文档 + 本地搜索 + GitHub Pages                                |
| 发布     | npmjs（`ep-field-view`），ESM / UMD / CSS / d.ts；release-it 自动 CHANGELOG |

## 版本路线

### v0.1.0 · 基础版本（已完成）

- [x] 组件核心：model 取值、显式 `value`、嵌套路径
- [x] 明确 `text` 与 Element Plus 原生 `disabled` / `readonly` 的三种状态区分
- [x] 文本模式继承 `el-form text`，支持动态切换
- [x] 常见表单组件值解析：input、number、select、radio、checkbox、switch、slider、rate、color、date、time、cascader、transfer、tree-select、segmented
- [x] 空值、0/false、数组、范围、日期/时间格式化
- [x] `formatter` 与 `text` 插槽
- [x] 全局配置与局部覆盖
- [x] 主题 CSS 变量、内置主题、暗色模式
- [x] 文本模式跳过校验，编辑态恢复
- [x] playground 全组件演示
- [x] Vitest 单元测试、ESLint / Stylelint / Prettier
- [x] VitePress 文档、npm 发布配置、本地检查脚本

**验收标准**：`pnpm check && pnpm build && pnpm docs:build` 全部通过；演示页在浅色/暗色下无布局异常；npm 包 `npm pack --dry-run` 仅包含 `dist` 与必要文档。

### v0.2.0 · 稳定性与覆盖（已完成）

- [x] 补齐 `ElSelectV2` 分组、远程搜索、对象值选项的测试
- [x] 补充 `ElDatePicker` 的 `dates`、`week`、`monthrange`、`value-format="x"` 测试
- [x] 补充 `ElInputTag`、`ElTreeSelect`、`ElSegmented` 的解析回归用例
- [x] 共享 `MutationObserver`（同一表单只保留一个观察器），降低长表单开销
- [x] 为异步 options 增加 `flush: 'post'` 渲染时机测试
- [x] 文档增加 Nuxt 3 / SSR 示例与已知限制
- [x] 增加 Playwright 视觉回归（浅色、暗色、compact 主题）
- [x] 覆盖率提升到 85% 以上（语句与分支）

**验收标准**：新增用例全部通过（84 个 Vitest + 3 个视觉回归）；覆盖率语句 93.41% / 分支 86.85%；长表单（200 个文本项）生产构建实测编辑 → 文本 61.6ms、文本 → 编辑 55.4ms（目标 ≤100ms）。

### v0.3.0 · 扩展能力（已完成）

- [x] 常用 `formatter` 预设：金额、百分比、日期、字典映射
- [x] 对象/数组字段的结构化展示（`JsonPreview` 组件与 `text` 插槽示例）
- [x] `ElUpload` 文件列表、`ElImage` 图片预览的文本展示（`imageMode`）
- [x] `ElCascader` 多选 `emitPath: false` 的完整路径与去重优化
- [x] 支持 `el-config-provider` 命名空间下的类名与变量覆盖
- [x] 发布 GitHub Pages 文档站点（`.github/workflows/docs.yml`）
- [x] 增加 `CHANGELOG` 自动生成与 `release-it` 发布流程
- [x] Nuxt 3 / Nuxt 4 SSR 支持（实际构建与运行时验证）

**验收标准**：新增能力均有文档与示例；API 无破坏性变更。包体积目标为 8KB（gzip，不含 Element Plus / dayjs），但该目标在 v0.2.0 基线已超出（ESM 8.82KB）。v0.3.0 完整包实测约 10KB（terser；ESM 10.00KB / UMD 10.00KB）；后续可在 v1.0 通过拆分 `presets` / `JsonPreview` 子路径或裁剪 dayjs 插件继续优化。

### v1.0.0 · 稳定版（预计 2-3 个月）

- [ ] 冻结公开 API，明确 semver 兼容策略
- [ ] 建立 Element Plus 2.x、Vue 3.3-3.5 的版本兼容矩阵验证
- [ ] SSR / Nuxt 3 / 4 / VitePress 集成示例
- [ ] 按需引入指南（unplugin-vue-components resolver）
- [ ] 性能基准与长表单优化
- [ ] 安全审查与依赖审计
- [ ] 完整的迁移指南与已知问题清单

**验收标准**：连续两个 minor 版本无破坏性变更；兼容矩阵全绿；文档覆盖所有导出 API。

## 开发流程

1. **Issue 先行**：功能与缺陷都先建 issue，附复现、期望行为与版本信息。
2. **分支命名**：`feat/xxx`、`fix/xxx`、`docs/xxx`、`chore/xxx`。
3. **提交规范**：Conventional Commits（`feat:`、`fix:`、`docs:`、`test:`、`chore:`）。
4. **本地门槛**：
   ```bash
   pnpm install
   pnpm check        # prettier + eslint + stylelint + vue-tsc + vitest
   pnpm build
   pnpm docs:build
   ```
5. **PR 要求**：说明变更动机、行为影响、测试方式；UI 变更附截图。
6. **发布**：遵循[升级计划](./upgrade.md)与 [BUG 修正计划](./bugfix.md)的发布门槛。

## 技术债与约束

- 插槽 VNode 解析依赖 Element Plus 组件的内部名称，Element Plus 大版本升级时需要回归。
- `MutationObserver` 仅运行在客户端；SSR 首屏使用初始 attrs 值。
- 文本切换会重建 `ElFormItem`，瞬时校验状态会重置。
- 样式集中在一个 CSS 文件中，不随组件自动注入；宿主必须引入 `ep-field-view/style.css`。
- 包体积 gzip 约 9.9KB（v0.2.0 基线 8.82KB）；如需进一步压缩，可将 `presets`、`JsonPreview` 拆为子路径导出，或裁剪 dayjs 的 week/quarter 插件。
