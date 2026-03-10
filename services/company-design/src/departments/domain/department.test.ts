import { describe, it, expect } from 'vitest'
import { Department } from './department'

describe('Department', () => {
  const baseProps = {
    id: 'd1',
    projectId: 'p1',
    name: 'Engineering',
    description: 'Builds the product',
    mandate: 'Ship quality software',
  }

  it('should create a department', () => {
    const dept = Department.create(baseProps)
    expect(dept.id).toBe('d1')
    expect(dept.projectId).toBe('p1')
    expect(dept.name).toBe('Engineering')
    expect(dept.mandate).toBe('Ship quality software')
    expect(dept.parentId).toBeNull()
  })

  it('should emit DepartmentCreated event', () => {
    const dept = Department.create(baseProps)
    expect(dept.domainEvents).toHaveLength(1)
    expect(dept.domainEvents[0]!.eventType).toBe('DepartmentCreated')
  })

  it('should reject empty name', () => {
    expect(() => Department.create({ ...baseProps, name: '  ' })).toThrow(
      'Department name cannot be empty',
    )
  })

  it('should trim name on create', () => {
    const dept = Department.create({ ...baseProps, name: '  Engineering  ' })
    expect(dept.name).toBe('Engineering')
  })

  it('should create with parentId', () => {
    const dept = Department.create({ ...baseProps, parentId: 'parent-1' })
    expect(dept.parentId).toBe('parent-1')
  })

  it('should update name and mandate', () => {
    const dept = Department.create(baseProps)
    dept.update({ name: 'Product', mandate: 'Drive product vision' })
    expect(dept.name).toBe('Product')
    expect(dept.mandate).toBe('Drive product vision')
  })

  it('should reject empty name on update', () => {
    const dept = Department.create(baseProps)
    expect(() => dept.update({ name: '' })).toThrow('Department name cannot be empty')
  })

  it('should prevent self-referencing parent', () => {
    const dept = Department.create(baseProps)
    expect(() => dept.update({ parentId: 'd1' })).toThrow('Department cannot be its own parent')
  })

  it('should update parentId', () => {
    const dept = Department.create(baseProps)
    dept.update({ parentId: 'parent-2' })
    expect(dept.parentId).toBe('parent-2')
  })

  it('should set parentId to null', () => {
    const dept = Department.create({ ...baseProps, parentId: 'parent-1' })
    dept.update({ parentId: null })
    expect(dept.parentId).toBeNull()
  })

  it('should reconstitute from props', () => {
    const now = new Date()
    const dept = Department.reconstitute('d1', {
      projectId: 'p1',
      name: 'Sales',
      description: '',
      mandate: 'Drive revenue',
      parentId: null,
      createdAt: now,
      updatedAt: now,
    })
    expect(dept.name).toBe('Sales')
    expect(dept.domainEvents).toHaveLength(0)
  })

  it('should preserve unchanged fields on partial update', () => {
    const dept = Department.create(baseProps)
    dept.update({ mandate: 'New mandate' })
    expect(dept.name).toBe('Engineering')
    expect(dept.description).toBe('Builds the product')
    expect(dept.mandate).toBe('New mandate')
  })
})
