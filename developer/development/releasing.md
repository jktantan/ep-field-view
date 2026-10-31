# 发布指南

本文面向维护者，说明如何将 `ep-field-view` 发布到 npmjs 与部署文档。

## 前置条件

- npmjs 账号拥有 `ep-field-view` 包的发布权限（`npm owner ls ep-field-view`）；
- 本地已登录 npm：`npm login`；
- 工作区干净，位于 `main` 分支且与远端同步。

## 版本策略

遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)：

| 变更             | 版本  |
| ---------------- | ----- |
| 修复、内部重构   | patch |
| 向后兼容的新能力 | minor |
| 破坏性变更       | major |

`0.x` 阶段仍遵循 semver 语义，但 minor 版本可能包含少量行为调整；破坏性变更会在 CHANGELOG 标注。

## 发布前检查

```bash
pnpm install
pnpm check          # prettier + eslint + stylelint + vue-tsc + vitest
pnpm build
pnpm docs:build
npm pack --dry-run  # 确认包内容仅包含 dist 与必要文档
```

检查 `dist/`：

```
dist/index.mjs
dist/index.umd.cjs
dist/index.d.ts
dist/style.css
dist/components/...
```

`package.json` 的 `files` 已限制为 `dist`、`README.md`、`LICENSE`、`NOTICE`。

## 发布流程

发布前先更新 `CHANGELOG.md`，将 `Unreleased` 改为目标版本与日期；然后执行：

```bash
pnpm version patch   # 或 minor / major
pnpm check
pnpm build
pnpm publish --access public
git push origin main --tags
```

`prepublishOnly` 会再次执行 `check`、`build` 与 `docs:build`，作为发布保护。

## 发布后

1. 在 npm 页面确认版本、README、类型文件与 `style.css`；
2. 验证安装：
   ```bash
   npm view ep-field-view version
   npm pack ep-field-view@<version>
   ```
3. 创建 GitHub Release，附 CHANGELOG 摘要；
4. 如有严重问题，使用 `npm deprecate` 标记问题版本并发布 patch：
   ```bash
   npm deprecate ep-field-view@0.1.0 "请升级到 0.1.1，修复了 xxx"
   ```

## 文档部署

`.github/workflows/docs.yml` 在 `main` 分支变更时构建并部署 GitHub Pages：

- 文档构建使用 `DOCS_BASE=/ep-field-view/`；
- 产物位于 `docs/.vitepress/dist`；
- 首次部署需在仓库 Settings → Pages 中选择 GitHub Actions。

本地预览：

```bash
pnpm docs:build
pnpm docs:preview
```
