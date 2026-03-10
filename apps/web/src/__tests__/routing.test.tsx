import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithRouter } from './test-utils'

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

describe('routing', () => {
  it('should render platform home at /', async () => {
    renderWithRouter('/')
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Projects' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /new project/i })).toBeInTheDocument()
    })
  })

  it('should render visual shell at /projects/:id', async () => {
    renderWithRouter('/projects/acme-corp/org')
    await waitFor(() => {
      expect(screen.getByTestId('visual-shell')).toBeInTheDocument()
    })
  })

  it('should render org canvas view', async () => {
    renderWithRouter('/projects/acme-corp/org')
    await waitFor(() => {
      expect(screen.getByTestId('canvas-viewport')).toBeInTheDocument()
    })
  })

  it('should render admin departments page', async () => {
    renderWithRouter('/projects/acme-corp/admin/departments')
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Departments' })).toBeInTheDocument()
    })
  })

  it('should render admin capabilities page', async () => {
    renderWithRouter('/projects/acme-corp/admin/capabilities')
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Capabilities' })).toBeInTheDocument()
    })
  })

  it('should render admin company model page', async () => {
    renderWithRouter('/projects/acme-corp/admin/company-model')
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Company Model' })).toBeInTheDocument()
    })
  })

  it('should render admin contracts page', async () => {
    renderWithRouter('/projects/acme-corp/admin/contracts')
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Contracts' })).toBeInTheDocument()
    })
  })

  it('should render admin workflows page', async () => {
    renderWithRouter('/projects/acme-corp/admin/workflows')
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Workflows' })).toBeInTheDocument()
    })
  })

  it('should render admin releases page', async () => {
    renderWithRouter('/projects/acme-corp/admin/releases')
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Releases' })).toBeInTheDocument()
    })
  })

  it('should render admin validations page', async () => {
    renderWithRouter('/projects/acme-corp/admin/validations')
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Validations' })).toBeInTheDocument()
    })
  })

  it('should render admin audit page', async () => {
    renderWithRouter('/projects/acme-corp/admin/audit')
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Audit' })).toBeInTheDocument()
    })
  })

  it('should render not found for unknown routes', async () => {
    renderWithRouter('/unknown-path')
    await waitFor(() => {
      expect(screen.getByText('Page not found')).toBeInTheDocument()
    })
  })
})
