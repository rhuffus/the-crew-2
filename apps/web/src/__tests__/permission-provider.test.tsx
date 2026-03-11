import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { buildManifest } from '@the-crew/shared-types'
import { PermissionProvider, PermissionGate } from '@/providers/permission-provider'
import { PermissionContext, usePermission, useAnyPermission, usePermissions } from '@/hooks/use-permissions'

vi.mock('@/api/permissions', () => ({
  permissionsApi: {
    getManifest: vi.fn(),
  },
}))

function createWrapper(projectId: string | null = 'p1') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <PermissionProvider projectId={projectId}>
        {children}
      </PermissionProvider>
    </QueryClientProvider>
  )
}

describe('PermissionProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provides default editor permissions before API response', () => {
    function TestComponent() {
      const { manifest, role } = usePermissions()
      return (
        <div>
          <span data-testid="role">{role}</span>
          <span data-testid="count">{manifest.permissions.length}</span>
        </div>
      )
    }

    render(<TestComponent />, { wrapper: createWrapper() })

    // Default manifest is editor
    expect(screen.getByTestId('role').textContent).toBe('project:editor')
    expect(Number(screen.getByTestId('count').textContent)).toBeGreaterThan(0)
  })

  it('usePermission returns true for editor permissions', () => {
    function TestComponent() {
      const canCreate = usePermission('canvas:node:create')
      const canEdit = usePermission('canvas:node:edit')
      return (
        <div>
          <span data-testid="create">{canCreate ? 'yes' : 'no'}</span>
          <span data-testid="edit">{canEdit ? 'yes' : 'no'}</span>
        </div>
      )
    }

    render(<TestComponent />, { wrapper: createWrapper() })

    expect(screen.getByTestId('create').textContent).toBe('yes')
    expect(screen.getByTestId('edit').textContent).toBe('yes')
  })

  it('useAnyPermission returns true if any matches', () => {
    function TestComponent() {
      const canAny = useAnyPermission(['canvas:node:create', 'nope'])
      return <span data-testid="result">{canAny ? 'yes' : 'no'}</span>
    }

    render(<TestComponent />, { wrapper: createWrapper() })
    expect(screen.getByTestId('result').textContent).toBe('yes')
  })
})

describe('PermissionGate', () => {
  it('renders children when permission is granted', () => {
    render(
      <PermissionGate permission="canvas:node:create">
        <span data-testid="child">visible</span>
      </PermissionGate>,
      { wrapper: createWrapper() },
    )

    expect(screen.getByTestId('child')).toBeDefined()
  })

  it('renders fallback when permission is denied', () => {
    // Use raw context with viewer manifest to deny edit
    const viewerManifest = buildManifest('project:viewer')
    const queryClient = new QueryClient()

    function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          <PermissionContext.Provider value={{
            manifest: viewerManifest,
            loading: false,
            can: (p) => viewerManifest.permissions.includes(p),
            canAny: (ps) => ps.some(p => viewerManifest.permissions.includes(p)),
            role: 'project:viewer',
          }}>
            {children}
          </PermissionContext.Provider>
        </QueryClientProvider>
      )
    }

    render(
      <Wrapper>
        <PermissionGate permission="canvas:node:create" fallback={<span data-testid="fallback">denied</span>}>
          <span data-testid="child">visible</span>
        </PermissionGate>
      </Wrapper>,
    )

    expect(screen.queryByTestId('child')).toBeNull()
    expect(screen.getByTestId('fallback').textContent).toBe('denied')
  })
})

describe('PermissionContext with different roles', () => {
  function TestWithRole({ role }: { role: string }) {
    const manifest = buildManifest(role as Parameters<typeof buildManifest>[0])
    const queryClient = new QueryClient()

    function Inner() {
      const canCreate = usePermission('canvas:node:create')
      const canWrite = usePermission('chat:write:company')
      const canPublish = usePermission('release:publish')
      return (
        <div>
          <span data-testid="create">{canCreate ? 'yes' : 'no'}</span>
          <span data-testid="write">{canWrite ? 'yes' : 'no'}</span>
          <span data-testid="publish">{canPublish ? 'yes' : 'no'}</span>
        </div>
      )
    }

    return (
      <QueryClientProvider client={queryClient}>
        <PermissionContext.Provider value={{
          manifest,
          loading: false,
          can: (p) => manifest.permissions.includes(p),
          canAny: (ps) => ps.some(p => manifest.permissions.includes(p)),
          role: manifest.projectRole,
        }}>
          <Inner />
        </PermissionContext.Provider>
      </QueryClientProvider>
    )
  }

  it('viewer cannot create nodes or write chat', () => {
    render(<TestWithRole role="project:viewer" />)
    expect(screen.getByTestId('create').textContent).toBe('no')
    expect(screen.getByTestId('write').textContent).toBe('no')
    expect(screen.getByTestId('publish').textContent).toBe('no')
  })

  it('commenter can write chat but not create nodes', () => {
    render(<TestWithRole role="project:commenter" />)
    expect(screen.getByTestId('create').textContent).toBe('no')
    expect(screen.getByTestId('write').textContent).toBe('yes')
    expect(screen.getByTestId('publish').textContent).toBe('no')
  })

  it('editor can create nodes and write chat', () => {
    render(<TestWithRole role="project:editor" />)
    expect(screen.getByTestId('create').textContent).toBe('yes')
    expect(screen.getByTestId('write').textContent).toBe('yes')
    expect(screen.getByTestId('publish').textContent).toBe('no')
  })

  it('admin can do everything', () => {
    render(<TestWithRole role="project:admin" />)
    expect(screen.getByTestId('create').textContent).toBe('yes')
    expect(screen.getByTestId('write').textContent).toBe('yes')
    expect(screen.getByTestId('publish').textContent).toBe('yes')
  })
})
