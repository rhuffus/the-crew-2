import { describe, it, expect } from 'vitest'
import { SavedView } from './saved-view'

describe('SavedView', () => {
  const validProps = {
    id: 'sv1',
    projectId: 'p1',
    name: 'My View',
    state: {
      activeLayers: ['organization' as const],
      nodeTypeFilter: null,
      statusFilter: null,
    },
  }

  describe('create', () => {
    it('should create a saved view with valid props', () => {
      const view = SavedView.create(validProps)
      expect(view.id).toBe('sv1')
      expect(view.projectId).toBe('p1')
      expect(view.name).toBe('My View')
      expect(view.state.activeLayers).toEqual(['organization'])
      expect(view.state.nodeTypeFilter).toBeNull()
      expect(view.state.statusFilter).toBeNull()
    })

    it('should trim the name', () => {
      const view = SavedView.create({ ...validProps, name: '  My View  ' })
      expect(view.name).toBe('My View')
    })

    it('should throw on empty name', () => {
      expect(() => SavedView.create({ ...validProps, name: '' })).toThrow('Saved view name cannot be empty')
    })

    it('should throw on whitespace-only name', () => {
      expect(() => SavedView.create({ ...validProps, name: '   ' })).toThrow('Saved view name cannot be empty')
    })

    it('should set createdAt and updatedAt', () => {
      const view = SavedView.create(validProps)
      expect(view.createdAt).toBeInstanceOf(Date)
      expect(view.updatedAt).toBeInstanceOf(Date)
    })

    it('should preserve nodeTypeFilter when provided', () => {
      const view = SavedView.create({
        ...validProps,
        state: {
          activeLayers: ['organization'],
          nodeTypeFilter: ['department', 'role'],
          statusFilter: ['error'],
        },
      })
      expect(view.state.nodeTypeFilter).toEqual(['department', 'role'])
      expect(view.state.statusFilter).toEqual(['error'])
    })
  })

  describe('reconstitute', () => {
    it('should reconstitute from stored props', () => {
      const now = new Date()
      const view = SavedView.reconstitute('sv1', {
        projectId: 'p1',
        name: 'Old View',
        state: {
          activeLayers: ['capabilities'],
          nodeTypeFilter: ['capability'],
          statusFilter: null,
        },
        createdAt: now,
        updatedAt: now,
      })
      expect(view.id).toBe('sv1')
      expect(view.name).toBe('Old View')
      expect(view.state.activeLayers).toEqual(['capabilities'])
    })
  })

  describe('update', () => {
    it('should update name', () => {
      const view = SavedView.create(validProps)
      view.update({ name: 'Updated View' })
      expect(view.name).toBe('Updated View')
    })

    it('should update state', () => {
      const view = SavedView.create(validProps)
      view.update({
        state: {
          activeLayers: ['workflows'],
          nodeTypeFilter: ['workflow'],
          statusFilter: null,
        },
      })
      expect(view.state.activeLayers).toEqual(['workflows'])
      expect(view.state.nodeTypeFilter).toEqual(['workflow'])
    })

    it('should throw on empty name update', () => {
      const view = SavedView.create(validProps)
      expect(() => view.update({ name: '' })).toThrow('Saved view name cannot be empty')
    })

    it('should update the updatedAt timestamp', () => {
      const view = SavedView.create(validProps)
      const original = view.updatedAt
      view.update({ name: 'Updated' })
      expect(view.updatedAt.getTime()).toBeGreaterThanOrEqual(original.getTime())
    })

    it('should not change fields that are not provided', () => {
      const view = SavedView.create(validProps)
      view.update({ name: 'New Name' })
      expect(view.state.activeLayers).toEqual(['organization'])
    })
  })

  describe('defensive copies', () => {
    it('should return a copy of activeLayers', () => {
      const view = SavedView.create(validProps)
      const layers = view.state.activeLayers
      layers.push('workflows')
      expect(view.state.activeLayers).toEqual(['organization'])
    })

    it('should return a copy of nodeTypeFilter', () => {
      const view = SavedView.create({
        ...validProps,
        state: { activeLayers: ['organization'], nodeTypeFilter: ['department'], statusFilter: null },
      })
      const filter = view.state.nodeTypeFilter!
      filter.push('role')
      expect(view.state.nodeTypeFilter).toEqual(['department'])
    })
  })
})
