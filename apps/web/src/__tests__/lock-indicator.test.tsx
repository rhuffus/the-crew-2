import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LockIndicator } from '@/components/visual-shell/inspector/lock-indicator'

const mockUseLockByEntity = vi.fn()
const mockUseAcquireLock = vi.fn()
const mockUseReleaseLock = vi.fn()
const mockUsePermission = vi.fn()

vi.mock('@/hooks/use-collaboration', () => ({
  useLockByEntity: (...args: unknown[]) => mockUseLockByEntity(...args),
  useAcquireLock: (...args: unknown[]) => mockUseAcquireLock(...args),
  useReleaseLock: (...args: unknown[]) => mockUseReleaseLock(...args),
}))

vi.mock('@/hooks/use-permissions', () => ({
  usePermission: (p: string) => mockUsePermission(p),
}))

const defaultProps = {
  projectId: 'proj-1',
  entityId: 'ent-1',
  nodeType: 'department' as const,
}

describe('LockIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseLockByEntity.mockReturnValue({ data: null })
    mockUseAcquireLock.mockReturnValue({ mutate: vi.fn(), isPending: false })
    mockUseReleaseLock.mockReturnValue({ mutate: vi.fn(), isPending: false })
    mockUsePermission.mockReturnValue(true)
  })

  it('shows "Lock for editing" button when no lock and canAcquire', () => {
    render(<LockIndicator {...defaultProps} />)

    const btn = screen.getByTestId('acquire-lock-btn')
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveTextContent('Lock for editing')
  })

  it('does not render when no lock and no acquire permission', () => {
    mockUsePermission.mockImplementation((p: string) => {
      if (p === 'lock:acquire') return false
      return false
    })

    const { container } = render(<LockIndicator {...defaultProps} />)
    expect(container.innerHTML).toBe('')
  })

  it('shows locked status with locker name', () => {
    mockUseLockByEntity.mockReturnValue({
      data: { entityId: 'ent-1', lockedBy: 'user-2', lockedByName: 'Alice' },
    })

    render(<LockIndicator {...defaultProps} />)

    const indicator = screen.getByTestId('lock-indicator')
    expect(indicator).toHaveTextContent('Locked by Alice')
  })

  it('shows release button for own lock with release:own permission', () => {
    mockUseLockByEntity.mockReturnValue({
      data: { entityId: 'ent-1', lockedBy: 'current-user', lockedByName: 'You' },
    })
    mockUsePermission.mockImplementation((p: string) => {
      if (p === 'lock:acquire') return true
      if (p === 'lock:release:own') return true
      if (p === 'lock:release:any') return false
      return false
    })

    render(<LockIndicator {...defaultProps} />)

    expect(screen.getByTestId('release-lock-btn')).toBeInTheDocument()
  })

  it('shows release button for any lock with release:any permission', () => {
    mockUseLockByEntity.mockReturnValue({
      data: { entityId: 'ent-1', lockedBy: 'user-other', lockedByName: 'Bob' },
    })
    mockUsePermission.mockImplementation((p: string) => {
      if (p === 'lock:acquire') return true
      if (p === 'lock:release:own') return false
      if (p === 'lock:release:any') return true
      return false
    })

    render(<LockIndicator {...defaultProps} />)

    expect(screen.getByTestId('release-lock-btn')).toBeInTheDocument()
  })

  it('does not show release button when lacking permissions', () => {
    mockUseLockByEntity.mockReturnValue({
      data: { entityId: 'ent-1', lockedBy: 'user-other', lockedByName: 'Bob' },
    })
    mockUsePermission.mockImplementation((p: string) => {
      if (p === 'lock:acquire') return true
      if (p === 'lock:release:own') return false
      if (p === 'lock:release:any') return false
      return false
    })

    render(<LockIndicator {...defaultProps} />)

    expect(screen.getByTestId('lock-indicator')).toBeInTheDocument()
    expect(screen.queryByTestId('release-lock-btn')).not.toBeInTheDocument()
  })

  it('calls acquireLock.mutate on acquire click', () => {
    const mutateFn = vi.fn()
    mockUseAcquireLock.mockReturnValue({ mutate: mutateFn, isPending: false })

    render(<LockIndicator {...defaultProps} />)

    fireEvent.click(screen.getByTestId('acquire-lock-btn'))
    expect(mutateFn).toHaveBeenCalledWith({
      entityId: 'ent-1',
      nodeType: 'department',
      lockedBy: 'current-user',
      lockedByName: 'You',
    })
  })

  it('calls releaseLock.mutate on release click', () => {
    const mutateFn = vi.fn()
    mockUseLockByEntity.mockReturnValue({
      data: { entityId: 'ent-1', lockedBy: 'current-user', lockedByName: 'You' },
    })
    mockUseReleaseLock.mockReturnValue({ mutate: mutateFn, isPending: false })
    mockUsePermission.mockImplementation((p: string) => {
      if (p === 'lock:release:own') return true
      return true
    })

    render(<LockIndicator {...defaultProps} />)

    fireEvent.click(screen.getByTestId('release-lock-btn'))
    expect(mutateFn).toHaveBeenCalledWith({ entityId: 'ent-1' })
  })
})
