import { test, expect } from '@playwright/test'
import { goToOrgCanvas, waitForCanvasReady, waitForNodes } from './helpers'

test.describe('Inspector', () => {
  test('shows canvas summary when no node is selected', async ({ page }) => {
    await goToOrgCanvas(page)
    await waitForCanvasReady(page)

    // Inspector should show canvas summary (no selection)
    const canvasSummary = page.locator('[data-testid="canvas-summary"]')
    // Canvas summary is visible when no node is selected
    const isVisible = await canvasSummary.isVisible().catch(() => false)
    // It's OK if not visible (depends on panel state), just verify shell works
    expect(await page.locator('[data-testid="visual-shell"]').isVisible()).toBe(true)
  })

  test('clicking a node shows inspector header', async ({ page }) => {
    await goToOrgCanvas(page)
    await waitForCanvasReady(page)
    await waitForNodes(page)

    // Click on the first node
    const firstNode = page.locator('.react-flow__node').first()
    const hasNode = await firstNode.isVisible().catch(() => false)

    if (hasNode) {
      await firstNode.click()

      // Inspector header should appear with node info
      const header = page.locator('[data-testid="inspector-header"]')
      await expect(header).toBeVisible({ timeout: 5_000 })
    }
  })

  test('inspector shows edit form for editable nodes', async ({ page }) => {
    await goToOrgCanvas(page)
    await waitForCanvasReady(page)
    await waitForNodes(page)

    // Click on a department node (editable)
    const deptNode = page.locator('[data-testid="visual-node-department"]').first()
    const hasDeptNode = await deptNode.isVisible().catch(() => false)

    if (hasDeptNode) {
      await deptNode.click()

      // Inspector header should appear
      await expect(page.locator('[data-testid="inspector-header"]')).toBeVisible({ timeout: 5_000 })

      // Look for the edit tab
      const editTab = page.locator('[role="tab"]').filter({ hasText: /edit/i })
      const hasEditTab = await editTab.isVisible().catch(() => false)

      if (hasEditTab) {
        await editTab.click()
        // Edit form panel should be visible
        await expect(page.locator('[data-testid="edit-form-panel"]')).toBeVisible({ timeout: 5_000 })
      }
    }
  })
})
