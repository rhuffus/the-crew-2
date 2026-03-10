import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChangesTab } from '@/components/visual-shell/inspector/changes-tab'

describe('ChangesTab', () => {
  it('should render added status with message', () => {
    render(<ChangesTab diffStatus="added" label="Sales" />)
    expect(screen.getByTestId('changes-tab')).toBeInTheDocument()
    expect(screen.getByText('New entity')).toBeInTheDocument()
    expect(screen.getByText(/All fields are additions/)).toBeInTheDocument()
    expect(screen.getByText('Sales')).toBeInTheDocument()
  })

  it('should render removed status with message', () => {
    render(<ChangesTab diffStatus="removed" label="HR" />)
    expect(screen.getByText('Deleted entity')).toBeInTheDocument()
    expect(screen.getByText(/All fields were removed/)).toBeInTheDocument()
    expect(screen.getByText('HR')).toBeInTheDocument()
  })

  it('should render unchanged status', () => {
    render(<ChangesTab diffStatus="unchanged" label="Engineering" />)
    expect(screen.getByText('Unchanged')).toBeInTheDocument()
    expect(screen.getByText('No changes detected.')).toBeInTheDocument()
  })

  it('should render modified status with field-level changes', () => {
    const changes = {
      sublabel: { before: 'Grow market share', after: 'Drive market growth' },
      parentId: { before: 'company:p1', after: 'dept:xyz' },
    }
    render(<ChangesTab diffStatus="modified" changes={changes} label="Marketing" />)
    expect(screen.getByText('Modified entity')).toBeInTheDocument()
    expect(screen.getByTestId('change-field-sublabel')).toBeInTheDocument()
    expect(screen.getByTestId('change-field-parentId')).toBeInTheDocument()
    expect(screen.getByText('Grow market share')).toBeInTheDocument()
    expect(screen.getByText('Drive market growth')).toBeInTheDocument()
    expect(screen.getByText('company:p1')).toBeInTheDocument()
    expect(screen.getByText('dept:xyz')).toBeInTheDocument()
  })

  it('should render modified with empty changes', () => {
    render(<ChangesTab diffStatus="modified" changes={{}} label="Ops" />)
    expect(screen.getByText('Modified entity')).toBeInTheDocument()
    expect(screen.getByText(/no visual field changes/)).toBeInTheDocument()
  })

  it('should render modified with no changes prop', () => {
    render(<ChangesTab diffStatus="modified" label="Ops" />)
    expect(screen.getByText(/no visual field changes/)).toBeInTheDocument()
  })

  it('should format null values as em dash', () => {
    const changes = {
      sublabel: { before: null, after: 'New mandate' },
    }
    render(<ChangesTab diffStatus="modified" changes={changes} label="Test" />)
    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.getByText('New mandate')).toBeInTheDocument()
  })

  it('should format array values', () => {
    const changes = {
      layerIds: { before: ['organization'], after: ['organization', 'capabilities'] },
    }
    render(<ChangesTab diffStatus="modified" changes={changes} label="Test" />)
    expect(screen.getByText('organization')).toBeInTheDocument()
    expect(screen.getByText('organization, capabilities')).toBeInTheDocument()
  })
})
