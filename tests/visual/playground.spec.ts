import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * 中文：打开 playground 并等待标题、文本字段与字体加载完成。
 *
 * English: Open the playground and wait for the title, a text field and fonts.
 */
async function openPlayground(page: Page, path: string): Promise<void> {
  await page.goto(path)
  await expect(page.locator('.playground__title')).toBeVisible()
  await expect(page.locator('.ep-field-view').first()).toBeVisible()
  // 中文：字体替换会移动像素，截图前等待字体就绪。
  // English: A late font swap shifts pixels, so wait for fonts before capturing.
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
}

test('light theme', async ({ page }) => {
  await openPlayground(page, '/')
  await expect(page).toHaveScreenshot('light.png', { fullPage: true, animations: 'disabled' })
})

test('dark theme', async ({ page }) => {
  await openPlayground(page, '/?dark=true')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page).toHaveScreenshot('dark.png', { fullPage: true, animations: 'disabled' })
})

test('compact theme', async ({ page }) => {
  await openPlayground(page, '/?theme=compact')
  await expect(page.locator('.playground__theme-compact')).toBeVisible()
  await expect(page).toHaveScreenshot('compact.png', { fullPage: true, animations: 'disabled' })
})
