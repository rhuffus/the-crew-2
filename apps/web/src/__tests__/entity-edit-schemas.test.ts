import { describe, it, expect } from 'vitest'
import { getEditSchema, getEditRequiredSources, ENTITY_EDIT_SCHEMAS } from '@/lib/entity-edit-schemas'
import type { NodeType } from '@the-crew/shared-types'

describe('entity-edit-schemas', () => {
  describe('ENTITY_EDIT_SCHEMAS', () => {
    it('should have schemas for all 10 editable node types', () => {
      const types = ENTITY_EDIT_SCHEMAS.map((s) => s.nodeType)
      expect(types).toContain('department')
      expect(types).toContain('capability')
      expect(types).toContain('role')
      expect(types).toContain('workflow')
      expect(types).toContain('contract')
      expect(types).toContain('policy')
      expect(types).toContain('skill')
      expect(types).toContain('agent-archetype')
      expect(types).toContain('agent-assignment')
      expect(types).toContain('artifact')
      expect(types).toHaveLength(10)
    })

    it('every schema should have a name field', () => {
      for (const schema of ENTITY_EDIT_SCHEMAS) {
        const nameField = schema.fields.find((f) => f.name === 'name')
        expect(nameField, `${schema.nodeType} missing name field`).toBeDefined()
        expect(nameField!.type).toBe('text')
      }
    })

    it('department should have 4 fields', () => {
      const schema = getEditSchema('department')!
      expect(schema.fields).toHaveLength(4)
      expect(schema.fields.map((f) => f.name)).toEqual(['name', 'description', 'mandate', 'parentId'])
    })

    it('role should include capabilityIds multi-select', () => {
      const schema = getEditSchema('role')!
      const capField = schema.fields.find((f) => f.name === 'capabilityIds')
      expect(capField).toBeDefined()
      expect(capField!.type).toBe('multi-select')
      expect(capField!.optionsSource).toBe('capabilities')
    })

    it('capability should include inputs and outputs tags', () => {
      const schema = getEditSchema('capability')!
      const inputsField = schema.fields.find((f) => f.name === 'inputs')
      const outputsField = schema.fields.find((f) => f.name === 'outputs')
      expect(inputsField!.type).toBe('tags')
      expect(outputsField!.type).toBe('tags')
    })

    it('contract should have party-select fields', () => {
      const schema = getEditSchema('contract')!
      const provider = schema.fields.find((f) => f.name === 'providerId')
      const consumer = schema.fields.find((f) => f.name === 'consumerId')
      expect(provider!.type).toBe('party-select')
      expect(consumer!.type).toBe('party-select')
    })

    it('policy should have conditional departmentId field', () => {
      const schema = getEditSchema('policy')!
      const deptField = schema.fields.find((f) => f.name === 'departmentId')
      expect(deptField!.conditional).toEqual({ field: 'scope', value: 'department' })
    })

    it('workflow should have status-select', () => {
      const schema = getEditSchema('workflow')!
      const statusField = schema.fields.find((f) => f.name === 'status')
      expect(statusField!.type).toBe('status-select')
      expect(statusField!.options).toHaveLength(3)
    })

    it('skill should have tags and multi-select for compatibleRoleIds', () => {
      const schema = getEditSchema('skill')!
      const tagsField = schema.fields.find((f) => f.name === 'tags')
      const rolesField = schema.fields.find((f) => f.name === 'compatibleRoleIds')
      expect(tagsField!.type).toBe('tags')
      expect(rolesField!.type).toBe('multi-select')
      expect(rolesField!.optionsSource).toBe('roles')
    })

    it('agent-archetype should have skillIds multi-select', () => {
      const schema = getEditSchema('agent-archetype')!
      const skillsField = schema.fields.find((f) => f.name === 'skillIds')
      expect(skillsField!.type).toBe('multi-select')
      expect(skillsField!.optionsSource).toBe('skills')
    })

    it('agent-assignment should have readOnly archetypeId', () => {
      const schema = getEditSchema('agent-assignment')!
      const archetypeField = schema.fields.find((f) => f.name === 'archetypeId')
      expect(archetypeField!.readOnly).toBe(true)
    })
  })

  describe('getEditSchema', () => {
    it('should return schema for known type', () => {
      expect(getEditSchema('department')).toBeDefined()
      expect(getEditSchema('department')!.nodeType).toBe('department')
    })

    it('should return undefined for unknown type', () => {
      expect(getEditSchema('company' as NodeType)).toBeUndefined()
      expect(getEditSchema('workflow-stage' as NodeType)).toBeUndefined()
    })
  })

  describe('getEditRequiredSources', () => {
    it('should return departments for department schema', () => {
      const schema = getEditSchema('department')!
      expect(getEditRequiredSources(schema)).toEqual(['departments'])
    })

    it('should return multiple sources for role schema', () => {
      const schema = getEditSchema('role')!
      const sources = getEditRequiredSources(schema)
      expect(sources).toContain('departments')
      expect(sources).toContain('capabilities')
    })

    it('should include departments and capabilities for contract (party-select)', () => {
      const schema = getEditSchema('contract')!
      const sources = getEditRequiredSources(schema)
      expect(sources).toContain('departments')
      expect(sources).toContain('capabilities')
    })

    it('should return skills for agent-archetype', () => {
      const schema = getEditSchema('agent-archetype')!
      const sources = getEditRequiredSources(schema)
      expect(sources).toContain('skills')
    })

    it('should return empty for types with no optionsSource fields', () => {
      const schema = getEditSchema('skill')!
      const sources = getEditRequiredSources(schema)
      expect(sources).toContain('roles')
    })
  })
})
