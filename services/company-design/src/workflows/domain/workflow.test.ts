import { describe, it, expect } from 'vitest'
import {
  Workflow,
  WorkflowStage,
  WorkflowParticipant,
} from './workflow'
import type {
  WorkflowStatus,
  WorkflowParticipantType,
} from './workflow'

describe('WorkflowStage', () => {
  it('should create a valid stage', () => {
    const stage = WorkflowStage.create({ name: 'Review', order: 1, description: 'Code review' })
    expect(stage.name).toBe('Review')
    expect(stage.order).toBe(1)
    expect(stage.description).toBe('Code review')
  })

  it('should trim stage name', () => {
    const stage = WorkflowStage.create({ name: '  Review  ', order: 1, description: '' })
    expect(stage.name).toBe('Review')
  })

  it('should reject empty name', () => {
    expect(() => WorkflowStage.create({ name: '', order: 1, description: '' })).toThrow(
      'Stage name cannot be empty',
    )
  })

  it('should reject non-positive order', () => {
    expect(() => WorkflowStage.create({ name: 'A', order: 0, description: '' })).toThrow(
      'Stage order must be a positive integer',
    )
  })

  it('should reject non-integer order', () => {
    expect(() => WorkflowStage.create({ name: 'A', order: 1.5, description: '' })).toThrow(
      'Stage order must be a positive integer',
    )
  })

  it('should support equality', () => {
    const a = WorkflowStage.create({ name: 'A', order: 1, description: '' })
    const b = WorkflowStage.create({ name: 'A', order: 1, description: '' })
    expect(a.equals(b)).toBe(true)
  })
})

describe('WorkflowParticipant', () => {
  it('should create a valid participant', () => {
    const p = WorkflowParticipant.create({
      participantId: 'd1',
      participantType: 'department',
      responsibility: 'Leads the process',
    })
    expect(p.participantId).toBe('d1')
    expect(p.participantType).toBe('department')
    expect(p.responsibility).toBe('Leads the process')
  })

  it('should reject empty participant ID', () => {
    expect(() =>
      WorkflowParticipant.create({ participantId: '', participantType: 'role', responsibility: 'x' }),
    ).toThrow('Participant ID cannot be empty')
  })

  it('should reject invalid participant type', () => {
    expect(() =>
      WorkflowParticipant.create({
        participantId: 'r1',
        participantType: 'agent' as WorkflowParticipantType,
        responsibility: 'x',
      }),
    ).toThrow('Invalid participant type: agent')
  })

  it('should reject empty responsibility', () => {
    expect(() =>
      WorkflowParticipant.create({ participantId: 'r1', participantType: 'role', responsibility: '  ' }),
    ).toThrow('Participant responsibility cannot be empty')
  })

  it('should trim responsibility', () => {
    const p = WorkflowParticipant.create({
      participantId: 'r1',
      participantType: 'role',
      responsibility: '  Approves  ',
    })
    expect(p.responsibility).toBe('Approves')
  })
})

describe('Workflow', () => {
  const baseProps = {
    id: 'w1',
    projectId: 'p1',
    name: 'Onboarding Flow',
    description: 'New hire onboarding',
  }

  // --- Creation ---

  it('should create a minimal workflow', () => {
    const wf = Workflow.create(baseProps)
    expect(wf.id).toBe('w1')
    expect(wf.projectId).toBe('p1')
    expect(wf.name).toBe('Onboarding Flow')
    expect(wf.description).toBe('New hire onboarding')
    expect(wf.status).toBe('draft')
    expect(wf.ownerDepartmentId).toBeNull()
    expect(wf.triggerDescription).toBe('')
    expect(wf.stages).toEqual([])
    expect(wf.participants).toEqual([])
    expect(wf.contractIds).toEqual([])
  })

  it('should emit WorkflowCreated event', () => {
    const wf = Workflow.create(baseProps)
    expect(wf.domainEvents).toHaveLength(1)
    expect(wf.domainEvents[0]!.eventType).toBe('WorkflowCreated')
  })

  it('should trim name on create', () => {
    const wf = Workflow.create({ ...baseProps, name: '  Trimmed  ' })
    expect(wf.name).toBe('Trimmed')
  })

  it('should reject empty name', () => {
    expect(() => Workflow.create({ ...baseProps, name: '  ' })).toThrow(
      'Workflow name cannot be empty',
    )
  })

  it('should create with owner department', () => {
    const wf = Workflow.create({ ...baseProps, ownerDepartmentId: 'd1' })
    expect(wf.ownerDepartmentId).toBe('d1')
  })

  it('should create with trigger description', () => {
    const wf = Workflow.create({ ...baseProps, triggerDescription: 'New hire joins' })
    expect(wf.triggerDescription).toBe('New hire joins')
  })

  it('should create with stages', () => {
    const wf = Workflow.create({
      ...baseProps,
      stages: [
        { name: 'Setup', order: 1, description: 'Account setup' },
        { name: 'Training', order: 2, description: 'Initial training' },
      ],
    })
    expect(wf.stages).toHaveLength(2)
    expect(wf.stages[0]!.name).toBe('Setup')
    expect(wf.stages[1]!.name).toBe('Training')
  })

  it('should reject duplicate stage orders on create', () => {
    expect(() =>
      Workflow.create({
        ...baseProps,
        stages: [
          { name: 'A', order: 1, description: '' },
          { name: 'B', order: 1, description: '' },
        ],
      }),
    ).toThrow('Stage orders must be unique')
  })

  it('should create with participants', () => {
    const wf = Workflow.create({
      ...baseProps,
      participants: [
        { participantId: 'd1', participantType: 'department', responsibility: 'Owns the process' },
      ],
    })
    expect(wf.participants).toHaveLength(1)
    expect(wf.participants[0]!.participantId).toBe('d1')
  })

  it('should reject duplicate participants on create', () => {
    expect(() =>
      Workflow.create({
        ...baseProps,
        participants: [
          { participantId: 'd1', participantType: 'department', responsibility: 'A' },
          { participantId: 'd1', participantType: 'department', responsibility: 'B' },
        ],
      }),
    ).toThrow('Duplicate participant detected')
  })

  it('should allow same id with different participant type', () => {
    const wf = Workflow.create({
      ...baseProps,
      participants: [
        { participantId: 'x1', participantType: 'department', responsibility: 'A' },
        { participantId: 'x1', participantType: 'role', responsibility: 'B' },
      ],
    })
    expect(wf.participants).toHaveLength(2)
  })

  it('should create with contract IDs, deduped', () => {
    const wf = Workflow.create({ ...baseProps, contractIds: ['c1', 'c2', 'c1', ''] })
    expect(wf.contractIds).toEqual(['c1', 'c2'])
  })

  // --- Update ---

  it('should update name and description', () => {
    const wf = Workflow.create(baseProps)
    wf.update({ name: 'Updated Flow', description: 'Updated desc' })
    expect(wf.name).toBe('Updated Flow')
    expect(wf.description).toBe('Updated desc')
  })

  it('should reject empty name on update', () => {
    const wf = Workflow.create(baseProps)
    expect(() => wf.update({ name: '' })).toThrow('Workflow name cannot be empty')
  })

  it('should trim name on update', () => {
    const wf = Workflow.create(baseProps)
    wf.update({ name: '  Trimmed  ' })
    expect(wf.name).toBe('Trimmed')
  })

  it('should update owner department', () => {
    const wf = Workflow.create(baseProps)
    wf.update({ ownerDepartmentId: 'd2' })
    expect(wf.ownerDepartmentId).toBe('d2')
  })

  it('should clear owner department', () => {
    const wf = Workflow.create({ ...baseProps, ownerDepartmentId: 'd1' })
    wf.update({ ownerDepartmentId: null })
    expect(wf.ownerDepartmentId).toBeNull()
  })

  it('should update trigger description', () => {
    const wf = Workflow.create(baseProps)
    wf.update({ triggerDescription: 'Manual trigger' })
    expect(wf.triggerDescription).toBe('Manual trigger')
  })

  it('should update stages', () => {
    const wf = Workflow.create(baseProps)
    wf.update({ stages: [{ name: 'Review', order: 1, description: 'Review step' }] })
    expect(wf.stages).toHaveLength(1)
    expect(wf.stages[0]!.name).toBe('Review')
  })

  it('should reject duplicate stage orders on update', () => {
    const wf = Workflow.create(baseProps)
    expect(() =>
      wf.update({
        stages: [
          { name: 'A', order: 1, description: '' },
          { name: 'B', order: 1, description: '' },
        ],
      }),
    ).toThrow('Stage orders must be unique')
  })

  it('should update participants', () => {
    const wf = Workflow.create(baseProps)
    wf.update({
      participants: [{ participantId: 'r1', participantType: 'role', responsibility: 'Reviews' }],
    })
    expect(wf.participants).toHaveLength(1)
  })

  it('should reject duplicate participants on update', () => {
    const wf = Workflow.create(baseProps)
    expect(() =>
      wf.update({
        participants: [
          { participantId: 'r1', participantType: 'role', responsibility: 'A' },
          { participantId: 'r1', participantType: 'role', responsibility: 'B' },
        ],
      }),
    ).toThrow('Duplicate participant detected')
  })

  it('should update contract IDs', () => {
    const wf = Workflow.create(baseProps)
    wf.update({ contractIds: ['c3', 'c4'] })
    expect(wf.contractIds).toEqual(['c3', 'c4'])
  })

  it('should emit WorkflowUpdated event', () => {
    const wf = Workflow.create(baseProps)
    wf.clearEvents()
    wf.update({ name: 'Changed' })
    expect(wf.domainEvents).toHaveLength(1)
    expect(wf.domainEvents[0]!.eventType).toBe('WorkflowUpdated')
  })

  it('should preserve unchanged fields on update', () => {
    const wf = Workflow.create({
      ...baseProps,
      ownerDepartmentId: 'd1',
      triggerDescription: 'Trigger',
      stages: [{ name: 'A', order: 1, description: '' }],
      participants: [{ participantId: 'd1', participantType: 'department', responsibility: 'Owns' }],
      contractIds: ['c1'],
    })
    wf.update({ name: 'Updated' })
    expect(wf.ownerDepartmentId).toBe('d1')
    expect(wf.triggerDescription).toBe('Trigger')
    expect(wf.stages).toHaveLength(1)
    expect(wf.participants).toHaveLength(1)
    expect(wf.contractIds).toEqual(['c1'])
  })

  // --- Status transitions ---

  it('should activate draft workflow with stages', () => {
    const wf = Workflow.create({
      ...baseProps,
      stages: [{ name: 'Step 1', order: 1, description: '' }],
    })
    wf.update({ status: 'active' })
    expect(wf.status).toBe('active')
  })

  it('should reject activation without stages', () => {
    const wf = Workflow.create(baseProps)
    expect(() => wf.update({ status: 'active' })).toThrow(
      'Cannot activate a workflow with no stages',
    )
  })

  it('should allow activation when stages are provided in same update', () => {
    const wf = Workflow.create(baseProps)
    wf.update({
      stages: [{ name: 'Step 1', order: 1, description: '' }],
      status: 'active',
    })
    expect(wf.status).toBe('active')
  })

  it('should archive active workflow', () => {
    const wf = Workflow.create({
      ...baseProps,
      stages: [{ name: 'Step 1', order: 1, description: '' }],
    })
    wf.update({ status: 'active' })
    wf.update({ status: 'archived' })
    expect(wf.status).toBe('archived')
  })

  it('should archive draft workflow', () => {
    const wf = Workflow.create(baseProps)
    wf.update({ status: 'archived' })
    expect(wf.status).toBe('archived')
  })

  it('should reject transition from archived', () => {
    const wf = Workflow.create(baseProps)
    wf.update({ status: 'archived' })
    expect(() => wf.update({ status: 'draft' })).toThrow(
      'Cannot transition from archived status',
    )
  })

  it('should reject invalid status', () => {
    const wf = Workflow.create(baseProps)
    expect(() => wf.update({ status: 'deleted' as WorkflowStatus })).toThrow(
      'Invalid workflow status: deleted',
    )
  })

  it('should allow no-op status transition', () => {
    const wf = Workflow.create(baseProps)
    wf.update({ status: 'draft' })
    expect(wf.status).toBe('draft')
  })

  // --- Reconstitute ---

  it('should reconstitute without events', () => {
    const now = new Date()
    const wf = Workflow.reconstitute('w1', {
      projectId: 'p1',
      name: 'Test',
      description: '',
      ownerDepartmentId: null,
      status: 'active',
      triggerDescription: '',
      stages: [WorkflowStage.create({ name: 'S1', order: 1, description: '' })],
      participants: [],
      contractIds: [],
      createdAt: now,
      updatedAt: now,
    })
    expect(wf.name).toBe('Test')
    expect(wf.status).toBe('active')
    expect(wf.stages).toHaveLength(1)
    expect(wf.domainEvents).toHaveLength(0)
  })

  // --- Defensive copies ---

  it('should return defensive copies of stages', () => {
    const wf = Workflow.create({
      ...baseProps,
      stages: [{ name: 'A', order: 1, description: '' }],
    })
    expect(wf.stages).not.toBe(wf.stages)
  })

  it('should return defensive copies of participants', () => {
    const wf = Workflow.create({
      ...baseProps,
      participants: [{ participantId: 'd1', participantType: 'department', responsibility: 'Own' }],
    })
    expect(wf.participants).not.toBe(wf.participants)
  })

  it('should return defensive copies of contract IDs', () => {
    const wf = Workflow.create({ ...baseProps, contractIds: ['c1'] })
    expect(wf.contractIds).not.toBe(wf.contractIds)
  })
})
