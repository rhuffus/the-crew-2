import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithRouter } from './test-utils'

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

describe('visual shell', () => {
  it('should render visual shell at project org route', async () => {
    await renderWithRouter('/projects/acme-corp/org')
    await waitFor(() => {
      expect(screen.getByTestId('visual-shell')).toBeInTheDocument()
    })
  })

  it('should render topbar with breadcrumbs', async () => {
    await renderWithRouter('/projects/acme-corp/org')
    await waitFor(() => {
      expect(screen.getByTestId('visual-topbar')).toBeInTheDocument()
      const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' })
      expect(breadcrumb).toHaveTextContent('acme-corp')
    })
  })

  it('should render TheCrew link in topbar', async () => {
    await renderWithRouter('/projects/acme-corp/org')
    await waitFor(() => {
      expect(screen.getByText('TheCrew')).toBeInTheDocument()
    })
  })

  it('should render draft badge', async () => {
    await renderWithRouter('/projects/acme-corp/org')
    await waitFor(() => {
      expect(screen.getByText('Draft')).toBeInTheDocument()
    })
  })

  it('should render view mode toggle with Visual active and Admin link', async () => {
    await renderWithRouter('/projects/acme-corp/org')
    await waitFor(() => {
      expect(screen.getByText('Visual')).toBeInTheDocument()
      expect(screen.getByText('Admin')).toBeInTheDocument()
    })
  })

  it('should render explorer panel', async () => {
    await renderWithRouter('/projects/acme-corp/org')
    await waitFor(() => {
      expect(screen.getByTestId('explorer')).toBeInTheDocument()
    })
  })

  it('should render canvas viewport', async () => {
    await renderWithRouter('/projects/acme-corp/org')
    await waitFor(() => {
      expect(screen.getByTestId('canvas-viewport')).toBeInTheDocument()
    })
  })

  it('should render canvas toolbar', async () => {
    await renderWithRouter('/projects/acme-corp/org')
    await waitFor(() => {
      expect(screen.getByTestId('canvas-toolbar')).toBeInTheDocument()
    })
  })

  it('should render inspector panel', async () => {
    await renderWithRouter('/projects/acme-corp/org')
    await waitFor(() => {
      expect(screen.getByTestId('inspector')).toBeInTheDocument()
    })
  })

  it('should render chat dock', async () => {
    await renderWithRouter('/projects/acme-corp/org')
    await waitFor(() => {
      expect(screen.getByTestId('chat-dock')).toBeInTheDocument()
    })
  })

  it('should show scope label in toolbar', async () => {
    await renderWithRouter('/projects/acme-corp/org')
    await waitFor(() => {
      expect(screen.getByText('Scope: Company Org')).toBeInTheDocument()
    })
  })

  it('should render zoom controls', async () => {
    await renderWithRouter('/projects/acme-corp/org')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Zoom in' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Zoom out' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Fit view' })).toBeInTheDocument()
    })
  })
})
