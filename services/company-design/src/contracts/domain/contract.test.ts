import { describe, it, expect } from 'vitest'
import { Contract } from './contract'
import type { ContractType, ContractStatus, PartyType } from './contract'

describe('Contract', () => {
  const baseProps = {
    id: 'ct1',
    projectId: 'p1',
    name: 'Data Delivery SLA',
    description: 'SLA for data delivery between departments',
    type: 'SLA' as const,
    providerId: 'd1',
    providerType: 'department' as const,
    consumerId: 'd2',
    consumerType: 'department' as const,
  }

  it('should create a contract with default status draft', () => {
    const contract = Contract.create(baseProps)
    expect(contract.id).toBe('ct1')
    expect(contract.projectId).toBe('p1')
    expect(contract.name).toBe('Data Delivery SLA')
    expect(contract.type).toBe('SLA')
    expect(contract.status).toBe('draft')
    expect(contract.providerId).toBe('d1')
    expect(contract.providerType).toBe('department')
    expect(contract.consumerId).toBe('d2')
    expect(contract.consumerType).toBe('department')
    expect(contract.acceptanceCriteria).toEqual([])
  })

  it('should emit ContractCreated event', () => {
    const contract = Contract.create(baseProps)
    expect(contract.domainEvents).toHaveLength(1)
    expect(contract.domainEvents[0]!.eventType).toBe('ContractCreated')
  })

  it('should reject empty name', () => {
    expect(() => Contract.create({ ...baseProps, name: '  ' })).toThrow(
      'Contract name cannot be empty',
    )
  })

  it('should reject invalid contract type', () => {
    expect(() =>
      Contract.create({ ...baseProps, type: 'Invalid' as ContractType }),
    ).toThrow('Invalid contract type: Invalid')
  })

  it('should reject invalid provider type', () => {
    expect(() =>
      Contract.create({ ...baseProps, providerType: 'workflow' as PartyType }),
    ).toThrow('Invalid provider type: workflow')
  })

  it('should reject invalid consumer type', () => {
    expect(() =>
      Contract.create({ ...baseProps, consumerType: 'agent' as PartyType }),
    ).toThrow('Invalid consumer type: agent')
  })

  it('should reject same provider and consumer', () => {
    expect(() =>
      Contract.create({ ...baseProps, consumerId: 'd1', consumerType: 'department' }),
    ).toThrow('Provider and consumer cannot be the same party')
  })

  it('should allow same id with different party types', () => {
    const contract = Contract.create({
      ...baseProps,
      providerId: 'x1',
      providerType: 'department',
      consumerId: 'x1',
      consumerType: 'capability',
    })
    expect(contract.providerId).toBe('x1')
    expect(contract.consumerId).toBe('x1')
  })

  it('should create with acceptance criteria, filtering empty', () => {
    const contract = Contract.create({
      ...baseProps,
      acceptanceCriteria: ['99.9% uptime', '', '  ', 'Max 200ms latency'],
    })
    expect(contract.acceptanceCriteria).toEqual(['99.9% uptime', 'Max 200ms latency'])
  })

  it('should create all valid types', () => {
    for (const type of ['SLA', 'DataContract', 'InterfaceContract', 'OperationalAgreement'] as const) {
      const contract = Contract.create({ ...baseProps, type })
      expect(contract.type).toBe(type)
    }
  })

  it('should update name and description', () => {
    const contract = Contract.create(baseProps)
    contract.update({ name: 'New Name', description: 'New desc' })
    expect(contract.name).toBe('New Name')
    expect(contract.description).toBe('New desc')
  })

  it('should reject empty name on update', () => {
    const contract = Contract.create(baseProps)
    expect(() => contract.update({ name: '' })).toThrow('Contract name cannot be empty')
  })

  it('should update type', () => {
    const contract = Contract.create(baseProps)
    contract.update({ type: 'DataContract' })
    expect(contract.type).toBe('DataContract')
  })

  it('should reject invalid type on update', () => {
    const contract = Contract.create(baseProps)
    expect(() => contract.update({ type: 'Bad' as ContractType })).toThrow('Invalid contract type: Bad')
  })

  it('should update status', () => {
    const contract = Contract.create(baseProps)
    contract.update({ status: 'active' })
    expect(contract.status).toBe('active')
    contract.update({ status: 'deprecated' })
    expect(contract.status).toBe('deprecated')
  })

  it('should reject invalid status on update', () => {
    const contract = Contract.create(baseProps)
    expect(() => contract.update({ status: 'deleted' as ContractStatus })).toThrow(
      'Invalid contract status: deleted',
    )
  })

  it('should update parties', () => {
    const contract = Contract.create(baseProps)
    contract.update({ providerId: 'c1', providerType: 'capability' })
    expect(contract.providerId).toBe('c1')
    expect(contract.providerType).toBe('capability')
  })

  it('should reject invalid provider type on update', () => {
    const contract = Contract.create(baseProps)
    expect(() => contract.update({ providerType: 'x' as PartyType })).toThrow(
      'Invalid provider type: x',
    )
  })

  it('should reject invalid consumer type on update', () => {
    const contract = Contract.create(baseProps)
    expect(() => contract.update({ consumerType: 'x' as PartyType })).toThrow(
      'Invalid consumer type: x',
    )
  })

  it('should reject update that makes provider equal consumer', () => {
    const contract = Contract.create(baseProps)
    expect(() => contract.update({ providerId: 'd2' })).toThrow(
      'Provider and consumer cannot be the same party',
    )
  })

  it('should update acceptance criteria', () => {
    const contract = Contract.create(baseProps)
    contract.update({ acceptanceCriteria: ['Must pass audit'] })
    expect(contract.acceptanceCriteria).toEqual(['Must pass audit'])
  })

  it('should preserve unchanged fields on update', () => {
    const contract = Contract.create({
      ...baseProps,
      acceptanceCriteria: ['Criterion A'],
    })
    contract.update({ name: 'Updated' })
    expect(contract.type).toBe('SLA')
    expect(contract.status).toBe('draft')
    expect(contract.providerId).toBe('d1')
    expect(contract.acceptanceCriteria).toEqual(['Criterion A'])
  })

  it('should emit ContractUpdated event', () => {
    const contract = Contract.create(baseProps)
    contract.clearEvents()
    contract.update({ name: 'Changed' })
    expect(contract.domainEvents).toHaveLength(1)
    expect(contract.domainEvents[0]!.eventType).toBe('ContractUpdated')
  })

  it('should reconstitute from props', () => {
    const now = new Date()
    const contract = Contract.reconstitute('ct1', {
      projectId: 'p1',
      name: 'Test',
      description: '',
      type: 'DataContract',
      status: 'active',
      providerId: 'd1',
      providerType: 'department',
      consumerId: 'c1',
      consumerType: 'capability',
      acceptanceCriteria: ['A'],
      createdAt: now,
      updatedAt: now,
    })
    expect(contract.name).toBe('Test')
    expect(contract.status).toBe('active')
    expect(contract.domainEvents).toHaveLength(0)
  })

  it('should return defensive copies of acceptance criteria', () => {
    const contract = Contract.create({
      ...baseProps,
      acceptanceCriteria: ['A'],
    })
    expect(contract.acceptanceCriteria).not.toBe(contract.acceptanceCriteria)
  })

  it('should trim name on create', () => {
    const contract = Contract.create({ ...baseProps, name: '  Trimmed  ' })
    expect(contract.name).toBe('Trimmed')
  })

  it('should trim name on update', () => {
    const contract = Contract.create(baseProps)
    contract.update({ name: '  Updated  ' })
    expect(contract.name).toBe('Updated')
  })
})
