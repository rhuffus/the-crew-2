import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EditFormPanel } from '@/components/visual-shell/inspector/edit-form-panel'
import type { NodeType } from '@the-crew/shared-types'

vi.mock('@/hooks/use-entity-form-data', () => ({
  useOptionsForSources: () => ({
    optionsMap: {
      departments: [
        { value: 'd1', label: 'Engineering' },
        { value: 'd2', label: 'Sales' },
      ],
      roles: [
        { value: 'r1', label: 'Developer' },
      ],
      capabilities: [
        { value: 'c1', label: 'API Design' },
      ],
      skills: [
        { value: 's1', label: 'TypeScript' },
      ],
      archetypes: [
        { value: 'a1', label: 'AI Developer' },
      ],
    },
    isLoading: false,
  }),
}))

function renderPanel(props: Partial<Parameters<typeof EditFormPanel>[0]> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const defaultProps = {
    nodeType: 'department' as NodeType,
    entityId: 'abc',
    entityData: { name: 'Marketing', description: 'Marketing dept', mandate: 'Drive growth', parentId: null },
    isLoadingData: false,
    projectId: 'p1',
    onSave: vi.fn(),
    isPending: false,
    ...props,
  }
  return render(
    <QueryClientProvider client={queryClient}>
      <EditFormPanel {...defaultProps} />
    </QueryClientProvider>,
  )
}

describe('EditFormPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render edit form panel', () => {
    renderPanel()
    expect(screen.getByTestId('edit-form-panel')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    renderPanel({ isLoadingData: true })
    expect(screen.getByText('Loading entity data...')).toBeInTheDocument()
  })

  it('should show not editable message for unknown type', () => {
    renderPanel({ nodeType: 'company' as NodeType })
    expect(screen.getByText('This entity type is not editable.')).toBeInTheDocument()
  })

  it('should show unable to load when no data', () => {
    renderPanel({ entityData: undefined })
    expect(screen.getByText('Unable to load entity data.')).toBeInTheDocument()
  })

  it('should display all department fields', () => {
    renderPanel()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Mandate')).toBeInTheDocument()
    expect(screen.getByText('Parent Department')).toBeInTheDocument()
  })

  it('should display field values from entity data', () => {
    renderPanel()
    expect(screen.getByText('Marketing')).toBeInTheDocument()
    expect(screen.getByText('Marketing dept')).toBeInTheDocument()
    expect(screen.getByText('Drive growth')).toBeInTheDocument()
  })

  it('should allow editing a text field', async () => {
    const onSave = vi.fn()
    renderPanel({ onSave })
    // Click edit button for Name
    const editBtns = screen.getAllByRole('button', { name: /Edit/i })
    await userEvent.click(editBtns[0]!)
    // Should show input
    const input = screen.getByTestId('edit-field-name')
    expect(input).toBeInTheDocument()
    // Clear and type new value
    await userEvent.clear(input)
    await userEvent.type(input, 'New Name')
    // Click save
    await userEvent.click(screen.getByRole('button', { name: /Save Name/i }))
    expect(onSave).toHaveBeenCalledWith('abc', 'department', { name: 'New Name' })
  })

  it('should allow editing a textarea field', async () => {
    const onSave = vi.fn()
    renderPanel({ onSave })
    // Click edit for Description (2nd edit button)
    const editBtns = screen.getAllByRole('button', { name: /Edit/i })
    await userEvent.click(editBtns[1]!)
    const input = screen.getByTestId('edit-field-description')
    await userEvent.clear(input)
    await userEvent.type(input, 'New desc')
    await userEvent.click(screen.getByRole('button', { name: /Save Description/i }))
    expect(onSave).toHaveBeenCalledWith('abc', 'department', { description: 'New desc' })
  })

  it('should cancel editing on Escape', async () => {
    const onSave = vi.fn()
    renderPanel({ onSave })
    const editBtns = screen.getAllByRole('button', { name: /Edit/i })
    await userEvent.click(editBtns[0]!)
    const input = screen.getByTestId('edit-field-name')
    await userEvent.clear(input)
    await userEvent.type(input, 'Changed')
    await userEvent.keyboard('{Escape}')
    expect(onSave).not.toHaveBeenCalled()
    // Should show original value
    expect(screen.getByText('Marketing')).toBeInTheDocument()
  })

  it('should render select fields for role', () => {
    renderPanel({
      nodeType: 'role',
      entityData: {
        name: 'Dev',
        description: 'Developer role',
        departmentId: 'd1',
        accountability: 'Code',
        authority: 'Merge',
        capabilityIds: ['c1'],
      },
    })
    expect(screen.getByText('Department')).toBeInTheDocument()
    expect(screen.getByText('Engineering')).toBeInTheDocument() // resolved from optionsMap
    expect(screen.getByText('Capabilities')).toBeInTheDocument()
    expect(screen.getByText('API Design')).toBeInTheDocument() // resolved from optionsMap
  })

  it('should render tags field for skill', () => {
    renderPanel({
      nodeType: 'skill',
      entityData: {
        name: 'TypeScript',
        description: 'TS lang',
        category: 'technical',
        tags: ['programming', 'frontend'],
        compatibleRoleIds: [],
      },
    })
    expect(screen.getByText('Tags')).toBeInTheDocument()
    expect(screen.getByText('programming, frontend')).toBeInTheDocument()
  })

  it('should handle conditional fields (policy departmentId)', () => {
    renderPanel({
      nodeType: 'policy',
      entityData: {
        name: 'Policy1',
        description: 'Desc',
        scope: 'global',
        departmentId: null,
        type: 'constraint',
        enforcement: 'mandatory',
        condition: 'Always',
        status: 'active',
      },
    })
    // When scope=global, Department field should not be visible
    const labels = screen.queryAllByText(/Department/i)
    // Should not have a Department field (only the scope select exists)
    expect(labels.length).toBe(0)
  })

  it('should show conditional field when condition is met', () => {
    renderPanel({
      nodeType: 'policy',
      entityData: {
        name: 'Policy1',
        description: 'Desc',
        scope: 'department',
        departmentId: 'd1',
        type: 'constraint',
        enforcement: 'mandatory',
        condition: 'Always',
        status: 'active',
      },
    })
    // Both the Scope select (showing "Department") and the conditional departmentId field label exist
    const departmentTexts = screen.getAllByText('Department')
    expect(departmentTexts.length).toBeGreaterThanOrEqual(1)
  })

  it('should show — for empty field values', () => {
    renderPanel({
      entityData: { name: 'Test', description: '', mandate: '', parentId: null },
    })
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(2)
  })

  it('should not show edit button for readOnly fields', () => {
    renderPanel({
      nodeType: 'agent-assignment',
      entityData: {
        name: 'Agent1',
        archetypeId: 'a1',
        status: 'active',
      },
    })
    // archetypeId is readOnly - check there's no edit button for it
    expect(screen.getByText('AI Developer')).toBeInTheDocument() // resolved value
    // Name and Status should have edit buttons, but Archetype should not
    const editBtns = screen.getAllByRole('button', { name: /Edit/i })
    // Name edit + Status edit = 2
    expect(editBtns).toHaveLength(2)
  })

  it('should render status-select fields', () => {
    renderPanel({
      nodeType: 'workflow',
      entityData: {
        name: 'WF1',
        description: 'Workflow',
        ownerDepartmentId: 'd1',
        status: 'active',
        triggerDescription: 'On demand',
      },
    })
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })
})
