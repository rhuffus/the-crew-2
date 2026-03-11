import { test, expect } from '@playwright/test'
import { goToOrgCanvas, waitForCanvasReady, selectToolbarMode } from './helpers'

test.describe('Canvas Toolbar & Modes', () => {
  test('toolbar renders with all mode buttons', async ({ page }) => {
    await goToOrgCanvas(page)
    await waitForCanvasReady(page)

    const toolbar = page.locator('[data-testid="canvas-toolbar"]')
    await expect(toolbar).toBeVisible()

    // All 5 modes should be present
    for (const mode of ['select', 'pan', 'connect', 'add-node', 'add-edge']) {
      await expect(page.locator(`[data-testid="mode-${mode}"]`)).toBeVisible()
    }
  })

  test('switching modes updates mode label', async ({ page }) => {
    await goToOrgCanvas(page)
    await waitForCanvasReady(page)

    // Default mode should be "Select"
    const modeLabel = page.locator('[data-testid="mode-label"]')
    await expect(modeLabel).toContainText('Select')

    // Switch to Pan mode
    await selectToolbarMode(page, 'pan')
    await expect(modeLabel).toContainText('Pan')

    // Switch to Add Node mode
    await selectToolbarMode(page, 'add-node')
    await expect(modeLabel).toContainText('Add Node')

    // Switch back to Select via keyboard shortcut
    await page.keyboard.press('v')
    await expect(modeLabel).toContainText('Select')
  })

  test('keyboard shortcuts switch canvas modes', async ({ page }) => {
    await goToOrgCanvas(page)
    await waitForCanvasReady(page)

    const modeLabel = page.locator('[data-testid="mode-label"]')

    // H for Pan
    await page.keyboard.press('h')
    await expect(modeLabel).toContainText('Pan')

    // C for Connect
    await page.keyboard.press('c')
    await expect(modeLabel).toContainText('Connect')

    // N for Add Node
    await page.keyboard.press('n')
    await expect(modeLabel).toContainText('Add Node')

    // E for Add Edge
    await page.keyboard.press('e')
    await expect(modeLabel).toContainText('Add Edge')

    // V for Select
    await page.keyboard.press('v')
    await expect(modeLabel).toContainText('Select')
  })

  test('undo/redo buttons are visible and initially disabled', async ({ page }) => {
    await goToOrgCanvas(page)
    await waitForCanvasReady(page)

    const undoBtn = page.locator('[data-testid="toolbar-undo"]')
    const redoBtn = page.locator('[data-testid="toolbar-redo"]')

    await expect(undoBtn).toBeVisible()
    await expect(redoBtn).toBeVisible()
    await expect(undoBtn).toBeDisabled()
    await expect(redoBtn).toBeDisabled()
  })
})
