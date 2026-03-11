import { type Page } from '@playwright/test'

/**
 * Default test project ID used across e2e tests.
 * All backend services use in-memory repos, so this can be any valid UUID-like string
 * as long as data was seeded for it.
 */
export const TEST_PROJECT_ID = 'test-project-1'

/** Navigate to the org canvas for the test project */
export async function goToOrgCanvas(page: Page) {
  await page.goto(`/projects/${TEST_PROJECT_ID}/org`)
  await page.waitForSelector('[data-testid="visual-shell"]', { timeout: 15_000 })
}

/** Wait for the canvas to finish loading (no loading spinner) */
export async function waitForCanvasReady(page: Page) {
  // Wait for loading indicator to disappear
  await page.waitForSelector('[data-testid="canvas-loading"]', { state: 'hidden', timeout: 15_000 }).catch(() => {
    // May already be gone
  })
  // Wait for the flow wrapper to be present
  await page.waitForSelector('[data-testid="canvas-flow-wrapper"]', { timeout: 15_000 })
}

/** Wait for nodes to render on the canvas */
export async function waitForNodes(page: Page, minCount = 1) {
  await page.waitForFunction(
    (min) => document.querySelectorAll('.react-flow__node').length >= min,
    minCount,
    { timeout: 15_000 },
  )
}

/** Get the count of rendered nodes */
export async function getNodeCount(page: Page): Promise<number> {
  return page.locator('.react-flow__node').count()
}

/** Get the count of rendered edges */
export async function getEdgeCount(page: Page): Promise<number> {
  return page.locator('.react-flow__edge').count()
}

/** Click a toolbar mode button */
export async function selectToolbarMode(page: Page, mode: string) {
  await page.click(`[data-testid="mode-${mode}"]`)
}

/** Open the node palette */
export async function openNodePalette(page: Page) {
  await page.click('[data-testid="node-palette-button"]')
  await page.waitForSelector('[data-testid="node-palette"]', { timeout: 5_000 })
}

/** Open the relationship palette */
export async function openRelationshipPalette(page: Page) {
  await page.click('[data-testid="rel-palette-button"]')
  await page.waitForSelector('[data-testid="relationship-palette"]', { timeout: 5_000 })
}

/** Check if the visual shell is fully loaded */
export async function isShellReady(page: Page): Promise<boolean> {
  const shell = page.locator('[data-testid="visual-shell"]')
  return shell.isVisible()
}
