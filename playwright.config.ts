import { defineConfig, devices } from '@playwright/test'

// 中文：视觉回归针对 playground 页面，固定视口并禁用动画；快照按主题命名。
// English: Visual regression targets the playground with a fixed viewport and
// disabled animations; snapshots are named per theme.
export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [['list']],
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  use: {
    // 中文：默认连开发服务器；对生产 preview 做性能测量时可用环境变量覆盖。
    // English: Defaults to the dev server; override the env var to measure the
    // production preview build.
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173',
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    trace: 'off'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
})
