import { test, expect } from '@playwright/test'
import { goToOrgCanvas, waitForCanvasReady } from './helpers'

test.describe('Keyboard Shortcuts', () => {
  test('? key opens keyboard shortcuts help overlay', async ({ page }) => {
    await goToOrgCanvas(page)
    await waitForCanvasReady(page)

    // Press ? to open help
    await page.keyboard.press('Shift+/')

    const helpOverlay = page.locator('[data-testid="keyboard-shortcuts-help"]')
    await expect(helpOverlay).toBeVisible({ timeout: 5_000 })

    // Should have a close button
    await expect(page.locator('[data-testid="close-keyboard-help"]')).toBeVisible()
  })

  test('Escape closes keyboard shortcuts help', async ({ page }) => {
    await goToOrgCanvas(page)
    await waitForCanvasReady(page)

    // Open help
    await page.keyboard.press('Shift+/')
    await expect(page.locator('[data-testid="keyboard-shortcuts-help"]')).toBeVisible({ timeout: 5_000 })

    // Press Escape
    await page.keyboard.press('Escape')

    // Should close
    await expect(page.locator('[data-testid="keyboard-shortcuts-help"]')).not.toBeVisible()
  })

  test('toolbar keyboard help button toggles overlay', async ({ page }) => {
    await goToOrgCanvas(page)
    await waitForCanvasReady(page)

    const helpBtn = page.locator('[data-testid="toolbar-keyboard-help"]')
    await expect(helpBtn).toBeVisible()

    // Click to open
    await helpBtn.click()
    await expect(page.locator('[data-testid="keyboard-shortcuts-help"]')).toBeVisible({ timeout: 5_000 })

    // Click again to close
    await helpBtn.click()
    await expect(page.locator('[data-testid="keyboard-shortcuts-help"]')).not.toBeVisible()
  })
})
