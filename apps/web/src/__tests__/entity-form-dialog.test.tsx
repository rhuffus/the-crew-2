import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EntityFormDialog } from '@/components/visual-shell/entity-form-dialog'

vi.mock('@/api/departments', () => ({
  departmentsApi: {
    list: vi.fn().mockResolvedValue([
      { id: 'd1', name: 'Engineering' },
      { id: 'd2', name: 'Marketing' },
    ]),
  },
}))

vi.mock('@/api/roles', () => ({
  rolesApi: {
    list: vi.fn().mockResolvedValue([
      { id: 'r1', name: 'Developer' },
    ]),
  },
}))

vi.mock('@/api/capabilities', () => ({
  capabilitiesApi: {
    list: vi.fn().mockResolvedValue([
      { id: 'c1', name: 'Web Dev' },
    ]),
  },
}))

vi.mock('@/api/agent-archetypes', () => ({
  agentArchetypesApi: {
    list: vi.fn().mockResolvedValue([
      { id: 'a1', name: 'Code Agent' },
    ]),
  },
}))

function renderDialog(props: Partial<React.ComponentProps<typeof EntityFormDialog>> = {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const defaults = {
    nodeType: 'department' as const,
    projectId: 'p1',
    onSubmit: vi.fn().mockResolvedValue({ id: 'new-1' }),
    onClose: vi.fn(),
    ...props,
  }
  return {
    ...render(
      <QueryClientProvider client={qc}>
        <EntityFormDialog {...defaults} />
      </QueryClientProvider>,
    ),
    onSubmit: defaults.onSubmit,
    onClose: defaults.onClose,
  }
}

describe('EntityFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render dialog with title', async () => {
    renderDialog()
    await waitFor(() => {
      expect(screen.getByTestId('entity-form-dialog')).toBeInTheDocument()
    })
    expect(screen.getByText('New Department')).toBeInTheDocument()
  })

  it('should render name field', async () => {
    renderDialog()
    await waitFor(() => {
      expect(screen.getByTestId('input-name')).toBeInTheDocument()
    })
  })

  it('should render description and mandate fields for department', async () => {
    renderDialog({ nodeType: 'department' })
    await waitFor(() => {
      expect(screen.getByTestId('input-description')).toBeInTheDocument()
      expect(screen.getByTestId('input-mandate')).toBeInTheDocument()
    })
  })

  it('should close on backdrop click', async () => {
    const { onClose } = renderDialog()
    await waitFor(() => {
      expect(screen.getByTestId('entity-form-dialog')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByTestId('entity-form-backdrop'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should close on close button click', async () => {
    const { onClose } = renderDialog()
    await waitFor(() => {
      expect(screen.getByTestId('entity-form-close')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByTestId('entity-form-close'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should close on Escape key', async () => {
    const { onClose } = renderDialog()
    await waitFor(() => {
      expect(screen.getByTestId('entity-form-dialog')).toBeInTheDocument()
    })
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('should disable submit when required fields are empty', async () => {
    renderDialog()
    await waitFor(() => {
      expect(screen.getByTestId('entity-form-submit')).toBeInTheDocument()
    })
    expect(screen.getByTestId('entity-form-submit')).toBeDisabled()
  })

  it('should enable submit when required fields are filled', async () => {
    renderDialog()
    await waitFor(() => {
      expect(screen.getByTestId('input-name')).toBeInTheDocument()
    })
    fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Test Dept' } })
    expect(screen.getByTestId('entity-form-submit')).not.toBeDisabled()
  })

  it('should call onSubmit with form data', async () => {
    const { onSubmit, onClose } = renderDialog()
    await waitFor(() => {
      expect(screen.getByTestId('input-name')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Test Dept' } })
    fireEvent.change(screen.getByTestId('input-description'), { target: { value: 'A description' } })
    fireEvent.click(screen.getByTestId('entity-form-submit'))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('department', expect.objectContaining({
        name: 'Test Dept',
        description: 'A description',
      }))
    })

    expect(onClose).toHaveBeenCalled()
  })

  it('should call onCreated with entity id on success', async () => {
    const onCreated = vi.fn()
    renderDialog({ onCreated })
    await waitFor(() => {
      expect(screen.getByTestId('input-name')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Test' } })
    fireEvent.click(screen.getByTestId('entity-form-submit'))

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledWith('department', 'new-1')
    })
  })

  it('should auto-fill scope fields at L2', async () => {
    renderDialog({
      nodeType: 'role',
      scopeContext: { departmentId: 'd1' },
    })

    await waitFor(() => {
      const deptSelect = screen.getByTestId('input-departmentId') as HTMLSelectElement
      expect(deptSelect.value).toBe('d1')
    })
  })

  it('should show disabled select for auto-filled scope field', async () => {
    renderDialog({
      nodeType: 'role',
      scopeContext: { departmentId: 'd1' },
    })

    await waitFor(() => {
      const deptSelect = screen.getByTestId('input-departmentId')
      expect(deptSelect).toBeDisabled()
    })
  })

  it('should render select options from reference data', async () => {
    renderDialog({ nodeType: 'department' })

    await waitFor(() => {
      const parentSelect = screen.getByTestId('input-parentId') as HTMLSelectElement
      expect(parentSelect.options.length).toBeGreaterThan(1) // "Select..." + options
    })
  })

  it('should show loading state while ref data loads', () => {
    // Force loading by using a QueryClient that hasn't resolved
    const qc = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          // Don't auto-resolve
          staleTime: Infinity,
        },
      },
    })

    render(
      <QueryClientProvider client={qc}>
        <EntityFormDialog
          nodeType='agent-archetype'
          projectId='p1'
          onSubmit={vi.fn()}
          onClose={vi.fn()}
        />
      </QueryClientProvider>,
    )

    expect(screen.getByTestId('entity-form-loading')).toBeInTheDocument()
  })

  it('should render policy with conditional departmentId field', async () => {
    renderDialog({ nodeType: 'policy' })

    await waitFor(() => {
      expect(screen.getByTestId('input-scope')).toBeInTheDocument()
    })

    // With scope=global (default), departmentId should not be visible
    expect(screen.queryByTestId('field-departmentId')).not.toBeInTheDocument()

    // Change scope to department
    fireEvent.change(screen.getByTestId('input-scope'), { target: { value: 'department' } })

    // Now departmentId should appear
    expect(screen.getByTestId('field-departmentId')).toBeInTheDocument()
  })

  it('should render skill with tags input', async () => {
    renderDialog({ nodeType: 'skill' })

    await waitFor(() => {
      expect(screen.getByTestId('input-tags')).toBeInTheDocument()
    })
  })

  it('should convert comma-separated tags to array on submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ id: 's1' })
    renderDialog({ nodeType: 'skill', onSubmit })

    await waitFor(() => {
      expect(screen.getByTestId('input-name')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'TS' } })
    fireEvent.change(screen.getByTestId('input-category'), { target: { value: 'tech' } })
    fireEvent.change(screen.getByTestId('input-tags'), { target: { value: 'typescript, frontend, react' } })
    fireEvent.click(screen.getByTestId('entity-form-submit'))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('skill', expect.objectContaining({
        tags: ['typescript', 'frontend', 'react'],
      }))
    })
  })

  it('should render contract with party-select fields', async () => {
    renderDialog({ nodeType: 'contract' })

    await waitFor(() => {
      expect(screen.getByTestId('input-provider-type')).toBeInTheDocument()
      expect(screen.getByTestId('input-provider-id')).toBeInTheDocument()
      expect(screen.getByTestId('input-consumer-type')).toBeInTheDocument()
      expect(screen.getByTestId('input-consumer-id')).toBeInTheDocument()
    })
  })

  it('should render agent-assignment with archetypeId select', async () => {
    renderDialog({ nodeType: 'agent-assignment' })

    await waitFor(() => {
      const archSelect = screen.getByTestId('input-archetypeId') as HTMLSelectElement
      expect(archSelect).toBeInTheDocument()
      // Should have "Select..." + "Code Agent"
      expect(archSelect.options.length).toBe(2)
    })
  })

  it('should show creating state during submit', async () => {
    let resolveSubmit: (v: unknown) => void
    const onSubmit = vi.fn().mockReturnValue(new Promise((r) => { resolveSubmit = r }))
    renderDialog({ onSubmit })

    await waitFor(() => {
      expect(screen.getByTestId('input-name')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Test' } })
    fireEvent.click(screen.getByTestId('entity-form-submit'))

    expect(screen.getByText('Creating...')).toBeInTheDocument()

    // Clean up
    await waitFor(async () => {
      resolveSubmit!({ id: '1' })
    })
  })

  it('should stay open on submit error', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('API Error'))
    const onClose = vi.fn()
    renderDialog({ onSubmit, onClose })

    await waitFor(() => {
      expect(screen.getByTestId('input-name')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Test' } })
    fireEvent.click(screen.getByTestId('entity-form-submit'))

    await waitFor(() => {
      expect(onClose).not.toHaveBeenCalled()
    })

    // Dialog should still be visible
    expect(screen.getByTestId('entity-form-dialog')).toBeInTheDocument()
  })

  it('should show cancel button', async () => {
    const { onClose } = renderDialog()
    await waitFor(() => {
      expect(screen.getByTestId('entity-form-cancel')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByTestId('entity-form-cancel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should return null for unknown nodeType', () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const { container } = render(
      <QueryClientProvider client={qc}>
        <EntityFormDialog
          nodeType={'company' as never}
          projectId='p1'
          onSubmit={vi.fn()}
          onClose={vi.fn()}
        />
      </QueryClientProvider>,
    )
    expect(container.innerHTML).toBe('')
  })

  it('should set default values from schema', async () => {
    renderDialog({ nodeType: 'policy' })

    await waitFor(() => {
      const scopeSelect = screen.getByTestId('input-scope') as HTMLSelectElement
      expect(scopeSelect.value).toBe('global')
    })

    const typeSelect = screen.getByTestId('input-type') as HTMLSelectElement
    expect(typeSelect.value).toBe('constraint')

    const enforcementSelect = screen.getByTestId('input-enforcement') as HTMLSelectElement
    expect(enforcementSelect.value).toBe('mandatory')
  })
})
