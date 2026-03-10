import { describe, it, expect } from 'vitest'
import { Skill } from './skill'

describe('Skill', () => {
  const validProps = {
    id: 's1',
    projectId: 'p1',
    name: 'Code Review',
    description: 'Reviews code for quality',
    category: 'Engineering',
  }

  describe('create', () => {
    it('should create a skill with required fields', () => {
      const skill = Skill.create(validProps)
      expect(skill.id).toBe('s1')
      expect(skill.projectId).toBe('p1')
      expect(skill.name).toBe('Code Review')
      expect(skill.description).toBe('Reviews code for quality')
      expect(skill.category).toBe('Engineering')
      expect(skill.tags).toEqual([])
      expect(skill.compatibleRoleIds).toEqual([])
    })

    it('should create a skill with optional fields', () => {
      const skill = Skill.create({
        ...validProps,
        tags: ['quality', 'review'],
        compatibleRoleIds: ['r1', 'r2'],
      })
      expect(skill.tags).toEqual(['quality', 'review'])
      expect(skill.compatibleRoleIds).toEqual(['r1', 'r2'])
    })

    it('should trim the name', () => {
      const skill = Skill.create({ ...validProps, name: '  Code Review  ' })
      expect(skill.name).toBe('Code Review')
    })

    it('should trim the category', () => {
      const skill = Skill.create({ ...validProps, category: '  Engineering  ' })
      expect(skill.category).toBe('Engineering')
    })

    it('should throw on empty name', () => {
      expect(() => Skill.create({ ...validProps, name: '' })).toThrow('Skill name cannot be empty')
    })

    it('should throw on whitespace-only name', () => {
      expect(() => Skill.create({ ...validProps, name: '   ' })).toThrow('Skill name cannot be empty')
    })

    it('should throw on empty category', () => {
      expect(() => Skill.create({ ...validProps, category: '' })).toThrow('Skill category cannot be empty')
    })

    it('should throw on whitespace-only category', () => {
      expect(() => Skill.create({ ...validProps, category: '   ' })).toThrow('Skill category cannot be empty')
    })

    it('should filter empty strings from tags', () => {
      const skill = Skill.create({ ...validProps, tags: ['valid', '', 'also-valid'] })
      expect(skill.tags).toEqual(['valid', 'also-valid'])
    })

    it('should filter empty strings from compatibleRoleIds', () => {
      const skill = Skill.create({ ...validProps, compatibleRoleIds: ['r1', '', 'r2'] })
      expect(skill.compatibleRoleIds).toEqual(['r1', 'r2'])
    })

    it('should emit SkillCreated event', () => {
      const skill = Skill.create(validProps)
      const events = skill.domainEvents
      expect(events).toHaveLength(1)
      expect(events[0]!.eventType).toBe('SkillCreated')
      expect(events[0]!.aggregateId).toBe('s1')
    })

    it('should set createdAt and updatedAt', () => {
      const skill = Skill.create(validProps)
      expect(skill.createdAt).toBeInstanceOf(Date)
      expect(skill.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('reconstitute', () => {
    it('should reconstitute a skill from stored props', () => {
      const now = new Date()
      const skill = Skill.reconstitute('s1', {
        projectId: 'p1',
        name: 'Deploy',
        description: 'Deploys services',
        category: 'DevOps',
        tags: ['ci', 'cd'],
        compatibleRoleIds: ['r1'],
        createdAt: now,
        updatedAt: now,
      })
      expect(skill.id).toBe('s1')
      expect(skill.name).toBe('Deploy')
      expect(skill.category).toBe('DevOps')
      expect(skill.tags).toEqual(['ci', 'cd'])
      expect(skill.domainEvents).toHaveLength(0)
    })
  })

  describe('update', () => {
    it('should update name', () => {
      const skill = Skill.create(validProps)
      skill.update({ name: 'Updated Name' })
      expect(skill.name).toBe('Updated Name')
    })

    it('should update description', () => {
      const skill = Skill.create(validProps)
      skill.update({ description: 'New description' })
      expect(skill.description).toBe('New description')
    })

    it('should update category', () => {
      const skill = Skill.create(validProps)
      skill.update({ category: 'DevOps' })
      expect(skill.category).toBe('DevOps')
    })

    it('should update tags', () => {
      const skill = Skill.create(validProps)
      skill.update({ tags: ['new-tag'] })
      expect(skill.tags).toEqual(['new-tag'])
    })

    it('should update compatibleRoleIds', () => {
      const skill = Skill.create(validProps)
      skill.update({ compatibleRoleIds: ['r1', 'r2'] })
      expect(skill.compatibleRoleIds).toEqual(['r1', 'r2'])
    })

    it('should throw on empty name update', () => {
      const skill = Skill.create(validProps)
      expect(() => skill.update({ name: '' })).toThrow('Skill name cannot be empty')
    })

    it('should throw on empty category update', () => {
      const skill = Skill.create(validProps)
      expect(() => skill.update({ category: '' })).toThrow('Skill category cannot be empty')
    })

    it('should emit SkillUpdated event', () => {
      const skill = Skill.create(validProps)
      skill.clearEvents()
      skill.update({ name: 'Updated' })
      const events = skill.domainEvents
      expect(events).toHaveLength(1)
      expect(events[0]!.eventType).toBe('SkillUpdated')
    })

    it('should update the updatedAt timestamp', () => {
      const skill = Skill.create(validProps)
      const originalUpdatedAt = skill.updatedAt
      skill.update({ name: 'Updated' })
      expect(skill.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime())
    })

    it('should not change fields that are not provided', () => {
      const skill = Skill.create({ ...validProps, tags: ['t1'] })
      skill.update({ name: 'New Name' })
      expect(skill.description).toBe('Reviews code for quality')
      expect(skill.category).toBe('Engineering')
      expect(skill.tags).toEqual(['t1'])
    })
  })

  describe('defensive copies', () => {
    it('should return a copy of tags', () => {
      const skill = Skill.create({ ...validProps, tags: ['a'] })
      const tags = skill.tags
      tags.push('b')
      expect(skill.tags).toEqual(['a'])
    })

    it('should return a copy of compatibleRoleIds', () => {
      const skill = Skill.create({ ...validProps, compatibleRoleIds: ['r1'] })
      const ids = skill.compatibleRoleIds
      ids.push('r2')
      expect(skill.compatibleRoleIds).toEqual(['r1'])
    })
  })
})
