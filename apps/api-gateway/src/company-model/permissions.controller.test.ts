import { describe, it, expect } from 'vitest'
import { PermissionsController } from './permissions.controller'

describe('PermissionsController', () => {
  const controller = new PermissionsController()

  it('should return a permission manifest', () => {
    const result = controller.getPermissions('project-1')
    expect(result).toBeDefined()
    expect(result.projectRole).toBe('project:editor')
    expect(result.platformRole).toBe('platform:member')
    expect(result.permissions).toBeInstanceOf(Array)
  })

  it('should include editor-level canvas permissions', () => {
    const result = controller.getPermissions('project-1')
    expect(result.permissions).toContain('canvas:node:create')
    expect(result.permissions).toContain('canvas:node:edit')
    expect(result.permissions).toContain('canvas:node:delete')
    expect(result.permissions).toContain('canvas:edge:create')
  })

  it('should include viewer permissions (inherited)', () => {
    const result = controller.getPermissions('project-1')
    expect(result.permissions).toContain('project:view')
    expect(result.permissions).toContain('canvas:drilldown')
    expect(result.permissions).toContain('canvas:select')
    expect(result.permissions).toContain('chat:read')
  })

  it('should include commenter permissions (inherited)', () => {
    const result = controller.getPermissions('project-1')
    expect(result.permissions).toContain('chat:write:company')
    expect(result.permissions).toContain('chat:write:department')
    expect(result.permissions).toContain('chat:write:node')
  })

  it('should NOT include admin-only permissions', () => {
    const result = controller.getPermissions('project-1')
    expect(result.permissions).not.toContain('project:members:manage')
    expect(result.permissions).not.toContain('release:publish')
    expect(result.permissions).not.toContain('chat:delete:any')
  })
})
