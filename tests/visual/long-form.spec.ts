import { expect, test } from '@playwright/test'

/**
 * 中文：性能基准必须跑生产构建（dev server 有额外编译与告警开销）。先执行
 * `pnpm build:playground` 并启动 `pnpm preview:playground`，再用
 * `PLAYWRIGHT_BASE_URL=http://localhost:4173 pnpm test:visual` 运行。
 *
 * English: The benchmark requires the production build (the dev server adds
 * compile-time overhead). Build and start the preview first, then run with the
 * env var above.
 */
const isProduction = (process.env.PLAYWRIGHT_BASE_URL ?? '').includes('4173')

test.skip(!isProduction, 'requires the production preview build on port 4173')

test('switches a 200-field form within 100ms', async ({ page }) => {
  await page.goto('/stress.html')
  await expect(page.locator('.el-form-item')).toHaveCount(200)

  // 中文：首次切换用于预热，之后分别测量两个方向。
  // English: The first toggle warms up; both directions are measured after it.
  await page.evaluate(() => (window as any).__stress.toggle())

  const toText = await page.evaluate(() => (window as any).__stress.toggle())
  const toEdit = await page.evaluate(() => (window as any).__stress.toggle())

  expect(toText, `edit -> text: ${toText}ms, text -> edit: ${toEdit}ms`).toBeLessThan(100)
  expect(toEdit, `edit -> text: ${toText}ms, text -> edit: ${toEdit}ms`).toBeLessThan(100)
})
