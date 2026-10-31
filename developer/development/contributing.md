# 贡献指南

感谢参与 `ep-field-view`！本文说明开发环境、代码规范、测试与提交流程。

## 开发环境

- Node.js `>= 20.19.0`（推荐 22 LTS）
- pnpm `>= 10`（仓库使用 pnpm 12）
- VS Code 推荐扩展见 `.vscode/extensions.json`

```bash
pnpm install
pnpm dev        # playground: http://localhost:5173
pnpm docs:dev   # 文档
```

## 目录结构

```
src/
  components/TextFormItem.vue   组件主体
  formatters/                       按组件拆分的格式化器（index.ts 为注册表）
  utils/vnode.ts                    插槽 VNode 解析
  utils/form-text.ts            el-form text 同步
  styles/index.css                  CSS 变量与内置主题
  config.ts / constants.ts / types.ts
playground/                         开发演示页
tests/                              Vitest 测试
docs/                               VitePress 用户文档
developer/                          设计、开发与计划文档
```

## 代码规范

- TypeScript，`<script setup lang="ts">`，组合式 API。
- 提交前运行：
  ```bash
  pnpm format
  pnpm lint
  pnpm typecheck
  pnpm test
  ```
- ESLint（flat config）、Stylelint（BEM 类名 `ep-field-view__*` / `ep-field-view--*`）、Prettier 均已配置。
- 样式优先使用 Element Plus CSS 变量，避免硬编码颜色。
- 新增公开 API 必须补充类型、文档与测试。

## 分支与提交

- 分支：`feat/xxx`、`fix/xxx`、`docs/xxx`、`chore/xxx`。
- 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)：
  - `feat: 支持 ElInputTag`
  - `fix: 修复级联多选路径解析`
  - `docs: 补充主题变量说明`
  - `test: 增加日期范围用例`
  - `chore: 升级 element-plus`

## 测试要求

- 值解析修复 / 新增：至少一个单元测试覆盖对应组件与边界值；
- 文本切换与校验：覆盖文本 → 编辑 → 文本完整链路；
- UI / 主题变更：附 playground 截图；
- 所有 PR 必须通过：
  ```bash
  pnpm check
  pnpm build
  pnpm docs:build
  ```

## 文档

- 用户文档位于 `docs/`，使用 VitePress；开发者文档位于 `developer/`；
- 组件 API 变更同步更新 `docs/components/text-form-item.md`；
- 在 `CHANGELOG.md` 的 `Unreleased` 或对应版本下记录变更；
- 版本计划见 [`developer/plan/`](../plan/roadmap.md)。

## Pull Request

1. Fork 并基于 `main` 创建分支；
2. 完成代码、测试与文档；
3. 在 PR 描述中说明：动机、行为影响、测试方式、截图（如涉及 UI）；
4. 等待 CI 通过与至少一位维护者 review。

## 发布

发布流程见 [releasing.md](./releasing.md)。
