import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OverviewTab } from '@/components/visual-shell/inspector/overview-tab'
import { mockDeptNode, mockCompanyNode, mockRoleNode, mockCapabilityNode } from './fixtures/visual-graph'
import type { VisualNodeDto } from '@the-crew/shared-types'

describe('OverviewTab', () => {
  it('should render overview tab with name and type', () => {
    render(<OverviewTab node={mockDeptNode} />)
    expect(screen.getByTestId('overview-tab')).toBeInTheDocument()
    expect(screen.getByText('Marketing')).toBeInTheDocument()
    expect(screen.getByText('Department')).toBeInTheDocument()
  })

  it('should show mandate sublabel for department', () => {
    render(<OverviewTab node={mockDeptNode} />)
    expect(screen.getByText('Mandate')).toBeInTheDocument()
    expect(screen.getByText('Drive growth')).toBeInTheDocument()
  })

  it('should show company type sublabel for company', () => {
    render(<OverviewTab node={mockCompanyNode} />)
    expect(screen.getByText('Company Type')).toBeInTheDocument()
    expect(screen.getByText('Technology')).toBeInTheDocument()
  })

  it('should show accountability sublabel for role', () => {
    render(<OverviewTab node={mockRoleNode} />)
    expect(screen.getByText('Accountability')).toBeInTheDocument()
    expect(screen.getByText('Marketing strategy')).toBeInTheDocument()
  })

  it('should show status when not normal', () => {
    render(<OverviewTab node={mockCapabilityNode} />)
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('warning')).toBeInTheDocument()
  })

  it('should not show status field when normal', () => {
    render(<OverviewTab node={mockDeptNode} />)
    expect(screen.queryByText('Status')).not.toBeInTheDocument()
  })

  it('should show parent when present', () => {
    render(<OverviewTab node={mockDeptNode} />)
    expect(screen.getByText('Parent')).toBeInTheDocument()
    expect(screen.getByText('company:proj-1')).toBeInTheDocument()
  })

  it('should not show parent when null', () => {
    render(<OverviewTab node={mockCompanyNode} />)
    expect(screen.queryByText('Parent')).not.toBeInTheDocument()
  })

  it('should handle node without sublabel', () => {
    const node: VisualNodeDto = {
      ...mockDeptNode,
      sublabel: null,
    }
    render(<OverviewTab node={node} />)
    expect(screen.getByText('Marketing')).toBeInTheDocument()
    expect(screen.queryByText('Mandate')).not.toBeInTheDocument()
  })

  it('should show Description sublabel for agent-archetype', () => {
    const node: VisualNodeDto = {
      ...mockDeptNode,
      nodeType: 'agent-archetype',
      sublabel: 'A bot archetype',
    }
    render(<OverviewTab node={node} />)
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('should show Assignment Status sublabel for agent-assignment', () => {
    const node: VisualNodeDto = {
      ...mockDeptNode,
      nodeType: 'agent-assignment',
      sublabel: 'active',
    }
    render(<OverviewTab node={node} />)
    expect(screen.getByText('Assignment Status')).toBeInTheDocument()
  })

  it('should show Workflow Status sublabel for workflow', () => {
    const node: VisualNodeDto = {
      ...mockDeptNode,
      nodeType: 'workflow',
      sublabel: 'active',
    }
    render(<OverviewTab node={node} />)
    expect(screen.getByText('Workflow Status')).toBeInTheDocument()
  })

  it('should show Description sublabel for workflow-stage', () => {
    const node: VisualNodeDto = {
      ...mockDeptNode,
      nodeType: 'workflow-stage',
      sublabel: 'Initial review',
    }
    render(<OverviewTab node={node} />)
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('should show Contract Info sublabel for contract', () => {
    const node: VisualNodeDto = {
      ...mockDeptNode,
      nodeType: 'contract',
      sublabel: 'SLA · active',
    }
    render(<OverviewTab node={node} />)
    expect(screen.getByText('Contract Info')).toBeInTheDocument()
  })

  it('should show Policy Info sublabel for policy', () => {
    const node: VisualNodeDto = {
      ...mockDeptNode,
      nodeType: 'policy',
      sublabel: 'constraint · mandatory',
    }
    render(<OverviewTab node={node} />)
    expect(screen.getByText('Policy Info')).toBeInTheDocument()
  })

  it('should show Category sublabel for skill', () => {
    const node: VisualNodeDto = {
      ...mockDeptNode,
      nodeType: 'skill',
      sublabel: 'Technical',
    }
    render(<OverviewTab node={node} />)
    expect(screen.getByText('Category')).toBeInTheDocument()
  })
})
