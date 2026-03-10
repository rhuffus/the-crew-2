import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PropertiesTab } from '@/components/visual-shell/inspector/properties-tab'
import { mockDeptNode, mockRoleNode, mockCompanyNode } from './fixtures/visual-graph'

describe('PropertiesTab', () => {
  it('should render properties tab', () => {
    render(<PropertiesTab node={mockDeptNode} />)
    expect(screen.getByTestId('properties-tab')).toBeInTheDocument()
  })

  it('should show visual ID', () => {
    render(<PropertiesTab node={mockDeptNode} />)
    expect(screen.getByText('Visual ID')).toBeInTheDocument()
    expect(screen.getByText('dept:abc')).toBeInTheDocument()
  })

  it('should show entity ID', () => {
    render(<PropertiesTab node={mockDeptNode} />)
    expect(screen.getByText('Entity ID')).toBeInTheDocument()
    expect(screen.getByText('abc')).toBeInTheDocument()
  })

  it('should show node type', () => {
    render(<PropertiesTab node={mockDeptNode} />)
    expect(screen.getByText('Node Type')).toBeInTheDocument()
    expect(screen.getByText('department')).toBeInTheDocument()
  })

  it('should show status', () => {
    render(<PropertiesTab node={mockDeptNode} />)
    expect(screen.getByText('normal')).toBeInTheDocument()
  })

  it('should show collapsed state', () => {
    render(<PropertiesTab node={mockDeptNode} />)
    expect(screen.getByText('Collapsed')).toBeInTheDocument()
    expect(screen.getByText('No')).toBeInTheDocument()
  })

  it('should show layers', () => {
    render(<PropertiesTab node={mockDeptNode} />)
    expect(screen.getByText('Layers')).toBeInTheDocument()
    expect(screen.getByText('organization')).toBeInTheDocument()
  })

  it('should show auto-layout when position is null', () => {
    render(<PropertiesTab node={mockDeptNode} />)
    expect(screen.getByText('Auto-layout')).toBeInTheDocument()
  })

  it('should show coordinates when position exists', () => {
    render(<PropertiesTab node={mockRoleNode} />)
    expect(screen.getByText('(100, 200)')).toBeInTheDocument()
  })

  it('should show parent ID when present', () => {
    render(<PropertiesTab node={mockDeptNode} />)
    expect(screen.getByText('Parent ID')).toBeInTheDocument()
    expect(screen.getByText('company:proj-1')).toBeInTheDocument()
  })

  it('should not show parent ID when null', () => {
    render(<PropertiesTab node={mockCompanyNode} />)
    expect(screen.queryByText('Parent ID')).not.toBeInTheDocument()
  })
})
