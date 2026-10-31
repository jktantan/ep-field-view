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

`package.json` 的 `files` 已限制为 `dist`、`README.md`、`LICENSE`、`NOTICE`；
构建不生成 sourcemap，发布包中不会出现 `.map` 文件，也不会通过 `sourcesContent` 泄漏 `src` 源码。

## 发布流程

发布使用 [release-it](https://github.com/release-it/release-it) 与
[`@release-it/conventional-changelog`](https://github.com/release-it/conventional-changelog)，
根据 Conventional Commits 自动推导版本、生成 CHANGELOG、提交、打 tag、发布 npm 并创建 GitHub Release。

### 1. 准备

```bash
npm login                       # 确认 npm 发布权限
export GITHUB_TOKEN=ghp_xxx     # 创建 GitHub Release（PowerShell: $env:GITHUB_TOKEN = "ghp_xxx"）
git switch main && git pull
```

工作区必须干净，且位于 `main` 分支。

> 仓库若尚未创建历史版本 tag（首次接入 release-it），release-it 无法从提交推导基线版本。
> 首次发布请显式指定目标版本，例如 `pnpm release 0.3.0`；之后即可按 Conventional Commits 自动推导。
> 不要用 `--no-git` 计算版本，它会让版本回退到初始值。

### 2. 预演

```bash
pnpm release:dry
```

dry-run 会执行 `before:init` 钩子（`pnpm check`、`pnpm build`、`pnpm docs:build`），
并展示将要执行的提交、tag、npm 发布与 GitHub Release 命令，但不会写入文件或发布。

### 3. 发布

```bash
pnpm release            # 交互选择 patch / minor / major
pnpm release minor      # 或直接指定
```

release-it 会：

1. 运行 `pnpm check`、`pnpm build`、`pnpm docs:build`；
2. 提升 `package.json` 版本；
3. 根据提交生成 `CHANGELOG.md` 条目；
4. 提交 `chore: release v{version}` 并打 `v{version}` tag；
5. 推送提交与 tag；
6. 发布 npm（`publishConfig.access` 已为 `public`）；
7. 创建 GitHub Release。

`prepublishOnly` 仍会再次执行 `check`、`build` 与 `docs:build`，作为发布保护。

### 手动兜底

release-it 不可用时，仍可手动发布：

```bash
pnpm version patch      # 或 minor / major
pnpm check && pnpm build && pnpm docs:build
pnpm publish --access public
git push origin main --tags
```

手动发布后需自行更新 `CHANGELOG.md` 并创建 GitHub Release。

## 发布后

1. 在 npm 页面确认版本、README、类型文件与 `style.css`；
2. 验证安装：
   ```bash
   npm view ep-field-view version
   npm pack ep-field-view@<version>
   ```
3. 确认 GitHub Release 内容与 `CHANGELOG.md` 一致；
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
