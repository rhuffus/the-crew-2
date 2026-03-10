# ADR-005: Permissions Model for Visual-First Product

## Estado
Aceptada

## Fecha
2026-03-09

## Contexto

TheCrew necesita un modelo de permisos que funcione con el nuevo producto visual-first. El sistema actual no tiene autenticación ni control de acceso. El pivot visual introduce nuevas superficies de interacción (canvas actions, chat scopes, inspector editing) que necesitan control de acceso granular.

Las opciones consideradas:
1. **ABAC (Attribute-Based Access Control)**: máxima flexibilidad, complejidad alta.
2. **RBAC (Role-Based Access Control)**: simple, suficiente para v1, extensible.
3. **RBAC + scoped assignments**: RBAC con roles por proyecto, no globales.

## Decisión

**RBAC con roles asignados por proyecto.**

### Roles
- `platform:owner` / `platform:member` a nivel plataforma
- `project:admin` / `project:editor` / `project:commenter` / `project:viewer` a nivel proyecto

### Principios clave
1. Permisos controlan **acciones**, no **visibilidad** del grafo. Un viewer ve todo el canvas pero no puede modificar nada.
2. Resolución de permisos es un **lookup estático** de role → permissions[]. Sin queries dinámicas.
3. El JWT solo contiene `platformRole`. El `projectRole` se resuelve por request desde la membership table.
4. El módulo de auth vive en `platform-service`.
5. Dev mode (`DEV_MODE=true`) bypassa todo y devuelve permisos de admin.

### Canvas actions como permisos de primera clase
Los permisos del canvas (create, edit, delete, move, connect) son permisos explícitos, no derivados de permisos CRUD genéricos. Esto permite que el canvas y el admin view tengan control independiente si es necesario.

### Chat scope permissions
Los permisos de chat se diferencian por tipo de scope (company, department, node), no por instancia. El rol `commenter` existe específicamente para stakeholders que necesitan participar en conversaciones sin poder editar el modelo.

## Consecuencias

### Positivas
- Modelo simple y predecible
- Un solo endpoint devuelve el manifest completo de permisos
- Frontend puede cachear el manifest y usarlo sin round-trips adicionales
- Compatible con el enfoque visual-first: no fragmenta el grafo por permisos
- Dev mode preserva la experiencia actual de desarrollo sin autenticación

### Negativas / Trade-offs
- No hay granularidad por departamento (un editor puede editar todo el proyecto)
- No hay permisos por instancia de chat (si puedes escribir en un dept chat, puedes escribir en todos)
- No hay soporte para equipos/grupos (solo usuarios individuales asignados a proyectos)

### Riesgos
- Si se necesita granularidad por departamento antes de lo previsto, habrá que refactorizar la resolución de permisos
- El bypass de dev mode podría filtrarse a producción si no se gestiona bien el env

## Spec completa
`docs/13-permissions-model-v1-spec.md`

## Referencias
- ADR-001: Visual-First Pivot
- ADR-002: Visual Shell Design
- Epic 34: Authentication & Access (reframed)
