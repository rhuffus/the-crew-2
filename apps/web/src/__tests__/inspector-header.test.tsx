import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InspectorHeader } from '@/components/visual-shell/inspector/inspector-header'

describe('InspectorHeader', () => {
  it('should show no selection when no props', () => {
    render(<InspectorHeader />)
    expect(screen.getByTestId('inspector-header')).toBeInTheDocument()
    expect(screen.getByText('No selection')).toBeInTheDocument()
  })

  it('should show node type and label', () => {
    render(<InspectorHeader nodeType="department" label="Marketing" />)
    expect(screen.getByText('Department')).toBeInTheDocument()
    expect(screen.getByText('Marketing')).toBeInTheDocument()
  })

  it('should show company type', () => {
    render(<InspectorHeader nodeType="company" label="Acme Corp" />)
    expect(screen.getByText('Company')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('should show workflow type', () => {
    render(<InspectorHeader nodeType="workflow" label="Onboarding" />)
    expect(screen.getByText('Workflow')).toBeInTheDocument()
    expect(screen.getByText('Onboarding')).toBeInTheDocument()
  })

  it('should show agent archetype type', () => {
    render(<InspectorHeader nodeType="agent-archetype" label="Support Bot" />)
    expect(screen.getByText('Agent Archetype')).toBeInTheDocument()
    expect(screen.getByText('Support Bot')).toBeInTheDocument()
  })
})
