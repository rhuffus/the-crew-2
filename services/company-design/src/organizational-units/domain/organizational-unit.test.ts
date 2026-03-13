import { describe, it, expect } from 'vitest'
import { OrganizationalUnit } from './organizational-unit'

describe('OrganizationalUnit', () => {
  const baseProps = {
    id: 'uo-1',
    projectId: 'p1',
    name: 'Engineering',
    description: 'Builds the product',
    uoType: 'department' as const,
    mandate: 'Ship quality software',
  }

  it('should create a department-type unit', () => {
    const unit = OrganizationalUnit.create(baseProps)
    expect(unit.id).toBe('uo-1')
    expect(unit.projectId).toBe('p1')
    expect(unit.name).toBe('Engineering')
    expect(unit.description).toBe('Builds the product')
    expect(unit.uoType).toBe('department')
    expect(unit.mandate).toBe('Ship quality software')
    expect(unit.purpose).toBe('')
    expect(unit.parentUoId).toBeNull()
    expect(unit.coordinatorAgentId).toBeNull()
    expect(unit.functions).toEqual([])
    expect(unit.status).toBe('active')
  })

  it('should emit OrganizationalUnitCreated event', () => {
    const unit = OrganizationalUnit.create(baseProps)
    expect(unit.domainEvents).toHaveLength(1)
    expect(unit.domainEvents[0]!.eventType).toBe('OrganizationalUnitCreated')
    expect(unit.domainEvents[0]!.aggregateId).toBe('uo-1')
    expect(unit.domainEvents[0]!.payload).toEqual({
      projectId: 'p1',
      name: 'Engineering',
      uoType: 'department',
    })
  })

  it('should reject empty name', () => {
    expect(() => OrganizationalUnit.create({ ...baseProps, name: '  ' })).toThrow(
      'OrganizationalUnit name cannot be empty',
    )
  })

  it('should reject empty mandate', () => {
    expect(() => OrganizationalUnit.create({ ...baseProps, mandate: '  ' })).toThrow(
      'OrganizationalUnit mandate cannot be empty',
    )
  })

  it('should trim name on create', () => {
    const unit = OrganizationalUnit.create({ ...baseProps, name: '  Engineering  ' })
    expect(unit.name).toBe('Engineering')
  })

  it('should trim mandate on create', () => {
    const unit = OrganizationalUnit.create({ ...baseProps, mandate: '  Ship software  ' })
    expect(unit.mandate).toBe('Ship software')
  })

  it('should create with optional props', () => {
    const unit = OrganizationalUnit.create({
      ...baseProps,
      purpose: 'Build great products',
      parentUoId: 'uo-parent',
      coordinatorAgentId: 'agent-1',
      functions: ['development', 'testing'],
      status: 'proposed',
    })
    expect(unit.purpose).toBe('Build great products')
    expect(unit.parentUoId).toBe('uo-parent')
    expect(unit.coordinatorAgentId).toBe('agent-1')
    expect(unit.functions).toEqual(['development', 'testing'])
    expect(unit.status).toBe('proposed')
  })

  it('should create a company-type unit without parent', () => {
    const unit = OrganizationalUnit.create({
      ...baseProps,
      uoType: 'company',
    })
    expect(unit.uoType).toBe('company')
    expect(unit.parentUoId).toBeNull()
  })

  it('should reject company-type unit with parentUoId', () => {
    expect(() =>
      OrganizationalUnit.create({
        ...baseProps,
        uoType: 'company',
        parentUoId: 'uo-parent',
      }),
    ).toThrow('Company-type unit cannot have a parent')
  })

  it('should create a team-type unit', () => {
    const unit = OrganizationalUnit.create({
      ...baseProps,
      uoType: 'team',
      parentUoId: 'uo-dept',
    })
    expect(unit.uoType).toBe('team')
    expect(unit.parentUoId).toBe('uo-dept')
  })

  it('should return a copy of functions array', () => {
    const unit = OrganizationalUnit.create({
      ...baseProps,
      functions: ['dev'],
    })
    const fns = unit.functions
    fns.push('ops')
    expect(unit.functions).toEqual(['dev'])
  })

  it('should update name and mandate', () => {
    const unit = OrganizationalUnit.create(baseProps)
    unit.update({ name: 'Product', mandate: 'Drive product vision' })
    expect(unit.name).toBe('Product')
    expect(unit.mandate).toBe('Drive product vision')
  })

  it('should reject empty name on update', () => {
    const unit = OrganizationalUnit.create(baseProps)
    expect(() => unit.update({ name: '' })).toThrow('OrganizationalUnit name cannot be empty')
  })

  it('should reject empty mandate on update', () => {
    const unit = OrganizationalUnit.create(baseProps)
    expect(() => unit.update({ mandate: '  ' })).toThrow(
      'OrganizationalUnit mandate cannot be empty',
    )
  })

  it('should prevent self-referencing parent', () => {
    const unit = OrganizationalUnit.create(baseProps)
    expect(() => unit.update({ parentUoId: 'uo-1' })).toThrow(
      'OrganizationalUnit cannot be its own parent',
    )
  })

  it('should prevent company-type from getting a parent via update', () => {
    const unit = OrganizationalUnit.create({ ...baseProps, uoType: 'company' })
    expect(() => unit.update({ parentUoId: 'uo-parent' })).toThrow(
      'Company-type unit cannot have a parent',
    )
  })

  it('should update parentUoId', () => {
    const unit = OrganizationalUnit.create(baseProps)
    unit.update({ parentUoId: 'uo-parent-2' })
    expect(unit.parentUoId).toBe('uo-parent-2')
  })

  it('should set parentUoId to null', () => {
    const unit = OrganizationalUnit.create({ ...baseProps, parentUoId: 'uo-parent' })
    unit.update({ parentUoId: null })
    expect(unit.parentUoId).toBeNull()
  })

  it('should update description', () => {
    const unit = OrganizationalUnit.create(baseProps)
    unit.update({ description: 'Updated description' })
    expect(unit.description).toBe('Updated description')
  })

  it('should update purpose', () => {
    const unit = OrganizationalUnit.create(baseProps)
    unit.update({ purpose: 'New purpose' })
    expect(unit.purpose).toBe('New purpose')
  })

  it('should update coordinatorAgentId', () => {
    const unit = OrganizationalUnit.create(baseProps)
    unit.update({ coordinatorAgentId: 'agent-2' })
    expect(unit.coordinatorAgentId).toBe('agent-2')
  })

  it('should update functions', () => {
    const unit = OrganizationalUnit.create(baseProps)
    unit.update({ functions: ['development', 'qa'] })
    expect(unit.functions).toEqual(['development', 'qa'])
  })

  it('should update status', () => {
    const unit = OrganizationalUnit.create(baseProps)
    unit.update({ status: 'retired' })
    expect(unit.status).toBe('retired')
  })

  it('should emit OrganizationalUnitUpdated event on update', () => {
    const unit = OrganizationalUnit.create(baseProps)
    unit.clearEvents()
    unit.update({ name: 'Product' })
    expect(unit.domainEvents).toHaveLength(1)
    expect(unit.domainEvents[0]!.eventType).toBe('OrganizationalUnitUpdated')
    expect(unit.domainEvents[0]!.aggregateId).toBe('uo-1')
  })

  it('should preserve unchanged fields on partial update', () => {
    const unit = OrganizationalUnit.create({
      ...baseProps,
      purpose: 'Build great products',
      functions: ['dev'],
    })
    unit.update({ mandate: 'New mandate' })
    expect(unit.name).toBe('Engineering')
    expect(unit.description).toBe('Builds the product')
    expect(unit.purpose).toBe('Build great products')
    expect(unit.functions).toEqual(['dev'])
    expect(unit.mandate).toBe('New mandate')
  })

  it('should reconstitute from props', () => {
    const now = new Date()
    const unit = OrganizationalUnit.reconstitute('uo-1', {
      projectId: 'p1',
      name: 'Sales',
      description: 'Drives revenue',
      uoType: 'department',
      mandate: 'Close deals',
      purpose: 'Revenue growth',
      parentUoId: null,
      coordinatorAgentId: 'agent-1',
      functions: ['sales', 'partnerships'],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    })
    expect(unit.name).toBe('Sales')
    expect(unit.uoType).toBe('department')
    expect(unit.coordinatorAgentId).toBe('agent-1')
    expect(unit.functions).toEqual(['sales', 'partnerships'])
    expect(unit.domainEvents).toHaveLength(0)
  })

  it('should update updatedAt on update', () => {
    const unit = OrganizationalUnit.create(baseProps)
    const originalUpdatedAt = unit.updatedAt
    // Small delay to ensure different timestamp
    unit.update({ name: 'Changed' })
    expect(unit.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime())
  })
})
