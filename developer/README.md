# 开发者文档

本目录面向前端维护者与贡献者，**不属于用户文档站**。用户文档位于 [`docs/`](../docs/)，由 VitePress 构建；本目录不会被 VitePress 收录。

## 阅读顺序

### 设计与实现

1. [架构设计](./design/architecture.md) — 模块划分、数据流、关键取舍
2. [VNode 解析设计](./design/vnode-resolution.md) — 如何从插槽推导文本值
3. [文本模式与校验设计](./design/form-text.md) — `el-form text` 同步、校验跳过与恢复

### 开发与维护

4. [开发环境](./development/getting-started.md) — 环境、脚本、调试
5. [测试指南](./development/testing.md) — 用例组织、新增测试
6. [贡献流程](./development/contributing.md) — 分支、提交、PR
7. [发布流程](./development/releasing.md) — npm 发布、文档部署

### 计划

8. [开发计划](./plan/roadmap.md)
9. [升级计划](./plan/upgrade.md)
10. [BUG 修正计划](./plan/bugfix.md)

## 代码地图

```
src/
  components/TextFormItem.vue   组件主体：状态、slot 解析、渲染、校验、主题类
  utils/value.ts                    路径取值、空值判定、值比较、文本化
  utils/vnode.ts                    slot/VNode 工具：文本、命名插槽、默认插槽
  formatters/                       按组件拆分的格式化器；index.ts 为注册表
  utils/form-text.ts            el-form text 的 MutationObserver 同步
  config.ts                         全局配置、provide/inject、安装
  constants.ts                      默认配置、组件清单、日期格式
  types.ts                          公开类型
  styles/index.css                  CSS 变量、尺寸、内置主题
playground/                         开发演示页（Vite）
docs/                               VitePress 用户文档
developer/                          本目录（设计与开发文档）
tests/                              Vitest 测试
```

## 快速命令

```bash
pnpm install
pnpm dev          # playground
pnpm docs:dev     # 用户文档
pnpm check        # format + lint + typecheck + test
pnpm build        # 库构建（dist）
pnpm docs:build   # 用户文档构建
```

## 文档边界

| 目录 / 文件                              | 受众              | 是否进入 VitePress                 |
| ---------------------------------------- | ----------------- | ---------------------------------- |
| `docs/`                                  | 使用者            | 是                                 |
| `developer/`                             | 维护者、贡献者    | 否                                 |
| `README.md`                              | 使用者 + 项目概览 | 否                                 |
| `CHANGELOG.md`                           | 使用者 + 维护者   | 否（`docs/changelog.md` 是其摘要） |
| `CONTRIBUTING.md` / `RELEASING.md`（根） | GitHub 入口       | 否                                 |
| `AGENTS.md`                              | AI 代理 / 贡献者  | 否                                 |

新增开发者内容请放在本目录对应的子目录中，不要把计划、设计或内部实现说明写进 `docs/`。
