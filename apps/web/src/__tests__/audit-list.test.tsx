import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuditList } from '@/components/audit/audit-list'
import { AuditEntryRow } from '@/components/audit/audit-entry-row'
import type { AuditEntryDto } from '@the-crew/shared-types'

const mockEntries: AuditEntryDto[] = [
  {
    id: 'a1',
    projectId: 'p1',
    entityType: 'department',
    entityId: 'd1',
    entityName: 'Engineering',
    action: 'created',
    changes: null,
    timestamp: '2026-01-15T10:30:00Z',
  },
  {
    id: 'a2',
    projectId: 'p1',
    entityType: 'capability',
    entityId: 'c1',
    entityName: 'API Design',
    action: 'updated',
    changes: { name: 'API Design v2' },
    timestamp: '2026-01-16T14:00:00Z',
  },
  {
    id: 'a3',
    projectId: 'p1',
    entityType: 'release',
    entityId: 'r1',
    entityName: 'v1.0',
    action: 'published',
    changes: null,
    timestamp: '2026-01-17T09:00:00Z',
  },
  {
    id: 'a4',
    projectId: 'p1',
    entityType: 'contract',
    entityId: 'ct1',
    entityName: 'Old Contract',
    action: 'deleted',
    changes: null,
    timestamp: '2026-01-18T11:00:00Z',
  },
]

describe('AuditList', () => {
  it('should show empty state when no entries', () => {
    render(<AuditList entries={[]} />)
    expect(screen.getByText('No audit entries found.')).toBeInTheDocument()
  })

  it('should render all entries', () => {
    render(<AuditList entries={mockEntries} />)
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('API Design')).toBeInTheDocument()
    expect(screen.getByText('v1.0')).toBeInTheDocument()
    expect(screen.getByText('Old Contract')).toBeInTheDocument()
  })

  it('should display action badges', () => {
    render(<AuditList entries={mockEntries} />)
    expect(screen.getByText('created')).toBeInTheDocument()
    expect(screen.getByText('updated')).toBeInTheDocument()
    expect(screen.getByText('published')).toBeInTheDocument()
    expect(screen.getByText('deleted')).toBeInTheDocument()
  })

  it('should display entity type badges', () => {
    render(<AuditList entries={mockEntries} />)
    expect(screen.getByText('department')).toBeInTheDocument()
    expect(screen.getByText('capability')).toBeInTheDocument()
    expect(screen.getByText('release')).toBeInTheDocument()
    expect(screen.getByText('contract')).toBeInTheDocument()
  })
})

describe('AuditEntryRow', () => {
  it('should render entity name and action', () => {
    render(<AuditEntryRow entry={mockEntries[0]!} />)
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('created')).toBeInTheDocument()
  })

  it('should render timestamp', () => {
    render(<AuditEntryRow entry={mockEntries[0]!} />)
    const date = new Date('2026-01-15T10:30:00Z')
    expect(screen.getByText(date.toLocaleString())).toBeInTheDocument()
  })

  it('should show changes details for entries with changes', () => {
    render(<AuditEntryRow entry={mockEntries[1]!} />)
    expect(screen.getByText('Changes')).toBeInTheDocument()
  })

  it('should not show changes details when changes is null', () => {
    render(<AuditEntryRow entry={mockEntries[0]!} />)
    expect(screen.queryByText('Changes')).not.toBeInTheDocument()
  })

  it('should not show changes details when changes is empty object', () => {
    const entry: AuditEntryDto = { ...mockEntries[0]!, changes: {} }
    render(<AuditEntryRow entry={entry} />)
    expect(screen.queryByText('Changes')).not.toBeInTheDocument()
  })

  it('should render entity type badge', () => {
    render(<AuditEntryRow entry={mockEntries[0]!} />)
    expect(screen.getByText('department')).toBeInTheDocument()
  })
})
