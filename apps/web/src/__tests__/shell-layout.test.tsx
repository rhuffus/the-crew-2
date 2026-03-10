import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithRouter } from './test-utils'

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

describe('shell layout', () => {
  it('should render sidebar on platform page', async () => {
    renderWithRouter('/')
    await waitFor(() => {
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    })
  })

  it('should render TheCrew brand in sidebar', async () => {
    renderWithRouter('/')
    await waitFor(() => {
      expect(screen.getByText('TheCrew')).toBeInTheDocument()
    })
  })

  it('should show platform nav at /', async () => {
    renderWithRouter('/')
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Projects/ })).toBeInTheDocument()
    })
  })

  it('should show admin nav with sections inside admin workspace', async () => {
    renderWithRouter('/projects/acme-corp/admin/overview')
    await waitFor(() => {
      expect(screen.getByText('Design Studio')).toBeInTheDocument()
      expect(screen.getByText('Governance')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Departments/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Capabilities/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Workflows/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Contracts/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Releases/ })).toBeInTheDocument()
    })
  })

  it('should show back link in admin workspace', async () => {
    renderWithRouter('/projects/acme-corp/admin/overview')
    await waitFor(() => {
      expect(screen.getByText('All projects')).toBeInTheDocument()
    })
  })

  it('should render header with breadcrumbs on platform page', async () => {
    renderWithRouter('/')
    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
    })
  })

  it('should show breadcrumbs for admin pages', async () => {
    renderWithRouter('/projects/acme-corp/admin/departments')
    await waitFor(() => {
      const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' })
      expect(breadcrumb).toHaveTextContent('Platform')
      expect(breadcrumb).toHaveTextContent('acme-corp')
    })
  })

  it('should show draft badge in admin workspace', async () => {
    renderWithRouter('/projects/acme-corp/admin/overview')
    await waitFor(() => {
      expect(screen.getByText('Draft')).toBeInTheDocument()
    })
  })
})
