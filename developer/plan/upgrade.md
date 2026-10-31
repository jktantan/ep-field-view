# 升级计划

本页定义依赖升级、Element Plus / Vue 大版本适配与破坏性变更的处理方式。

## 兼容矩阵

| 依赖                 | 支持范围                     | 验证方式          |
| -------------------- | ---------------------------- | ----------------- |
| Vue                  | `>= 3.3.0`                   | 单测 + playground |
| Element Plus         | `>= 2.6.0`                   | 单测 + playground |
| Node.js（开发/构建） | `>= 20.19.0`                 | CI                |
| TypeScript           | `>= 5.0`（开发使用 6.x）     | `vue-tsc`         |
| 包管理器             | pnpm 10+（仓库使用 pnpm 12） | CI                |

Element Plus 的 `el-form` 没有声明 `text` prop，本组件通过 fallthrough attribute + `MutationObserver` 读取，因此 **Element Plus 未来若正式声明 `text` prop，需要同步调整读取方式**。这是升级时最重要的检查点。

## 升级节奏

| 类型                                | 频率                     | 处理方式                            |
| ----------------------------------- | ------------------------ | ----------------------------------- |
| Element Plus patch                  | 每周                     | 自动合并，CI 通过即可               |
| Element Plus minor                  | 每月                     | 检查新增/变更组件 API，补充回归用例 |
| Element Plus major                  | 发布后 1 个 minor 周期内 | 建立适配分支，更新 peer 范围        |
| Vue minor                           | 每季度                   | 跟随 Element Plus 支持范围          |
| Vue major                           | 发布后 1 个 minor 周期内 | 评估破坏性变更，更新 peer           |
| Vite / TypeScript / ESLint 等工具链 | 每半年                   | 独立 PR，不阻塞功能发布             |
| dayjs                               | 按需                     | patch/minor 自动合并                |

## 升级步骤

1. **创建分支**：`chore/upgrade-<package>-<version>`。
2. **更新依赖**：
   ```bash
   pnpm up --latest <package>
   pnpm install
   ```
3. **检查 peer 范围**：修改 `package.json` 的 `peerDependencies`，同步文档兼容矩阵。
4. **运行全量验证**：
   ```bash
   pnpm check
   pnpm build
   pnpm docs:build
   pnpm pack --dry-run
   ```
5. **回归重点**：
   - `el-form text` 的动态切换（`MutationObserver`）；
   - 文本模式字段注册/注销与校验恢复；
   - `el-select` / `el-radio` / `el-checkbox` / `el-cascader` / `el-date-picker` / `el-time-picker` / `el-transfer` 的 VNode 名称与 props；
   - 日期默认格式映射；
   - 表格内 `nowrap` 与间距。
6. **更新 CHANGELOG**：记录依赖版本与行为变化。
7. **发布**：按 [BUG 修正计划](./bugfix.md) 的发布门槛执行。

## 破坏性变更策略

本项目遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)：

- **patch**：修复、内部重构、依赖 patch 升级；
- **minor**：向后兼容的新 props / 新主题 / 新组件、依赖 minor 升级；
- **major**：移除或重命名已有 API、改变默认行为、提升最低 peer 版本、删除兼容别名。

破坏性变更必须：

1. 在 `CHANGELOG` 的 `BREAKING CHANGES` 中说明迁移方式；
2. 在文档提供迁移示例；
3. 至少提前一个 minor 版本在控制台给出弃用提示（开发环境）；
4. 保留一个 minor 周期的兼容别名（可行时）。

## 依赖升级工具建议

推荐使用 Renovate 或 Dependabot，按以下策略分组：

```json
{
  "packageRules": [
    {
      "groupName": "element-plus",
      "matchPackageNames": ["element-plus", "@element-plus/icons-vue"],
      "schedule": ["before 6am on monday"]
    },
    {
      "groupName": "toolchain",
      "matchPackageNames": ["vite", "vitest", "typescript", "vue-tsc", "eslint", "stylelint", "prettier"],
      "schedule": ["before 6am on the first day of month"]
    }
  ]
}
```

## 长期支持

- `0.x` 阶段只维护最新 minor；
- `1.x` 稳定后，维护最近两个 minor 的安全与严重缺陷修复；
- 每个 major 版本提供至少 6 个月的迁移窗口。
