import { test, expect } from '@playwright/test'
import { TEST_PROJECT_ID, goToOrgCanvas, waitForCanvasReady, waitForNodes, getNodeCount } from './helpers'

test.describe('Canvas Navigation', () => {
  test('loads the org canvas and renders nodes', async ({ page }) => {
    await goToOrgCanvas(page)
    await waitForCanvasReady(page)

    // Visual shell should be present
    await expect(page.locator('[data-testid="visual-shell"]')).toBeVisible()

    // Toolbar should be visible
    await expect(page.locator('[data-testid="canvas-toolbar"]')).toBeVisible()

    // Canvas flow wrapper should be present
    await expect(page.locator('[data-testid="canvas-flow-wrapper"]')).toBeVisible()
  })

  test('drills down to department on node double-click', async ({ page }) => {
    await goToOrgCanvas(page)
    await waitForCanvasReady(page)
    await waitForNodes(page)

    // Find a department node (has drilldown indicator)
    const deptNode = page.locator('[data-testid="visual-node-department"]').first()
    const hasDeptNode = await deptNode.isVisible().catch(() => false)

    if (hasDeptNode) {
      // Double-click to drill down
      await deptNode.dblclick()

      // URL should change to department route
      await page.waitForURL(/\/departments\//, { timeout: 10_000 })
      expect(page.url()).toContain('/departments/')

      // New canvas should load
      await waitForCanvasReady(page)
      await expect(page.locator('[data-testid="visual-shell"]')).toBeVisible()
    }
  })

  test('navigates back from department to org via Escape', async ({ page }) => {
    await goToOrgCanvas(page)
    await waitForCanvasReady(page)
    await waitForNodes(page)

    const deptNode = page.locator('[data-testid="visual-node-department"]').first()
    const hasDeptNode = await deptNode.isVisible().catch(() => false)

    if (hasDeptNode) {
      // Drill in
      await deptNode.dblclick()
      await page.waitForURL(/\/departments\//, { timeout: 10_000 })
      await waitForCanvasReady(page)

      // Press Escape to drill out (with no selection, goes back)
      await page.keyboard.press('Escape')
      await page.waitForURL(/\/org/, { timeout: 10_000 })
      expect(page.url()).toContain('/org')
    }
  })
})
