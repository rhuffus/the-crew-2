import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CreateProjectForm } from '@/components/projects/create-project-dialog'

vi.stubGlobal('fetch', vi.fn())

const navigateMock = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
}))

vi.mock('@/lib/bootstrap-api', () => ({
  bootstrapApi: {
    bootstrap: vi.fn().mockResolvedValue({
      projectSeedId: '42',
      constitutionId: '42',
      companyUoId: 'uo-1',
      ceoAgentId: 'ceo-1',
      maturityPhase: 'seed',
      nextStep: 'bootstrap-conversation',
    }),
  },
}))

vi.mock('@/stores/visual-workspace-store', () => ({
  useVisualWorkspaceStore: Object.assign(
    () => ({}),
    { getState: () => ({ openChatView: vi.fn() }) },
  ),
}))

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('CreateProjectForm', () => {
  beforeEach(() => {
    navigateMock.mockReset()
  })

  it('should show simplified form with name and description only', () => {
    renderWithQuery(<CreateProjectForm />)
    expect(screen.getByTestId('create-project-wizard')).toBeDefined()
    expect(screen.getByLabelText(/company name/i)).toBeDefined()
    expect(screen.getByLabelText(/short description/i)).toBeDefined()
  })

  it('should NOT show wizard steps or progress bar', () => {
    renderWithQuery(<CreateProjectForm />)
    expect(screen.queryByText(/step.*of/i)).toBeNull()
    expect(screen.queryByRole('button', { name: /next/i })).toBeNull()
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

  it('should disable submit when fields are empty', () => {
    renderWithQuery(<CreateProjectForm />)
    const submitBtn = screen.getByRole('button', { name: /create company/i })
    expect(submitBtn).toHaveProperty('disabled', true)
  })

  it('should enable submit when both fields are filled', () => {
    renderWithQuery(<CreateProjectForm />)
    fireEvent.change(screen.getByLabelText(/company name/i), { target: { value: 'Acme Corp' } })
    fireEvent.change(screen.getByLabelText(/short description/i), { target: { value: 'Build things' } })
    const submitBtn = screen.getByRole('button', { name: /create company/i })
    expect(submitBtn).toHaveProperty('disabled', false)
  })

  it('should create project, bootstrap, and navigate to org route on submit', async () => {
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

    fireEvent.change(screen.getByLabelText(/company name/i), { target: { value: 'Acme Corp' } })
    fireEvent.change(screen.getByLabelText(/short description/i), { target: { value: 'Build things' } })
    fireEvent.click(screen.getByRole('button', { name: /create company/i }))

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith({
        to: '/projects/$projectSlug/org',
        params: { projectSlug: 'acme-corp' },
      })
    })
  })
})
