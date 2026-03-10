import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ReleaseDto, VisualDiffSummary } from '@the-crew/shared-types'
import { DiffSelector } from '../components/visual-shell/diff-selector'

function makeRelease(overrides: Partial<ReleaseDto>): ReleaseDto {
  return {
    id: 'rel-1',
    projectId: 'p1',
    version: 'v1.0',
    status: 'published',
    notes: '',
    snapshot: null,
    validationIssues: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    publishedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

const defaultSummary: VisualDiffSummary = {
  nodesAdded: 3,
  nodesRemoved: 1,
  nodesModified: 5,
  nodesUnchanged: 10,
  edgesAdded: 2,
  edgesRemoved: 1,
  edgesModified: 3,
  edgesUnchanged: 8,
}

describe('DiffSelector', () => {
  const releases = [
    makeRelease({ id: 'rel-1', version: 'v1.0', status: 'published' }),
    makeRelease({ id: 'rel-2', version: 'v2.0', status: 'published' }),
    makeRelease({ id: 'rel-3', version: 'v3.0-draft', status: 'draft' }),
  ]

  it('should render base and compare dropdowns', () => {
    render(
      <DiffSelector
        releases={releases}
        baseReleaseId="rel-1"
        compareReleaseId="rel-2"
        summary={null}
        onBaseChange={vi.fn()}
        onCompareChange={vi.fn()}
        onSwap={vi.fn()}
      />,
    )

    expect(screen.getByTestId('diff-base-select')).toBeInTheDocument()
    expect(screen.getByTestId('diff-compare-select')).toBeInTheDocument()
  })

  it('should only show published releases in dropdowns', () => {
    render(
      <DiffSelector
        releases={releases}
        baseReleaseId={null}
        compareReleaseId={null}
        summary={null}
        onBaseChange={vi.fn()}
        onCompareChange={vi.fn()}
        onSwap={vi.fn()}
      />,
    )

    const baseSelect = screen.getByTestId('diff-base-select')
    const options = baseSelect.querySelectorAll('option')
    // "Select release..." + v1.0 + v2.0 (no v3.0-draft)
    expect(options).toHaveLength(3)
    expect(options[1]!.textContent).toBe('v1.0')
    expect(options[2]!.textContent).toBe('v2.0')
  })

  it('should call onBaseChange when base dropdown changes', () => {
    const onBaseChange = vi.fn()
    render(
      <DiffSelector
        releases={releases}
        baseReleaseId={null}
        compareReleaseId={null}
        summary={null}
        onBaseChange={onBaseChange}
        onCompareChange={vi.fn()}
        onSwap={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByTestId('diff-base-select'), { target: { value: 'rel-1' } })
    expect(onBaseChange).toHaveBeenCalledWith('rel-1')
  })

  it('should call onCompareChange when compare dropdown changes', () => {
    const onCompareChange = vi.fn()
    render(
      <DiffSelector
        releases={releases}
        baseReleaseId="rel-1"
        compareReleaseId={null}
        summary={null}
        onBaseChange={vi.fn()}
        onCompareChange={onCompareChange}
        onSwap={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByTestId('diff-compare-select'), { target: { value: 'rel-2' } })
    expect(onCompareChange).toHaveBeenCalledWith('rel-2')
  })

  it('should call onSwap when swap button is clicked', () => {
    const onSwap = vi.fn()
    render(
      <DiffSelector
        releases={releases}
        baseReleaseId="rel-1"
        compareReleaseId="rel-2"
        summary={null}
        onBaseChange={vi.fn()}
        onCompareChange={vi.fn()}
        onSwap={onSwap}
      />,
    )

    fireEvent.click(screen.getByTestId('diff-swap-button'))
    expect(onSwap).toHaveBeenCalledOnce()
  })

  it('should disable swap button when releases are not both selected', () => {
    render(
      <DiffSelector
        releases={releases}
        baseReleaseId="rel-1"
        compareReleaseId={null}
        summary={null}
        onBaseChange={vi.fn()}
        onCompareChange={vi.fn()}
        onSwap={vi.fn()}
      />,
    )

    expect(screen.getByTestId('diff-swap-button')).toBeDisabled()
  })

  it('should display summary when provided', () => {
    render(
      <DiffSelector
        releases={releases}
        baseReleaseId="rel-1"
        compareReleaseId="rel-2"
        summary={defaultSummary}
        onBaseChange={vi.fn()}
        onCompareChange={vi.fn()}
        onSwap={vi.fn()}
      />,
    )

    const summary = screen.getByTestId('diff-summary')
    expect(summary.textContent).toContain('+3')
    expect(summary.textContent).toContain('−1')
    expect(summary.textContent).toContain('~5')
    expect(summary.textContent).toContain('nodes')
    expect(summary.textContent).toContain('edges')
  })

  it('should not show summary when null', () => {
    render(
      <DiffSelector
        releases={releases}
        baseReleaseId="rel-1"
        compareReleaseId="rel-2"
        summary={null}
        onBaseChange={vi.fn()}
        onCompareChange={vi.fn()}
        onSwap={vi.fn()}
      />,
    )

    expect(screen.queryByTestId('diff-summary')).not.toBeInTheDocument()
  })
})
