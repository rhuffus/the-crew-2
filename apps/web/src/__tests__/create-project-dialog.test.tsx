import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CreateProjectForm } from '@/components/projects/create-project-dialog'

vi.stubGlobal('fetch', vi.fn())

const navigateMock = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
}))

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('CreateProjectForm', () => {
  beforeEach(() => {
    navigateMock.mockReset()
  })

  it('should show wizard form directly', () => {
    renderWithQuery(<CreateProjectForm />)
    expect(screen.getByTestId('create-project-wizard')).toBeDefined()
    expect(screen.getByLabelText(/company name/i)).toBeDefined()
    expect(screen.getByLabelText(/mission/i)).toBeDefined()
  })

  it('should have required name field', () => {
    renderWithQuery(<CreateProjectForm />)
    const nameInput = screen.getByLabelText(/company name/i) as HTMLInputElement
    expect(nameInput.required).toBe(true)
  })

  it('should have a cancel button', () => {
    renderWithQuery(<CreateProjectForm />)
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDefined()
  })

  it('should navigate to slug-based org route on successful creation', async () => {
    const createdProject = {
      id: '42',
      name: 'Acme Corp',
      description: 'Build things',
      status: 'active',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(createdProject),
    } as Response)

    renderWithQuery(<CreateProjectForm />)

    // Step 1: fill required fields
    fireEvent.change(screen.getByLabelText(/company name/i), { target: { value: 'Acme Corp' } })
    fireEvent.change(screen.getByLabelText(/mission/i), { target: { value: 'Build things' } })

    // Advance to step 2, then step 3
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    // Submit from step 3
    fireEvent.click(screen.getByRole('button', { name: /bootstrap company/i }))

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith({
        to: '/projects/$projectSlug/org',
        params: { projectSlug: 'acme-corp' },
      })
    })
  })
})
