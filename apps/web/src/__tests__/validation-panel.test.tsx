import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ValidationPanel } from '@/components/validations/validation-panel'
import type { ValidationResultDto } from '@the-crew/shared-types'

const cleanResult: ValidationResultDto = {
  projectId: 'p1',
  issues: [],
  summary: { errors: 0, warnings: 0 },
}

const mixedResult: ValidationResultDto = {
  projectId: 'p1',
  issues: [
    { entity: 'CompanyModel', entityId: null, field: 'purpose', message: 'Company model has no purpose defined', severity: 'error' },
    { entity: 'Department', entityId: 'd1', field: 'mandate', message: 'Department "Eng" has no mandate', severity: 'warning' },
    { entity: 'Capability', entityId: 'c1', field: 'ownerDepartmentId', message: 'Capability "API" has no owner department', severity: 'warning' },
  ],
  summary: { errors: 1, warnings: 2 },
}

describe('ValidationPanel', () => {
  it('should show success state when no issues', () => {
    render(<ValidationPanel result={cleanResult} />)
    expect(screen.getByText('All validations passed')).toBeDefined()
  })

  it('should show error count badge', () => {
    render(<ValidationPanel result={mixedResult} />)
    expect(screen.getByText('1 error')).toBeDefined()
  })

  it('should show warning count badge', () => {
    render(<ValidationPanel result={mixedResult} />)
    expect(screen.getByText('2 warnings')).toBeDefined()
  })

  it('should group issues by entity', () => {
    render(<ValidationPanel result={mixedResult} />)
    expect(screen.getByText('CompanyModel')).toBeDefined()
    expect(screen.getByText('Department')).toBeDefined()
    expect(screen.getByText('Capability')).toBeDefined()
  })

  it('should display issue messages', () => {
    render(<ValidationPanel result={mixedResult} />)
    expect(screen.getByText('Company model has no purpose defined')).toBeDefined()
    expect(screen.getByText('Department "Eng" has no mandate')).toBeDefined()
    expect(screen.getByText('Capability "API" has no owner department')).toBeDefined()
  })

  it('should display field info', () => {
    render(<ValidationPanel result={mixedResult} />)
    expect(screen.getByText('Field: purpose')).toBeDefined()
    expect(screen.getByText('Field: mandate')).toBeDefined()
  })

  it('should show severity badges on each issue', () => {
    render(<ValidationPanel result={mixedResult} />)
    const errorBadges = screen.getAllByText('error')
    const warningBadges = screen.getAllByText('warning')
    expect(errorBadges.length).toBeGreaterThanOrEqual(1)
    expect(warningBadges.length).toBeGreaterThanOrEqual(2)
  })

  it('should pluralize correctly for single error', () => {
    render(<ValidationPanel result={mixedResult} />)
    expect(screen.getByText('1 error')).toBeDefined()
  })

  it('should pluralize correctly for multiple warnings', () => {
    render(<ValidationPanel result={mixedResult} />)
    expect(screen.getByText('2 warnings')).toBeDefined()
  })

  it('should handle errors-only result', () => {
    const errorsOnly: ValidationResultDto = {
      projectId: 'p1',
      issues: [
        { entity: 'CompanyModel', entityId: null, field: 'purpose', message: 'No purpose', severity: 'error' },
      ],
      summary: { errors: 1, warnings: 0 },
    }
    render(<ValidationPanel result={errorsOnly} />)
    expect(screen.getByText('1 error')).toBeDefined()
    expect(screen.queryByText(/warning/)).toBeNull()
  })
})
