# Permissions Model v1 — Formal Specification

Epic 34 | VIS-017 | Plan deliverable

## 1. Purpose

This document specifies the permissions model for TheCrew, reframed for the visual-first product. Permissions must govern:

1. **Platform access** — who can sign in and manage projects
2. **Project access** — who can view/edit which projects
3. **Canvas actions** — who can create, edit, move, delete, connect, and drilldown on the canvas
4. **Chat scopes** — who can read/write in different chat contexts (company, department, node)
5. **Admin actions** — who can access CRUD admin views and system-level operations

The model is designed to be simple enough for v1 while being extensible for future multi-tenant and team use cases.

---

## 2. Design Principles

1. **RBAC with scoped assignments.** Roles are assigned per project, not globally (except platform-level roles). This is simpler than ABAC and sufficient for v1.
2. **Deny by default.** If no explicit permission exists, access is denied.
3. **Permissions are checked server-side.** The client receives a permission manifest that drives UI visibility, but the backend enforces.
4. **Canvas visibility is not filtered by permissions.** If a user can view a project, they see the full graph. Permissions control **actions**, not **visibility** of entities. This avoids complex partial-graph projections and keeps the visual experience coherent.
5. **Least surprise.** A viewer can see everything but change nothing. An editor can modify the model. An admin can manage access.

---

## 3. Role Hierarchy

### 3.1 Platform Roles

| Role | Scope | Description |
|------|-------|-------------|
| `platform:owner` | Platform | Full control. Manages platform settings, creates projects, manages users. |
| `platform:member` | Platform | Can sign in. Can access projects they're assigned to. Cannot create projects. |

### 3.2 Project Roles

| Role | Scope | Description |
|------|-------|-------------|
| `project:admin` | Project | Full project control. Manages project members, publishes releases, accesses admin views. |
| `project:editor` | Project | Can modify the company model via canvas and inspector. Can create/edit/delete entities and edges. |
| `project:viewer` | Project | Read-only access. Can view canvas, drilldown, inspect nodes. Cannot modify anything. |
| `project:commenter` | Project | Same as viewer, plus can write in chat scopes. |

### 3.3 Role inheritance

```
platform:owner
  └─ inherits all project:admin for every project

project:admin
  └─ inherits project:editor
      └─ inherits project:commenter
          └─ inherits project:viewer
```

Each role inherits all permissions of the roles below it.

---

## 4. Permission Catalog

### 4.1 Platform permissions

| Permission | Description | Roles |
|------------|-------------|-------|
| `platform:projects:create` | Create new projects | owner |
| `platform:projects:list` | List all projects | owner |
| `platform:users:manage` | Invite/remove platform users | owner |
| `platform:settings:edit` | Modify platform-level settings | owner |

### 4.2 Project access permissions

| Permission | Description | Roles |
|------------|-------------|-------|
| `project:view` | View project (canvas, inspector, explorer, admin) | viewer, commenter, editor, admin |
| `project:members:manage` | Add/remove project members, change roles | admin |
| `project:settings:edit` | Modify project settings | admin |
| `project:delete` | Delete the project | admin |

### 4.3 Canvas action permissions

| Permission | Description | Roles |
|------------|-------------|-------|
| `canvas:node:create` | Create a new entity via canvas or inspector | editor |
| `canvas:node:edit` | Edit node properties via inspector | editor |
| `canvas:node:delete` | Delete an entity via canvas or inspector | editor |
| `canvas:node:move` | Move a node's position on canvas | editor |
| `canvas:edge:create` | Create a new edge (relationship) on canvas | editor |
| `canvas:edge:edit` | Edit edge properties via inspector | editor |
| `canvas:edge:delete` | Delete an edge on canvas | editor |
| `canvas:drilldown` | Navigate into department/workflow scopes | viewer |
| `canvas:select` | Select nodes/edges to inspect | viewer |
| `canvas:zoom` | Zoom/pan on canvas | viewer |
| `canvas:layers:toggle` | Toggle visual layers | viewer |
| `canvas:layout:auto` | Trigger auto-layout | editor |
| `canvas:layout:save` | Save layout positions | editor |

### 4.4 Model mutation permissions

| Permission | Description | Roles |
|------------|-------------|-------|
| `model:company:edit` | Edit company model (purpose, type, principles) | editor |
| `model:department:create` | Create department | editor |
| `model:department:edit` | Edit department | editor |
| `model:department:delete` | Delete department | editor |
| `model:role:create` | Create role | editor |
| `model:role:edit` | Edit role | editor |
| `model:role:delete` | Delete role | editor |
| `model:capability:*` | Create/edit/delete capability | editor |
| `model:workflow:*` | Create/edit/delete workflow | editor |
| `model:contract:*` | Create/edit/delete contract | editor |
| `model:policy:*` | Create/edit/delete policy | editor |
| `model:agent-archetype:*` | Create/edit/delete agent archetype | editor |
| `model:agent-assignment:*` | Create/edit/delete agent assignment | editor |
| `model:skill:*` | Create/edit/delete skill | editor |

**Note:** The wildcard `*` expands to `create`, `edit`, `delete`. All entity types share the same permission level (editor) in v1. Per-entity-type differentiation is deferred to v2.

### 4.5 Release permissions

| Permission | Description | Roles |
|------------|-------------|-------|
| `release:create` | Create draft release | editor |
| `release:edit` | Edit release metadata | editor |
| `release:publish` | Publish a release (freezes snapshot) | admin |
| `release:delete` | Delete a release | admin |
| `release:diff:view` | View diff between releases | viewer |

### 4.6 Chat permissions

| Permission | Description | Roles |
|------------|-------------|-------|
| `chat:read` | Read messages in any chat scope | viewer |
| `chat:write:company` | Write in company-level chat | commenter |
| `chat:write:department` | Write in department-scoped chat | commenter |
| `chat:write:node` | Write in node-scoped chat | commenter |
| `chat:delete:own` | Delete own messages | commenter |
| `chat:delete:any` | Delete any message (moderation) | admin |
| `chat:export` | Export chat history | admin |

### 4.7 Admin view permissions

| Permission | Description | Roles |
|------------|-------------|-------|
| `admin:view` | Access admin CRUD views | viewer |
| `admin:audit:view` | View audit trail | viewer |
| `admin:validation:view` | View validation panel | viewer |
| `admin:validation:run` | Trigger re-validation | editor |

---

## 5. Permission Manifest

### 5.1 Server → Client contract

When a user accesses a project, the API returns a permission manifest alongside the project data. The client uses this to conditionally render UI elements.

```typescript
export interface PermissionManifest {
  platformRole: PlatformRole | null
  projectRole: ProjectRole | null
  permissions: string[]    // flat list of permission strings
}

export type PlatformRole = 'platform:owner' | 'platform:member'
export type ProjectRole = 'project:admin' | 'project:editor' | 'project:commenter' | 'project:viewer'
```

### 5.2 Endpoint

```
GET /projects/:projectId/permissions
```

**Response:**

```json
{
  "platformRole": "platform:member",
  "projectRole": "project:editor",
  "permissions": [
    "project:view",
    "canvas:node:create",
    "canvas:node:edit",
    "canvas:node:delete",
    "canvas:node:move",
    "canvas:edge:create",
    "canvas:edge:edit",
    "canvas:edge:delete",
    "canvas:drilldown",
    "canvas:select",
    "canvas:zoom",
    "canvas:layers:toggle",
    "canvas:layout:auto",
    "canvas:layout:save",
    "model:company:edit",
    "model:department:create",
    "model:department:edit",
    "model:department:delete",
    "chat:read",
    "chat:write:company",
    "chat:write:department",
    "chat:write:node",
    "chat:delete:own",
    "release:create",
    "release:edit",
    "release:diff:view",
    "admin:view",
    "admin:audit:view",
    "admin:validation:view",
    "admin:validation:run"
  ]
}
```

### 5.3 Client-side check helper

```typescript
// packages/shared-types
export function hasPermission(manifest: PermissionManifest, permission: string): boolean {
  return manifest.permissions.includes(permission)
}

export function hasAnyPermission(manifest: PermissionManifest, permissions: string[]): boolean {
  return permissions.some(p => manifest.permissions.includes(p))
}
```

### 5.4 React hook

```typescript
// apps/web
function usePermission(permission: string): boolean {
  const manifest = usePermissionManifest()  // from context or query
  return hasPermission(manifest, permission)
}
```

---

## 6. UI Behavior per Role

### 6.1 Canvas behavior

| Behavior | viewer | commenter | editor | admin |
|----------|--------|-----------|--------|-------|
| View canvas, zoom, pan | Yes | Yes | Yes | Yes |
| Select nodes/edges | Yes | Yes | Yes | Yes |
| Drilldown into scopes | Yes | Yes | Yes | Yes |
| Toggle layers | Yes | Yes | Yes | Yes |
| Move nodes | No | No | Yes | Yes |
| Create nodes (from canvas) | No | No | Yes | Yes |
| Delete nodes (from canvas) | No | No | Yes | Yes |
| Create edges (drag handles) | No | No | Yes | Yes |
| Delete edges | No | No | Yes | Yes |
| Auto-layout | No | No | Yes | Yes |
| Save layout | No | No | Yes | Yes |

**UI implications for viewer/commenter:**
- Node drag handles are hidden
- Edge connection handles are hidden
- Delete action is hidden from context menus
- Inspector shows properties as read-only (no inline edit)
- Canvas toolbar hides "Auto Layout" and "Save Layout" buttons
- Context menu shows only "Inspect" and "Drilldown" (for scope nodes)

### 6.2 Inspector behavior

| Behavior | viewer | commenter | editor | admin |
|----------|--------|-----------|--------|-------|
| View overview | Yes | Yes | Yes | Yes |
| View properties | Yes | Yes | Yes | Yes |
| Edit properties inline | No | No | Yes | Yes |
| View relations | Yes | Yes | Yes | Yes |
| Create relation (add edge) | No | No | Yes | Yes |
| View validation | Yes | Yes | Yes | Yes |
| Run validation | No | No | Yes | Yes |
| View history/audit | Yes | Yes | Yes | Yes |
| View chat tab | Yes | Yes | Yes | Yes |
| Write in chat tab | No | Yes | Yes | Yes |

### 6.3 Explorer behavior

| Behavior | viewer | commenter | editor | admin |
|----------|--------|-----------|--------|-------|
| Browse entity tree | Yes | Yes | Yes | Yes |
| Toggle layers | Yes | Yes | Yes | Yes |
| View validation summary | Yes | Yes | Yes | Yes |
| Click to navigate | Yes | Yes | Yes | Yes |
| Create entity from tree | No | No | Yes | Yes |
| Delete entity from tree | No | No | Yes | Yes |

### 6.4 Chat dock behavior

| Behavior | viewer | commenter | editor | admin |
|----------|--------|-----------|--------|-------|
| View chat dock | Yes | Yes | Yes | Yes |
| Read messages | Yes | Yes | Yes | Yes |
| Send messages | No | Yes | Yes | Yes |
| Delete own messages | No | Yes | Yes | Yes |
| Delete any message | No | No | No | Yes |
| Export chat | No | No | No | Yes |

### 6.5 TopBar behavior

| Behavior | viewer | commenter | editor | admin |
|----------|--------|-----------|--------|-------|
| View breadcrumb | Yes | Yes | Yes | Yes |
| Navigate breadcrumb | Yes | Yes | Yes | Yes |
| View release badge | Yes | Yes | Yes | Yes |
| Switch Visual/Admin | Yes | Yes | Yes | Yes |
| Publish release | No | No | No | Yes |

### 6.6 Admin views behavior

| Behavior | viewer | commenter | editor | admin |
|----------|--------|-----------|--------|-------|
| View admin lists | Yes | Yes | Yes | Yes |
| Create/edit/delete entities | No | No | Yes | Yes |
| View audit | Yes | Yes | Yes | Yes |
| View validations | Yes | Yes | Yes | Yes |
| Run validation | No | No | Yes | Yes |
| Manage project members | No | No | No | Yes |

---

## 7. Backend Architecture

### 7.1 Module structure

```
services/platform/src/
  auth/
    auth.module.ts                  # NestJS module
    domain/
      user.ts                       # User aggregate
      platform-membership.ts        # Platform role assignment
      project-membership.ts         # Project role assignment
    application/
      auth.service.ts               # Authentication (login, token)
      membership.service.ts         # Role assignment CRUD
      permission.resolver.ts        # Role → permissions expansion
    infrastructure/
      user.repository.ts            # User persistence
      membership.repository.ts      # Membership persistence
      jwt.strategy.ts               # JWT validation
      auth.guard.ts                 # NestJS guard
      permission.guard.ts           # Permission-based guard
    api/
      auth.controller.ts            # Login, register, token refresh
      membership.controller.ts      # Manage project members
      permissions.controller.ts     # GET /projects/:id/permissions
```

### 7.2 Guard usage

```typescript
// Permission guard decorator
@UseGuards(AuthGuard, PermissionGuard)
@RequirePermission('canvas:node:create')
@Post('projects/:projectId/departments')
createDepartment() { ... }

// Or for multiple permissions (any)
@RequireAnyPermission(['model:department:edit', 'model:department:create'])
```

The `PermissionGuard`:
1. Extracts user from JWT token
2. Looks up the user's project membership
3. Resolves the role to a permissions list
4. Checks if the required permission is in the list
5. Returns 403 if not

### 7.3 Role → Permissions resolution

The mapping from role to permissions is a **static lookup table** in `permission.resolver.ts`. No database query needed — roles have fixed permission sets in v1.

```typescript
const ROLE_PERMISSIONS: Record<ProjectRole, string[]> = {
  'project:viewer': [
    'project:view',
    'canvas:drilldown', 'canvas:select', 'canvas:zoom', 'canvas:layers:toggle',
    'chat:read',
    'release:diff:view',
    'admin:view', 'admin:audit:view', 'admin:validation:view',
  ],
  'project:commenter': [
    // inherits viewer +
    'chat:write:company', 'chat:write:department', 'chat:write:node',
    'chat:delete:own',
  ],
  'project:editor': [
    // inherits commenter +
    'canvas:node:create', 'canvas:node:edit', 'canvas:node:delete', 'canvas:node:move',
    'canvas:edge:create', 'canvas:edge:edit', 'canvas:edge:delete',
    'canvas:layout:auto', 'canvas:layout:save',
    'model:company:edit',
    'model:department:create', 'model:department:edit', 'model:department:delete',
    'model:role:create', 'model:role:edit', 'model:role:delete',
    'model:capability:create', 'model:capability:edit', 'model:capability:delete',
    'model:workflow:create', 'model:workflow:edit', 'model:workflow:delete',
    'model:contract:create', 'model:contract:edit', 'model:contract:delete',
    'model:policy:create', 'model:policy:edit', 'model:policy:delete',
    'model:agent-archetype:create', 'model:agent-archetype:edit', 'model:agent-archetype:delete',
    'model:agent-assignment:create', 'model:agent-assignment:edit', 'model:agent-assignment:delete',
    'model:skill:create', 'model:skill:edit', 'model:skill:delete',
    'release:create', 'release:edit',
    'admin:validation:run',
  ],
  'project:admin': [
    // inherits editor +
    'project:members:manage', 'project:settings:edit', 'project:delete',
    'release:publish', 'release:delete',
    'chat:delete:any', 'chat:export',
  ],
}
```

The resolver flattens inherited permissions at resolution time.

### 7.4 User and membership domain

```typescript
// User aggregate (platform service)
interface User {
  id: string
  email: string
  name: string
  passwordHash: string
  platformRole: PlatformRole
  createdAt: Date
  updatedAt: Date
}

// Project membership (platform service)
interface ProjectMembership {
  id: string
  userId: string
  projectId: string
  role: ProjectRole
  invitedBy: string
  createdAt: Date
}
```

### 7.5 JWT token payload

```typescript
interface JwtPayload {
  sub: string           // user ID
  email: string
  platformRole: PlatformRole
  iat: number
  exp: number
}
```

Project role is **not** included in the JWT to avoid stale tokens when roles change. It's resolved per-request from the membership table.

---

## 8. Chat Scope Permissions

### 8.1 Scope hierarchy

```
company (projectId)
  └─ department (departmentId)
  └─ node (entityType:entityId)
```

### 8.2 Permission resolution for chat

| Chat Scope | Read Permission | Write Permission |
|------------|----------------|-----------------|
| Company | `chat:read` | `chat:write:company` |
| Department | `chat:read` | `chat:write:department` |
| Node | `chat:read` | `chat:write:node` |

All chat scopes share the same read permission (`chat:read`). Write permissions are differentiated by scope to allow future fine-grained control (e.g., "can only comment on nodes, not in department chat").

### 8.3 Chat scope context in API

```typescript
interface ChatScope {
  projectId: string
  scopeType: 'company' | 'department' | 'node'
  scopeId: string          // projectId for company, deptId for dept, entityId for node
  entityType?: NodeType    // only for node scope
}
```

Chat API endpoints check both the `chat:read`/`chat:write:*` permission **and** that the user has `project:view` for the given project.

---

## 9. Integration with Visual Shell

### 9.1 Permission provider

```typescript
// apps/web/src/providers/permission-provider.tsx
interface PermissionContextValue {
  manifest: PermissionManifest | null
  loading: boolean
  can: (permission: string) => boolean
  canAny: (permissions: string[]) => boolean
  role: ProjectRole | null
}
```

The `PermissionProvider` wraps the project routes and fetches the permission manifest via `GET /projects/:projectId/permissions`. The manifest is cached by TanStack Query.

### 9.2 Component-level usage

```tsx
// Example: CanvasViewport conditionally enables drag
function CanvasViewport() {
  const canMove = usePermission('canvas:node:move')
  return (
    <ReactFlow
      nodesDraggable={canMove}
      nodesConnectable={usePermission('canvas:edge:create')}
      deleteKeyCode={usePermission('canvas:node:delete') ? 'Delete' : null}
    />
  )
}
```

```tsx
// Example: Inspector read-only mode
function PropertiesTab({ node }) {
  const canEdit = usePermission('canvas:node:edit')
  return canEdit ? <EditableForm node={node} /> : <ReadOnlyView node={node} />
}
```

```tsx
// Example: ChatDock input visibility
function ChatDock({ scope }) {
  const canWrite = usePermission(`chat:write:${scope.scopeType}`)
  return (
    <div>
      <MessageList />
      {canWrite && <MessageInput />}
    </div>
  )
}
```

### 9.3 Guard component

```tsx
// Utility component for permission gating
function PermissionGate({
  permission,
  children,
  fallback = null
}: {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const allowed = usePermission(permission)
  return allowed ? children : fallback
}
```

---

## 10. Shared Types

Add to `packages/shared-types/src/index.ts`:

```typescript
// --- Permission Types ---

export type PlatformRole = 'platform:owner' | 'platform:member'

export type ProjectRole =
  | 'project:admin'
  | 'project:editor'
  | 'project:commenter'
  | 'project:viewer'

export interface PermissionManifest {
  platformRole: PlatformRole | null
  projectRole: ProjectRole | null
  permissions: string[]
}

export interface ProjectMembershipDto {
  id: string
  userId: string
  projectId: string
  role: ProjectRole
  userName: string
  userEmail: string
  createdAt: string
}

export interface ChatScopeDto {
  projectId: string
  scopeType: 'company' | 'department' | 'node'
  scopeId: string
  entityType?: string
}
```

---

## 11. API Endpoints

### 11.1 Authentication

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/auth/register` | Register new user | None |
| `POST` | `/auth/login` | Login, returns JWT | None |
| `POST` | `/auth/refresh` | Refresh JWT token | JWT |
| `GET` | `/auth/me` | Current user info | JWT |

### 11.2 Project membership

| Method | Path | Description | Permission |
|--------|------|-------------|------------|
| `GET` | `/projects/:id/members` | List project members | `project:view` |
| `POST` | `/projects/:id/members` | Add member with role | `project:members:manage` |
| `PATCH` | `/projects/:id/members/:memberId` | Change member role | `project:members:manage` |
| `DELETE` | `/projects/:id/members/:memberId` | Remove member | `project:members:manage` |

### 11.3 Permissions

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/projects/:id/permissions` | Get current user's permission manifest | JWT |

---

## 12. Migration Strategy

### 12.1 Current state

The system currently has **no authentication**. All endpoints are open. This is acceptable for local development but must change before any deployment.

### 12.2 Incremental rollout

| Phase | Scope | Description |
|-------|-------|-------------|
| Phase 1 | Types & interfaces | Add shared types for roles, permissions, manifest. No runtime changes. |
| Phase 2 | Auth module | User registration, login, JWT. No permission enforcement yet. |
| Phase 3 | Membership module | Project membership CRUD. Permission manifest endpoint. |
| Phase 4 | Permission guards | Add guards to all existing controllers. Default: viewer can read, editor can write. |
| Phase 5 | Frontend integration | PermissionProvider, usePermission hook, conditional UI. |
| Phase 6 | Chat permissions | Wire chat scope permissions when VIS-016 chat backend is implemented. |

### 12.3 Dev mode bypass

During development, a `DEV_MODE=true` env variable bypasses all auth guards and returns a manifest with `project:admin` permissions. This preserves the current development experience.

---

## 13. Open Decisions

| # | Decision | Resolution |
|---|----------|------------|
| 1 | Should permissions filter canvas visibility? | **No.** Viewers see the full graph. Permissions control actions, not visibility. Partial-graph filtering would add complexity with little v1 value. |
| 2 | Should roles be scoped per department? | **No for v1.** Project-wide roles are sufficient. Department-scoped roles (e.g., "editor of Marketing only") are deferred to v2. |
| 3 | Should the JWT contain project roles? | **No.** Project role is resolved per-request to avoid stale tokens. Only platform role is in the JWT. |
| 4 | Where does the auth module live? | **platform-service.** Users and memberships are platform-level concerns, not company-design concerns. |
| 5 | Should we use an external auth provider (Auth0, Clerk)? | **Not for v1.** Self-hosted JWT auth keeps the system self-contained. External provider is a v2 option. |
| 6 | How to handle the "commenter" role? | **Distinct role between viewer and editor.** Allows stakeholders to participate in chat without edit access. |
| 7 | Should chat permissions be per-scope-instance (e.g., only Marketing dept chat)? | **No for v1.** Permissions are per scope-type (all departments), not per instance. Instance-level permissions deferred to v2. |

---

## 14. What This Spec Does NOT Cover

| Deferred to | Topic |
|-------------|-------|
| VIS-016 | Chat backend implementation and persistence |
| VIS-018 | Operations/runtime permissions |
| Future | Department-scoped roles (edit only within a department) |
| Future | API key / service-to-service auth |
| Future | External identity providers (OAuth, SAML) |
| Future | Audit of permission changes |
| Future | Team/group abstractions |
| Future | Row-level security / entity ownership |

---

## 15. Acceptance Criteria

- [ ] Platform roles (owner, member) are defined with clear permissions
- [ ] Project roles (admin, editor, commenter, viewer) are defined with full permission catalog
- [ ] Canvas action permissions cover all visual interactions
- [ ] Chat scope permissions are defined per scope type
- [ ] Permission manifest contract (server → client) is specified
- [ ] Role → permissions resolution strategy is defined
- [ ] Backend module structure is specified (auth module in platform-service)
- [ ] Guard architecture (AuthGuard + PermissionGuard) is documented
- [ ] Frontend integration pattern (PermissionProvider, usePermission, PermissionGate) is specified
- [ ] Migration strategy preserves current dev experience (DEV_MODE bypass)
- [ ] JWT payload and auth flow are specified
- [ ] Project membership API is specified
- [ ] Open decisions are captured and resolved for v1
- [ ] No new domain semantics introduced beyond user/membership/permission

---

## 16. References

- `docs/adr/ADR-001-visual-first-pivot.md` — Pivot decision
- `docs/adr/ADR-002-visual-shell-design.md` — Visual shell design (VIS-004)
- `docs/11-visual-grammar-v1-spec.md` — Visual grammar (node types, layers, actions)
- `docs/12-graph-projection-v1-spec.md` — Graph projection contract
- `docs/03-backlog-completo.md` — Epic 34: Authentication & Access (reframed)
