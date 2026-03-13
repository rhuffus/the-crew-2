import { test, expect } from '@playwright/test'
import { goToOrgCanvas, waitForCanvasReady, waitForNodes } from './helpers'

test.describe('Canvas Cursor Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await goToOrgCanvas(page)
    await waitForCanvasReady(page)
    await waitForNodes(page)
  })

  test('pane idle shows default cursor', async ({ page }) => {
    const cursor = await page.evaluate(() => {
      const el = document.querySelector('.react-flow__pane')
      return el ? window.getComputedStyle(el).cursor : null
    })
    expect(cursor).toBe('default')
  })

  test('node hover shows pointer cursor', async ({ page }) => {
    const node = page.locator('.react-flow__node').first()
    await node.hover()

    const cursor = await node.evaluate((el) => window.getComputedStyle(el).cursor)
    expect(cursor).toBe('pointer')
  })

  test('edge hover shows pointer cursor', async ({ page }) => {
    const edgeInteraction = page.locator('.react-flow__edge-interaction').first()
    const hasEdge = await edgeInteraction.isVisible().catch(() => false)

    if (hasEdge) {
      await edgeInteraction.hover()
      const cursor = await edgeInteraction.evaluate((el) => window.getComputedStyle(el).cursor)
      expect(cursor).toBe('pointer')
    }
  })

  test('pane drag shows grabbing cursor', async ({ page }) => {
    const pane = page.locator('.react-flow__pane')
    const box = await pane.boundingBox()
    if (!box) return

    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2

    await page.mouse.move(cx, cy)
    await page.mouse.down()
    await page.mouse.move(cx + 50, cy + 50)

    const cursor = await page.evaluate(() => {
      const el = document.querySelector('.react-flow__pane.dragging')
      return el ? window.getComputedStyle(el).cursor : null
    })
    expect(cursor).toBe('grabbing')

    await page.mouse.up()
  })

  test('node drag shows grabbing cursor', async ({ page }) => {
    const node = page.locator('.react-flow__node').first()
    const box = await node.boundingBox()
    if (!box) return

    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2

    await page.mouse.move(cx, cy)
    await page.mouse.down()
    await page.mouse.move(cx + 30, cy + 30)

    const hasDragging = await page.evaluate(() => {
      const el = document.querySelector('.react-flow__node.dragging')
      return !!el
    })

    if (hasDragging) {
      const cursor = await page.evaluate(() => {
        const el = document.querySelector('.react-flow__node.dragging')
        return el ? window.getComputedStyle(el).cursor : null
      })
      expect(cursor).toBe('grabbing')
    }

    await page.mouse.up()
  })
})
