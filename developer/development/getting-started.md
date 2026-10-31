# 开发环境

本文说明本地开发、调试与验证流程。设计与实现细节见 [架构设计](../design/architecture.md)。

## 环境要求

| 工具    | 版本                                                     |
| ------- | -------------------------------------------------------- |
| Node.js | `>= 20.19.0`（推荐 22 LTS）                              |
| pnpm    | `>= 10`（仓库使用 pnpm 12.4.1）                          |
| 浏览器  | 现代 Chromium / Firefox / Safari（用于 playground 验证） |

## 安装

```bash
pnpm install
```

仓库包含 `pnpm-workspace.yaml`，用于 pnpm 12 的供应链策略：

- `allowBuilds.esbuild: true`：允许 esbuild 的安装脚本运行（Vitest / VitePress 依赖）；
- `minimumReleaseAgeExclude`：排除 `vite-plugin-dts` 自动安装的 `@microsoft/api-extractor` peer，避免年轻包的 release-age 策略阻止安装。

如果依赖安装被策略拦截，先检查该文件，而不是关闭全局策略。

## 常用脚本

| 命令                 | 说明                                  |
| -------------------- | ------------------------------------- |
| `pnpm dev`           | 启动 playground（Vite，端口 5173 起） |
| `pnpm docs:dev`      | 启动 VitePress 用户文档               |
| `pnpm typecheck`     | `vue-tsc --noEmit`                    |
| `pnpm test`          | Vitest 单次运行                       |
| `pnpm test:watch`    | Vitest watch                          |
| `pnpm test:coverage` | 覆盖率（v8）                          |
| `pnpm lint`          | ESLint + Stylelint                    |
| `pnpm lint:fix`      | 自动修复 lint                         |
| `pnpm format`        | Prettier 格式化                       |
| `pnpm format:check`  | 格式检查                              |
| `pnpm check`         | format + lint + typecheck + test      |
| `pnpm build`         | 库构建（含 typecheck、d.ts）          |
| `pnpm docs:build`    | 用户文档构建                          |
| `pnpm docs:preview`  | 预览文档产物                          |

发布前执行 `pnpm check && pnpm build && pnpm docs:build && npm pack --dry-run`。

## 目录

```
src/                 组件与工具
playground/          开发演示页（不发布）
docs/                VitePress 用户文档（发布文档站）
developer/           本目录，开发者文档（不发布、不进文档站）
tests/               Vitest
dist/                构建产物（git 忽略）
```

## Playground

```bash
pnpm dev
```

演示页覆盖：

- 全组件只读展示（输入、选择、日期、级联、穿梭框、树选择、表格）；
- 编辑/只读切换；
- 主题（default/compact/bold/plain/brand）、尺寸、暗色；
- 组件自定义显示（输入框前后缀、`el-select #label`、InputNumber formatter）；
- 校验跳过与恢复。

新增组件支持时，优先在 playground 增加一个字段，方便肉眼回归。

## 用户文档

```bash
pnpm docs:dev
pnpm docs:build
pnpm docs:preview
```

`docs/.vitepress/theme/index.ts` 会注册 Element Plus 与本组件，并注入 `ID_INJECTION_KEY` 以支持 SSR hydration。

**注意**：`docs/` 只放用户文档。设计、内部实现、计划、发布流程一律放到 `developer/`，不要加入 VitePress 导航或侧边栏。

## 调试

### 只读状态

1. 检查 `el-form` 根元素是否有 `readonly` 属性；
2. 检查组件根元素的 `ep-field-view--readonly` 类；
3. 动态切换时观察 MutationObserver 是否触发（可在 `form-readonly.ts` 临时打点）。

### 值与格式化

1. 在 Vue Devtools 中查看 `ReadonlyFormItem` 的 props、`displayText`、`resolvedOptions`（通过 expose）；
2. 或在浏览器中查找 `.ep-field-view__content` 的文本；
3. 选项解析失败时检查插槽中的组件名（`ElSelect`、`ElOption` 等）是否仍在 `CAPTURED_COMPONENTS` 中。

### 校验

1. 只读时 `el-form` 的 `fields` 应不包含该字段；
2. 编辑态切换后 `fields` 应恢复，`.el-form-item` 应有 `is-required` 类；
3. 如出现字段未注册，检查 `key` 是否随 `isReadonly` 变化。

### 样式

1. 检查 `.ep-field-view--size-*` 与 `--ep-field-view-*` 变量；
2. Element Plus 的尺寸只缩小 `small` 的字号（12px），`default` / `large` 均为 14px；
3. 暗色模式需要宿主引入 `element-plus/theme-chalk/dark/css-vars.css`。

## 常见问题

| 问题                                     | 原因 / 处理                                                     |
| ---------------------------------------- | --------------------------------------------------------------- |
| `ERR_PNPM_IGNORED_BUILDS`                | 检查 `pnpm-workspace.yaml` 的 `allowBuilds`                     |
| `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION` | 检查 `minimumReleaseAgeExclude`，或升级相关依赖到满足策略的版本 |
| 只读值不更新                             | 检查父组件是否重新渲染；异步 options 更新后需要父级更新         |
| 富内容变成纯文本                         | 检查是否使用了 `formatter`（文本优先），或 slot 中是否只有文本  |
| 样式缺失                                 | 宿主是否引入 `ep-field-view/style.css`                          |
| SSR 水合警告                             | 文档站需注入 `ID_INJECTION_KEY`；组件首屏只读状态来自初始 attrs |

## 提交前

```bash
pnpm format
pnpm check
pnpm build
pnpm docs:build
```

`prepublishOnly` 会再次执行 `check`、`build`、`docs:build`，作为发布保护。
