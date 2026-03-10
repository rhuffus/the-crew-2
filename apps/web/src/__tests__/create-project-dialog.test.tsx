import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CreateProjectDialog } from '@/components/projects/create-project-dialog'

vi.stubGlobal('fetch', vi.fn())

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('CreateProjectDialog', () => {
  it('should show "New Project" button initially', () => {
    renderWithQuery(<CreateProjectDialog />)
    expect(screen.getByRole('button', { name: /new project/i })).toBeDefined()
  })

  it('should show form when button is clicked', () => {
    renderWithQuery(<CreateProjectDialog />)
    fireEvent.click(screen.getByRole('button', { name: /new project/i }))
    expect(screen.getByLabelText(/name/i)).toBeDefined()
    expect(screen.getByLabelText(/description/i)).toBeDefined()
  })

  it('should close form on cancel', () => {
    renderWithQuery(<CreateProjectDialog />)
    fireEvent.click(screen.getByRole('button', { name: /new project/i }))
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.getByRole('button', { name: /new project/i })).toBeDefined()
  })

  it('should have required name field', () => {
    renderWithQuery(<CreateProjectDialog />)
    fireEvent.click(screen.getByRole('button', { name: /new project/i }))
    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement
    expect(nameInput.required).toBe(true)
  })
})
