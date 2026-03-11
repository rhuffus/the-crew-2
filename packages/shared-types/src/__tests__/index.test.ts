import { describe, it, expect } from 'vitest'
import {
  VERTICALER_PROJECT_ID,
  VERTICALER_PROJECT_NAME,
  VERTICALER_PROJECT_DESCRIPTION,
  SCOPE_REGISTRY,
  getScopeDefinition,
  isDrillableScopeType,
  getZoomLevelForScope,
  scopeTypeFromZoomLevel,
  CONNECTION_RULES,
  LAYER_DEFINITIONS,
  ROLE_PERMISSIONS,
  resolvePermissions,
  hasPermission,
  hasAnyPermission,
  buildManifest,
  VIEW_PRESET_REGISTRY,
} from '../index.js'

// ---------------------------------------------------------------------------
// Verticaler Constants
// ---------------------------------------------------------------------------

describe('Verticaler Constants', () => {
  it('exports a deterministic project ID', () => {
    expect(VERTICALER_PROJECT_ID).toBe('verticaler-0000-0000-0000-000000000000')
  })

  it('exports the project name', () => {
    expect(VERTICALER_PROJECT_NAME).toBe('Verticaler')
  })

  it('exports a non-empty project description', () => {
    expect(VERTICALER_PROJECT_DESCRIPTION).toBeTruthy()
    expect(typeof VERTICALER_PROJECT_DESCRIPTION).toBe('string')
  })
})

// ---------------------------------------------------------------------------
// SCOPE_REGISTRY
// ---------------------------------------------------------------------------

describe('SCOPE_REGISTRY', () => {
  it('has entries for all 4 scope types', () => {
    expect(Object.keys(SCOPE_REGISTRY)).toHaveLength(4)
    expect(SCOPE_REGISTRY).toHaveProperty('company')
    expect(SCOPE_REGISTRY).toHaveProperty('department')
    expect(SCOPE_REGISTRY).toHaveProperty('workflow')
    expect(SCOPE_REGISTRY).toHaveProperty('workflow-stage')
  })

  it('company scope has correct key properties', () => {
    const def = SCOPE_REGISTRY['company']
    expect(def.zoomLevel).toBe('L1')
    expect(def.requiresEntityId).toBe(false)
    expect(def.defaultLayers).toContain('organization')
  })

  it('department scope requires an entityId and is at L2', () => {
    const def = SCOPE_REGISTRY['department']
    expect(def.zoomLevel).toBe('L2')
    expect(def.requiresEntityId).toBe(true)
    expect(def.defaultLayers).toEqual(expect.arrayContaining(['organization', 'capabilities']))
  })

  it('workflow scope is at L3 and requires entityId', () => {
    const def = SCOPE_REGISTRY['workflow']
    expect(def.zoomLevel).toBe('L3')
    expect(def.requiresEntityId).toBe(true)
    expect(def.defaultLayers).toContain('workflows')
  })

  it('workflow-stage scope is at L4 with no drillable children', () => {
    const def = SCOPE_REGISTRY['workflow-stage']
    expect(def.zoomLevel).toBe('L4')
    expect(def.requiresEntityId).toBe(true)
    expect(def.drillableChildScopes).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// getScopeDefinition
// ---------------------------------------------------------------------------

describe('getScopeDefinition()', () => {
  it('returns the correct definition for company', () => {
    const def = getScopeDefinition('company')
    expect(def.scopeType).toBe('company')
    expect(def.rootNodeType).toBe('company')
    expect(def.label).toBe('Organization')
  })

  it('returns the correct definition for department', () => {
    const def = getScopeDefinition('department')
    expect(def.scopeType).toBe('department')
    expect(def.rootNodeType).toBe('department')
  })

  it('returns the correct definition for workflow', () => {
    const def = getScopeDefinition('workflow')
    expect(def.scopeType).toBe('workflow')
    expect(def.rootNodeType).toBe('workflow')
  })

  it('returns the correct definition for workflow-stage', () => {
    const def = getScopeDefinition('workflow-stage')
    expect(def.scopeType).toBe('workflow-stage')
    expect(def.rootNodeType).toBe('workflow-stage')
    expect(def.label).toBe('Stage')
  })
})

// ---------------------------------------------------------------------------
// isDrillableScopeType
// ---------------------------------------------------------------------------

describe('isDrillableScopeType()', () => {
  it('returns true for all 4 drillable scope root node types', () => {
    expect(isDrillableScopeType('company')).toBe(true)
    expect(isDrillableScopeType('department')).toBe(true)
    expect(isDrillableScopeType('workflow')).toBe(true)
    expect(isDrillableScopeType('workflow-stage')).toBe(true)
  })

  it('returns false for non-drillable node types', () => {
    expect(isDrillableScopeType('role')).toBe(false)
    expect(isDrillableScopeType('capability')).toBe(false)
    expect(isDrillableScopeType('artifact')).toBe(false)
    expect(isDrillableScopeType('policy')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// getZoomLevelForScope
// ---------------------------------------------------------------------------

describe('getZoomLevelForScope()', () => {
  it('returns L1 for company', () => {
    expect(getZoomLevelForScope('company')).toBe('L1')
  })

  it('returns L2 for department', () => {
    expect(getZoomLevelForScope('department')).toBe('L2')
  })

  it('returns L3 for workflow', () => {
    expect(getZoomLevelForScope('workflow')).toBe('L3')
  })

  it('returns L4 for workflow-stage', () => {
    expect(getZoomLevelForScope('workflow-stage')).toBe('L4')
  })
})

// ---------------------------------------------------------------------------
// scopeTypeFromZoomLevel
// ---------------------------------------------------------------------------

describe('scopeTypeFromZoomLevel()', () => {
  it('maps L1 to company', () => {
    expect(scopeTypeFromZoomLevel('L1')).toBe('company')
  })

  it('maps L2 to department', () => {
    expect(scopeTypeFromZoomLevel('L2')).toBe('department')
  })

  it('maps L3 to workflow', () => {
    expect(scopeTypeFromZoomLevel('L3')).toBe('workflow')
  })

  it('maps L4 to workflow-stage', () => {
    expect(scopeTypeFromZoomLevel('L4')).toBe('workflow-stage')
  })

  it('is the inverse of getZoomLevelForScope', () => {
    const scopes = ['company', 'department', 'workflow', 'workflow-stage'] as const
    for (const scope of scopes) {
      expect(scopeTypeFromZoomLevel(getZoomLevelForScope(scope))).toBe(scope)
    }
  })
})

// ---------------------------------------------------------------------------
// CONNECTION_RULES
// ---------------------------------------------------------------------------

describe('CONNECTION_RULES', () => {
  it('has exactly 15 rules', () => {
    expect(CONNECTION_RULES).toHaveLength(15)
  })

  it('includes a reports_to rule for department → department', () => {
    const rule = CONNECTION_RULES.find(r => r.edgeType === 'reports_to')
    expect(rule).toBeDefined()
    expect(rule!.sourceTypes).toContain('department')
    expect(rule!.targetTypes).toContain('department')
    expect(rule!.category).toBe('hierarchical')
    expect(rule!.style).toBe('solid')
  })

  it('includes an assigned_to rule for agent-archetype → role', () => {
    const rule = CONNECTION_RULES.find(r => r.edgeType === 'assigned_to')
    expect(rule).toBeDefined()
    expect(rule!.sourceTypes).toContain('agent-archetype')
    expect(rule!.targetTypes).toContain('role')
    expect(rule!.category).toBe('assignment')
    expect(rule!.style).toBe('dashed')
  })

  it('includes a hands_off_to rule for workflow-stage → workflow-stage', () => {
    const rule = CONNECTION_RULES.find(r => r.edgeType === 'hands_off_to')
    expect(rule).toBeDefined()
    expect(rule!.sourceTypes).toContain('workflow-stage')
    expect(rule!.targetTypes).toContain('workflow-stage')
    expect(rule!.category).toBe('workflow')
  })

  it('includes governs rule in the governance category', () => {
    const rule = CONNECTION_RULES.find(r => r.edgeType === 'governs')
    expect(rule).toBeDefined()
    expect(rule!.category).toBe('governance')
    expect(rule!.sourceTypes).toContain('policy')
  })
})

// ---------------------------------------------------------------------------
// LAYER_DEFINITIONS
// ---------------------------------------------------------------------------

describe('LAYER_DEFINITIONS', () => {
  it('has exactly 7 layers', () => {
    expect(LAYER_DEFINITIONS).toHaveLength(7)
  })

  it('each layer has required id, nodeTypes and edgeTypes fields', () => {
    for (const layer of LAYER_DEFINITIONS) {
      expect(layer).toHaveProperty('id')
      expect(layer).toHaveProperty('label')
      expect(layer).toHaveProperty('nodeTypes')
      expect(layer).toHaveProperty('edgeTypes')
      expect(Array.isArray(layer.nodeTypes)).toBe(true)
      expect(Array.isArray(layer.edgeTypes)).toBe(true)
    }
  })

  it('organization layer contains expected node types', () => {
    const layer = LAYER_DEFINITIONS.find(l => l.id === 'organization')
    expect(layer).toBeDefined()
    expect(layer!.nodeTypes).toEqual(
      expect.arrayContaining(['company', 'department', 'role', 'agent-archetype', 'agent-assignment']),
    )
    expect(layer!.edgeTypes).toEqual(expect.arrayContaining(['reports_to', 'assigned_to']))
  })

  it('capabilities layer includes capability and skill node types', () => {
    const layer = LAYER_DEFINITIONS.find(l => l.id === 'capabilities')
    expect(layer).toBeDefined()
    expect(layer!.nodeTypes).toContain('capability')
    expect(layer!.nodeTypes).toContain('skill')
  })

  it('workflows layer contains workflow and workflow-stage', () => {
    const layer = LAYER_DEFINITIONS.find(l => l.id === 'workflows')
    expect(layer).toBeDefined()
    expect(layer!.nodeTypes).toContain('workflow')
    expect(layer!.nodeTypes).toContain('workflow-stage')
  })

  it('governance layer contains policy node type', () => {
    const layer = LAYER_DEFINITIONS.find(l => l.id === 'governance')
    expect(layer).toBeDefined()
    expect(layer!.nodeTypes).toContain('policy')
    expect(layer!.edgeTypes).toContain('governs')
  })

  it('operations layer exists and is defined', () => {
    const layer = LAYER_DEFINITIONS.find(l => l.id === 'operations')
    expect(layer).toBeDefined()
    expect(layer!.label).toBe('Operations')
  })
})

// ---------------------------------------------------------------------------
// ROLE_PERMISSIONS
// ---------------------------------------------------------------------------

describe('ROLE_PERMISSIONS', () => {
  it('viewer has the fewest permissions', () => {
    const viewer = ROLE_PERMISSIONS['project:viewer']
    const commenter = ROLE_PERMISSIONS['project:commenter']
    const editor = ROLE_PERMISSIONS['project:editor']
    const admin = ROLE_PERMISSIONS['project:admin']

    expect(viewer.length).toBeLessThan(commenter.length)
    expect(commenter.length).toBeLessThan(editor.length)
    expect(editor.length).toBeLessThan(admin.length)
  })

  it('viewer has project:view permission', () => {
    expect(ROLE_PERMISSIONS['project:viewer']).toContain('project:view')
  })

  it('viewer does NOT have editing permissions', () => {
    const viewer = ROLE_PERMISSIONS['project:viewer']
    expect(viewer).not.toContain('canvas:node:create')
    expect(viewer).not.toContain('model:department:create')
  })

  it('commenter has chat:write permissions but not canvas edit permissions', () => {
    const commenter = ROLE_PERMISSIONS['project:commenter']
    expect(commenter).toContain('chat:write:company')
    expect(commenter).toContain('comment:create')
    expect(commenter).not.toContain('canvas:node:create')
  })

  it('editor has canvas editing and model permissions', () => {
    const editor = ROLE_PERMISSIONS['project:editor']
    expect(editor).toContain('canvas:node:create')
    expect(editor).toContain('canvas:node:edit')
    expect(editor).toContain('canvas:node:delete')
    expect(editor).toContain('model:department:create')
    expect(editor).toContain('release:create')
  })

  it('admin has project management permissions that editor lacks', () => {
    const admin = ROLE_PERMISSIONS['project:admin']
    const editor = ROLE_PERMISSIONS['project:editor']
    expect(admin).toContain('project:members:manage')
    expect(admin).toContain('release:publish')
    expect(admin).toContain('project:delete')
    expect(editor).not.toContain('project:members:manage')
    expect(editor).not.toContain('release:publish')
  })

  it('higher roles inherit all permissions of lower roles', () => {
    const viewer = ROLE_PERMISSIONS['project:viewer']
    const admin = ROLE_PERMISSIONS['project:admin']
    for (const p of viewer) {
      expect(admin).toContain(p)
    }
  })
})

// ---------------------------------------------------------------------------
// resolvePermissions
// ---------------------------------------------------------------------------

describe('resolvePermissions()', () => {
  it('returns a mutable copy of the viewer permissions array', () => {
    const perms = resolvePermissions('project:viewer')
    expect(Array.isArray(perms)).toBe(true)
    expect(perms).toContain('project:view')
  })

  it('returns correct permissions for each role', () => {
    for (const role of ['project:viewer', 'project:commenter', 'project:editor', 'project:admin'] as const) {
      const perms = resolvePermissions(role)
      expect(perms).toEqual([...ROLE_PERMISSIONS[role]])
    }
  })
})

// ---------------------------------------------------------------------------
// hasPermission
// ---------------------------------------------------------------------------

describe('hasPermission()', () => {
  it('returns true when the permission is in the manifest', () => {
    const manifest = buildManifest('project:viewer')
    expect(hasPermission(manifest, 'project:view')).toBe(true)
  })

  it('returns false when the permission is not in the manifest', () => {
    const manifest = buildManifest('project:viewer')
    expect(hasPermission(manifest, 'canvas:node:create')).toBe(false)
  })

  it('editor manifest has canvas:node:create', () => {
    const manifest = buildManifest('project:editor')
    expect(hasPermission(manifest, 'canvas:node:create')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// hasAnyPermission
// ---------------------------------------------------------------------------

describe('hasAnyPermission()', () => {
  it('returns true when at least one permission matches', () => {
    const manifest = buildManifest('project:viewer')
    expect(hasAnyPermission(manifest, ['canvas:node:create', 'project:view'])).toBe(true)
  })

  it('returns false when none of the permissions match', () => {
    const manifest = buildManifest('project:viewer')
    expect(hasAnyPermission(manifest, ['canvas:node:create', 'model:department:create'])).toBe(false)
  })

  it('returns false for an empty permissions list', () => {
    const manifest = buildManifest('project:admin')
    expect(hasAnyPermission(manifest, [])).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// buildManifest
// ---------------------------------------------------------------------------

describe('buildManifest()', () => {
  it('builds a manifest with the correct projectRole and permissions', () => {
    const manifest = buildManifest('project:editor')
    expect(manifest.projectRole).toBe('project:editor')
    expect(manifest.platformRole).toBeNull()
    expect(manifest.permissions).toEqual(resolvePermissions('project:editor'))
  })

  it('accepts an optional platformRole', () => {
    const manifest = buildManifest('project:admin', 'platform:owner')
    expect(manifest.platformRole).toBe('platform:owner')
    expect(manifest.projectRole).toBe('project:admin')
  })

  it('permissions array contains all viewer base permissions for any role', () => {
    const viewerPerms = resolvePermissions('project:viewer')
    const adminManifest = buildManifest('project:admin')
    for (const p of viewerPerms) {
      expect(adminManifest.permissions).toContain(p)
    }
  })
})

// ---------------------------------------------------------------------------
// VIEW_PRESET_REGISTRY
// ---------------------------------------------------------------------------

describe('VIEW_PRESET_REGISTRY', () => {
  const PRESET_IDS = [
    'organization',
    'capabilities',
    'workflows',
    'contracts',
    'artifact-flow',
    'governance',
    'operations',
  ] as const

  it('has exactly 7 presets', () => {
    expect(Object.keys(VIEW_PRESET_REGISTRY)).toHaveLength(7)
  })

  it('contains all expected preset ids', () => {
    for (const id of PRESET_IDS) {
      expect(VIEW_PRESET_REGISTRY).toHaveProperty(id)
    }
  })

  it('each preset has required fields', () => {
    for (const id of PRESET_IDS) {
      const preset = VIEW_PRESET_REGISTRY[id]
      expect(preset).toHaveProperty('id')
      expect(preset).toHaveProperty('label')
      expect(preset).toHaveProperty('description')
      expect(preset).toHaveProperty('icon')
      expect(preset).toHaveProperty('layers')
      expect(preset).toHaveProperty('availableAtScopes')
      expect(typeof preset.label).toBe('string')
      expect(typeof preset.description).toBe('string')
      expect(Array.isArray(preset.layers)).toBe(true)
      expect(Array.isArray(preset.availableAtScopes)).toBe(true)
    }
  })

  it('organization preset is available at company and department scopes', () => {
    const preset = VIEW_PRESET_REGISTRY['organization']
    expect(preset.availableAtScopes).toContain('company')
    expect(preset.availableAtScopes).toContain('department')
  })

  it('artifact-flow preset requires the artifacts layer', () => {
    const preset = VIEW_PRESET_REGISTRY['artifact-flow']
    expect(preset.requiresLayer).toBe('artifacts')
    expect(preset.layers).toContain('artifacts')
  })

  it('operations preset requires the operations layer', () => {
    const preset = VIEW_PRESET_REGISTRY['operations']
    expect(preset.requiresLayer).toBe('operations')
    expect(preset.layers).toContain('operations')
  })

  it('workflows preset is available at all 4 scope types', () => {
    const preset = VIEW_PRESET_REGISTRY['workflows']
    expect(preset.availableAtScopes).toContain('company')
    expect(preset.availableAtScopes).toContain('department')
    expect(preset.availableAtScopes).toContain('workflow')
    expect(preset.availableAtScopes).toContain('workflow-stage')
  })
})
