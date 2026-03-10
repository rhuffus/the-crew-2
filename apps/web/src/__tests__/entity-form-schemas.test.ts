import { describe, it, expect } from 'vitest'
import {
  ENTITY_FORM_SCHEMAS,
  getAddableTypes,
  getSchemaForType,
  getRequiredOptionsSources,
} from '@/lib/entity-form-schemas'

describe('ENTITY_FORM_SCHEMAS', () => {
  it('should define 9 entity schemas', () => {
    expect(ENTITY_FORM_SCHEMAS).toHaveLength(9)
  })

  it('should have unique node types', () => {
    const types = ENTITY_FORM_SCHEMAS.map((s) => s.nodeType)
    expect(new Set(types).size).toBe(types.length)
  })

  it('should have at least one field per schema', () => {
    for (const schema of ENTITY_FORM_SCHEMAS) {
      expect(schema.fields.length).toBeGreaterThan(0)
    }
  })

  it('should have name as the first required field for every schema', () => {
    for (const schema of ENTITY_FORM_SCHEMAS) {
      const nameField = schema.fields.find((f) => f.name === 'name')
      expect(nameField).toBeDefined()
      expect(nameField!.required).toBe(true)
    }
  })

  it('department schema should have parentId select with departments source', () => {
    const dept = getSchemaForType('department')!
    const parentField = dept.fields.find((f) => f.name === 'parentId')
    expect(parentField).toBeDefined()
    expect(parentField!.type).toBe('select')
    expect(parentField!.optionsSource).toBe('departments')
  })

  it('contract schema should have party-select fields', () => {
    const contract = getSchemaForType('contract')!
    const provider = contract.fields.find((f) => f.name === 'provider')
    const consumer = contract.fields.find((f) => f.name === 'consumer')
    expect(provider!.type).toBe('party-select')
    expect(consumer!.type).toBe('party-select')
  })

  it('contract schema should have type options', () => {
    const contract = getSchemaForType('contract')!
    const typeField = contract.fields.find((f) => f.name === 'type')
    expect(typeField!.options).toHaveLength(4)
    expect(typeField!.defaultValue).toBe('SLA')
  })

  it('policy schema should have conditional departmentId', () => {
    const policy = getSchemaForType('policy')!
    const deptField = policy.fields.find((f) => f.name === 'departmentId')
    expect(deptField!.conditional).toEqual({ field: 'scope', value: 'department' })
  })

  it('skill schema should have tags field', () => {
    const skill = getSchemaForType('skill')!
    const tagsField = skill.fields.find((f) => f.name === 'tags')
    expect(tagsField!.type).toBe('tags')
  })

  it('agent-assignment schema should have archetypeId with archetypes source', () => {
    const assignment = getSchemaForType('agent-assignment')!
    const archField = assignment.fields.find((f) => f.name === 'archetypeId')
    expect(archField!.optionsSource).toBe('archetypes')
    expect(archField!.required).toBe(true)
  })

  it('role schema should have scopeAutoFill for departmentId', () => {
    const role = getSchemaForType('role')!
    expect(role.scopeAutoFill).toEqual({ departmentId: 'departmentId' })
  })
})

describe('getAddableTypes', () => {
  it('should return department for L1', () => {
    expect(getAddableTypes('L1')).toEqual(['department'])
  })

  it('should return 8 types for L2', () => {
    const types = getAddableTypes('L2')
    expect(types).toHaveLength(8)
    expect(types).toContain('role')
    expect(types).toContain('capability')
    expect(types).toContain('workflow')
    expect(types).toContain('contract')
    expect(types).toContain('policy')
    expect(types).toContain('skill')
    expect(types).toContain('agent-archetype')
    expect(types).toContain('agent-assignment')
  })

  it('should return empty array for L3', () => {
    expect(getAddableTypes('L3')).toEqual([])
  })

  it('should return empty array for L4', () => {
    expect(getAddableTypes('L4')).toEqual([])
  })
})

describe('getSchemaForType', () => {
  it('should return schema for known type', () => {
    const schema = getSchemaForType('department')
    expect(schema).toBeDefined()
    expect(schema!.label).toBe('Department')
  })

  it('should return undefined for unknown type', () => {
    expect(getSchemaForType('company')).toBeUndefined()
  })
})

describe('getRequiredOptionsSources', () => {
  it('should return departments for department schema', () => {
    const schema = getSchemaForType('department')!
    expect(getRequiredOptionsSources(schema)).toEqual(['departments'])
  })

  it('should return roles and departments for agent-archetype', () => {
    const schema = getSchemaForType('agent-archetype')!
    const sources = getRequiredOptionsSources(schema)
    expect(sources).toContain('roles')
    expect(sources).toContain('departments')
  })

  it('should return departments and capabilities for contract (party-select)', () => {
    const schema = getSchemaForType('contract')!
    const sources = getRequiredOptionsSources(schema)
    expect(sources).toContain('departments')
    expect(sources).toContain('capabilities')
  })

  it('should return empty for skill (no sources needed)', () => {
    const schema = getSchemaForType('skill')!
    expect(getRequiredOptionsSources(schema)).toEqual([])
  })

  it('should return archetypes for agent-assignment', () => {
    const schema = getSchemaForType('agent-assignment')!
    expect(getRequiredOptionsSources(schema)).toContain('archetypes')
  })
})
