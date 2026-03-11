import { test, expect } from '@playwright/test'
import { goToOrgCanvas, waitForCanvasReady, openNodePalette } from './helpers'

test.describe('Entity Creation from Canvas', () => {
  test('node palette opens and shows categorized entity types', async ({ page }) => {
    await goToOrgCanvas(page)
    await waitForCanvasReady(page)

    await openNodePalette(page)

    const palette = page.locator('[data-testid="node-palette"]')
    await expect(palette).toBeVisible()

    // Should have a search input
    await expect(page.locator('[data-testid="node-palette-search"]')).toBeVisible()

    // Should have at least one palette group (organization, capabilities, etc.)
    const groups = palette.locator('[data-testid^="node-palette-group-"]')
    expect(await groups.count()).toBeGreaterThan(0)
  })

  test('clicking a palette item opens entity form dialog', async ({ page }) => {
    await goToOrgCanvas(page)
    await waitForCanvasReady(page)

    await openNodePalette(page)

    // Click on "department" in the palette
    const deptItem = page.locator('[data-testid="node-palette-item-department"]')
    const hasDeptItem = await deptItem.isVisible().catch(() => false)

    if (hasDeptItem) {
      await deptItem.click()

      // Entity form dialog should open
      const dialog = page.locator('[data-testid="entity-form-dialog"]')
      await expect(dialog).toBeVisible({ timeout: 5_000 })

      // Should have a name field
      const nameInput = page.locator('[data-testid="input-name"]')
      await expect(nameInput).toBeVisible()

      // Should have submit and cancel buttons
      await expect(page.locator('[data-testid="entity-form-submit"]')).toBeVisible()
      await expect(page.locator('[data-testid="entity-form-cancel"]')).toBeVisible()
    }
  })

  test('entity form dialog closes on cancel', async ({ page }) => {
    await goToOrgCanvas(page)
    await waitForCanvasReady(page)

    await openNodePalette(page)

    const deptItem = page.locator('[data-testid="node-palette-item-department"]')
    const hasDeptItem = await deptItem.isVisible().catch(() => false)

    if (hasDeptItem) {
      await deptItem.click()
      await expect(page.locator('[data-testid="entity-form-dialog"]')).toBeVisible({ timeout: 5_000 })

      // Click cancel
      await page.click('[data-testid="entity-form-cancel"]')

      // Dialog should close
      await expect(page.locator('[data-testid="entity-form-dialog"]')).not.toBeVisible()
    }
  })

  test('entity form dialog closes on Escape', async ({ page }) => {
    await goToOrgCanvas(page)
    await waitForCanvasReady(page)

    await openNodePalette(page)

    const deptItem = page.locator('[data-testid="node-palette-item-department"]')
    const hasDeptItem = await deptItem.isVisible().catch(() => false)

    if (hasDeptItem) {
      await deptItem.click()
      await expect(page.locator('[data-testid="entity-form-dialog"]')).toBeVisible({ timeout: 5_000 })

      // Press Escape
      await page.keyboard.press('Escape')

      // Dialog should close
      await expect(page.locator('[data-testid="entity-form-dialog"]')).not.toBeVisible()
    }
  })

  test('node palette search filters items', async ({ page }) => {
    await goToOrgCanvas(page)
    await waitForCanvasReady(page)

    await openNodePalette(page)

    const searchInput = page.locator('[data-testid="node-palette-search"]')
    const paletteItems = page.locator('[data-testid^="node-palette-item-"]')

    // Count initial items
    const initialCount = await paletteItems.count()
    expect(initialCount).toBeGreaterThan(0)

    // Type a search query that should filter
    await searchInput.fill('department')

    // Should have fewer items (or exactly one match)
    const filteredCount = await paletteItems.count()
    expect(filteredCount).toBeLessThanOrEqual(initialCount)
    expect(filteredCount).toBeGreaterThan(0)
  })
})
