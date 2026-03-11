import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ValidationTab } from '@/components/visual-shell/inspector/validation-tab'
import type { ValidationIssue } from '@the-crew/shared-types'

describe('ValidationTab', () => {
  it('should show success message when no issues', () => {
    render(<ValidationTab validationIssues={[]} />)
    expect(screen.getByTestId('validation-tab')).toBeInTheDocument()
    expect(screen.getByText('No validation issues')).toBeInTheDocument()
  })

  it('should show error count', () => {
    const issues: ValidationIssue[] = [
      { entity: 'department', entityId: 'abc', severity: 'error', message: 'Missing mandate', field: null },
      { entity: 'department', entityId: 'abc', severity: 'error', message: 'No owner', field: null },
    ]
    render(<ValidationTab validationIssues={issues} />)
    expect(screen.getByText('2 errors')).toBeInTheDocument()
  })

  it('should show warning count', () => {
    const issues: ValidationIssue[] = [
      { entity: 'department', entityId: 'abc', severity: 'warning', message: 'Potential issue', field: null },
    ]
    render(<ValidationTab validationIssues={issues} />)
    expect(screen.getByText('1 warning')).toBeInTheDocument()
  })

  it('should show both error and warning counts', () => {
    const issues: ValidationIssue[] = [
      { entity: 'department', entityId: 'abc', severity: 'error', message: 'Error 1', field: null },
      { entity: 'department', entityId: 'abc', severity: 'warning', message: 'Warning 1', field: null },
      { entity: 'department', entityId: 'abc', severity: 'warning', message: 'Warning 2', field: null },
    ]
    render(<ValidationTab validationIssues={issues} />)
    expect(screen.getByText('1 error')).toBeInTheDocument()
    expect(screen.getByText('2 warnings')).toBeInTheDocument()
  })

  it('should display all issue messages', () => {
    const issues: ValidationIssue[] = [
      { entity: 'department', entityId: 'abc', severity: 'error', message: 'Missing mandate', field: null },
      { entity: 'department', entityId: 'abc', severity: 'warning', message: 'No owner department', field: null },
    ]
    render(<ValidationTab validationIssues={issues} />)
    expect(screen.getByText('Missing mandate')).toBeInTheDocument()
    expect(screen.getByText('No owner department')).toBeInTheDocument()
  })

  it('should have testid for each issue', () => {
    const issues: ValidationIssue[] = [
      { entity: 'department', entityId: 'abc', severity: 'error', message: 'Issue 1', field: null },
      { entity: 'department', entityId: 'abc', severity: 'warning', message: 'Issue 2', field: null },
    ]
    render(<ValidationTab validationIssues={issues} />)
    expect(screen.getByTestId('validation-issue-0')).toBeInTheDocument()
    expect(screen.getByTestId('validation-issue-1')).toBeInTheDocument()
  })
})
