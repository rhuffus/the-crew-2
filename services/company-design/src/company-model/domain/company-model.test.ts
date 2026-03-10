import { describe, it, expect } from 'vitest'
import { CompanyModel } from './company-model'

describe('CompanyModel', () => {
  it('should create an empty model for a project', () => {
    const model = CompanyModel.createEmpty('proj-1')
    expect(model.projectId).toBe('proj-1')
    expect(model.purpose).toBe('')
    expect(model.type).toBe('')
    expect(model.scope).toBe('')
    expect(model.principles).toEqual([])
  })

  it('should emit CompanyModelCreated event', () => {
    const model = CompanyModel.createEmpty('proj-1')
    const events = model.domainEvents
    expect(events).toHaveLength(1)
    expect(events[0]!.eventType).toBe('CompanyModelCreated')
    expect(events[0]!.aggregateId).toBe('proj-1')
  })

  it('should update purpose, type, scope', () => {
    const model = CompanyModel.createEmpty('proj-1')
    model.clearEvents()
    model.update({ purpose: 'Build great things', type: 'SaaS', scope: 'Global' })
    expect(model.purpose).toBe('Build great things')
    expect(model.type).toBe('SaaS')
    expect(model.scope).toBe('Global')
  })

  it('should update principles and filter empty entries', () => {
    const model = CompanyModel.createEmpty('proj-1')
    model.update({ principles: ['Quality first', '', '  ', 'Customer focus'] })
    expect(model.principles).toEqual(['Quality first', 'Customer focus'])
  })

  it('should trim values on update', () => {
    const model = CompanyModel.createEmpty('proj-1')
    model.update({ purpose: '  Build things  ', type: '  SaaS  ' })
    expect(model.purpose).toBe('Build things')
    expect(model.type).toBe('SaaS')
  })

  it('should emit CompanyModelUpdated event on update', () => {
    const model = CompanyModel.createEmpty('proj-1')
    model.clearEvents()
    model.update({ purpose: 'Test' })
    const events = model.domainEvents
    expect(events).toHaveLength(1)
    expect(events[0]!.eventType).toBe('CompanyModelUpdated')
    expect(events[0]!.payload).toMatchObject({ purpose: 'Test' })
  })

  it('should only update provided fields', () => {
    const model = CompanyModel.createEmpty('proj-1')
    model.update({ purpose: 'First', type: 'B2B' })
    model.update({ scope: 'EMEA' })
    expect(model.purpose).toBe('First')
    expect(model.type).toBe('B2B')
    expect(model.scope).toBe('EMEA')
  })

  it('should reconstitute from props', () => {
    const model = CompanyModel.reconstitute('proj-1', {
      purpose: 'Build',
      type: 'SaaS',
      scope: 'Global',
      principles: ['Speed'],
      updatedAt: new Date('2026-01-01'),
    })
    expect(model.purpose).toBe('Build')
    expect(model.principles).toEqual(['Speed'])
    expect(model.domainEvents).toHaveLength(0)
  })

  it('should return defensive copy of principles', () => {
    const model = CompanyModel.createEmpty('proj-1')
    model.update({ principles: ['A', 'B'] })
    const p1 = model.principles
    const p2 = model.principles
    expect(p1).toEqual(p2)
    expect(p1).not.toBe(p2)
  })
})
