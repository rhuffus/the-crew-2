import { describe, it, expect } from 'vitest'
import {
  resolvePermissions,
  hasPermission,
  hasAnyPermission,
  buildManifest,
  ROLE_PERMISSIONS,
  type PermissionManifest,
  type ProjectRole,
} from '@the-crew/shared-types'

describe('Permission resolver', () => {
  describe('ROLE_PERMISSIONS', () => {
    it('should define permissions for all 4 project roles', () => {
      const roles: ProjectRole[] = ['project:viewer', 'project:commenter', 'project:editor', 'project:admin']
      for (const role of roles) {
        expect(ROLE_PERMISSIONS[role]).toBeDefined()
        expect(ROLE_PERMISSIONS[role].length).toBeGreaterThan(0)
      }
    })

    it('viewer has read-only canvas permissions', () => {
      const perms = ROLE_PERMISSIONS['project:viewer']
      expect(perms).toContain('canvas:drilldown')
      expect(perms).toContain('canvas:select')
      expect(perms).toContain('canvas:zoom')
      expect(perms).not.toContain('canvas:node:create')
      expect(perms).not.toContain('canvas:node:edit')
    })

    it('commenter inherits viewer + has chat write', () => {
      const perms = ROLE_PERMISSIONS['project:commenter']
      expect(perms).toContain('canvas:drilldown')
      expect(perms).toContain('chat:write:company')
      expect(perms).toContain('chat:write:department')
      expect(perms).toContain('chat:write:node')
      expect(perms).not.toContain('canvas:node:create')
    })

    it('editor inherits commenter + has edit permissions', () => {
      const perms = ROLE_PERMISSIONS['project:editor']
      expect(perms).toContain('canvas:node:create')
      expect(perms).toContain('canvas:node:edit')
      expect(perms).toContain('canvas:node:delete')
      expect(perms).toContain('canvas:node:move')
      expect(perms).toContain('canvas:edge:create')
      expect(perms).toContain('canvas:edge:delete')
      expect(perms).toContain('canvas:layout:auto')
      expect(perms).toContain('canvas:layout:save')
      expect(perms).toContain('chat:write:company')
    })

    it('admin inherits editor + has admin permissions', () => {
      const perms = ROLE_PERMISSIONS['project:admin']
      expect(perms).toContain('canvas:node:create')
      expect(perms).toContain('project:members:manage')
      expect(perms).toContain('release:publish')
      expect(perms).toContain('release:delete')
      expect(perms).toContain('chat:delete:any')
      expect(perms).toContain('chat:export')
    })
  })

  describe('resolvePermissions', () => {
    it('returns array of permissions for a given role', () => {
      const perms = resolvePermissions('project:editor')
      expect(Array.isArray(perms)).toBe(true)
      expect(perms).toContain('canvas:node:create')
    })

    it('returns a new array (not a reference)', () => {
      const a = resolvePermissions('project:viewer')
      const b = resolvePermissions('project:viewer')
      expect(a).not.toBe(b)
      expect(a).toEqual(b)
    })
  })

  describe('hasPermission', () => {
    it('returns true when permission exists', () => {
      const manifest: PermissionManifest = {
        platformRole: null,
        projectRole: 'project:editor',
        permissions: ['canvas:node:create', 'canvas:node:edit'],
      }
      expect(hasPermission(manifest, 'canvas:node:create')).toBe(true)
    })

    it('returns false when permission does not exist', () => {
      const manifest: PermissionManifest = {
        platformRole: null,
        projectRole: 'project:viewer',
        permissions: ['canvas:select'],
      }
      expect(hasPermission(manifest, 'canvas:node:create')).toBe(false)
    })
  })

  describe('hasAnyPermission', () => {
    it('returns true if any permission matches', () => {
      const manifest: PermissionManifest = {
        platformRole: null,
        projectRole: 'project:viewer',
        permissions: ['canvas:select', 'canvas:zoom'],
      }
      expect(hasAnyPermission(manifest, ['canvas:node:create', 'canvas:select'])).toBe(true)
    })

    it('returns false if no permission matches', () => {
      const manifest: PermissionManifest = {
        platformRole: null,
        projectRole: 'project:viewer',
        permissions: ['canvas:select'],
      }
      expect(hasAnyPermission(manifest, ['canvas:node:create', 'canvas:node:edit'])).toBe(false)
    })
  })

  describe('buildManifest', () => {
    it('builds a complete manifest for a role', () => {
      const manifest = buildManifest('project:editor', 'platform:member')
      expect(manifest.projectRole).toBe('project:editor')
      expect(manifest.platformRole).toBe('platform:member')
      expect(manifest.permissions).toContain('canvas:node:create')
      expect(manifest.permissions).toContain('canvas:select')
    })

    it('defaults platform role to null', () => {
      const manifest = buildManifest('project:viewer')
      expect(manifest.platformRole).toBeNull()
    })

    it('admin manifest includes all permissions', () => {
      const manifest = buildManifest('project:admin')
      expect(manifest.permissions).toContain('project:members:manage')
      expect(manifest.permissions).toContain('canvas:node:create')
      expect(manifest.permissions).toContain('chat:write:company')
      expect(manifest.permissions).toContain('canvas:select')
    })

    it('viewer manifest excludes editing permissions', () => {
      const manifest = buildManifest('project:viewer')
      expect(manifest.permissions).not.toContain('canvas:node:create')
      expect(manifest.permissions).not.toContain('canvas:node:edit')
      expect(manifest.permissions).not.toContain('canvas:edge:create')
      expect(manifest.permissions).not.toContain('chat:write:company')
    })
  })

  describe('role hierarchy', () => {
    it('each higher role includes all permissions of lower roles', () => {
      const viewerPerms = new Set(ROLE_PERMISSIONS['project:viewer'])
      const commenterPerms = new Set(ROLE_PERMISSIONS['project:commenter'])
      const editorPerms = new Set(ROLE_PERMISSIONS['project:editor'])
      const adminPerms = new Set(ROLE_PERMISSIONS['project:admin'])

      // viewer ⊂ commenter
      for (const p of viewerPerms) {
        expect(commenterPerms.has(p)).toBe(true)
      }

      // commenter ⊂ editor
      for (const p of commenterPerms) {
        expect(editorPerms.has(p)).toBe(true)
      }

      // editor ⊂ admin
      for (const p of editorPerms) {
        expect(adminPerms.has(p)).toBe(true)
      }
    })

    it('admin has strictly more permissions than editor', () => {
      expect(ROLE_PERMISSIONS['project:admin'].length).toBeGreaterThan(
        ROLE_PERMISSIONS['project:editor'].length,
      )
    })
  })
})
