# Estrategia de migración: repo actual → Live Company

## Decisión
Migración incremental sobre el repo actual.
No big-bang rewrite.

## Objetivo
Preservar el valor técnico existente mientras se reemplaza el paradigma conceptual del producto.

## Marco de trabajo
Clasificar cada pieza en:
- preserve
- adapt
- deprecate

## Preserve

### Infraestructura
- monorepo
- turbo / pnpm
- testing
- k3d / Tilt
- servicios actuales

### Shell visual
- canvas foundation
- inspector
- explorer
- chat dock
- saved views
- layout persistence
- diff surface
- operations overlay

### Capas de gobierno ya útiles
- validations
- audit
- permissions
- collaboration

## Adapt

### Dominio
- company model → project seed + constitution
- departments → UO departments
- role / agent-archetype / agent-assignment → coordinator/specialist model
- workflow → communication and execution network
- contract / artifact / policy → anchored support entities
- verticaler → empresa viva de referencia

### Canvas
- node taxonomy
- edge semantics
- use of layers
- navigation labels
- toolbar priorities
- default views
- live mode

### Chat
- pasar de chat por scope meramente contextual a chat por responsabilidad real:
  - CEO
  - executive
  - team lead
  - specialist
  - workflow
  - company

## Deprecate conceptually
- empresa completa desde el inicio
- layer-first explanation of the product
- CRUD-first primary experience
- seeds que poblan todo el modelo como punto de partida obligatorio

## Fases de migración

### Fase A — Freeze
Congelar el modelo conceptual anterior.
Solo fixes críticos.

### Fase B — Documentation Pivot
Actualizar:
- README
- CLAUDE
- backlog
- task registry
- specs nuevas

### Fase C — Semantic Remapping
Redefinir:
- entidades principales
- gramática visual
- toolbar
- default views
- labels de UI

### Fase D — Bootstrap Rework
Nuevo flujo:
- crear project seed
- CEO inicial
- conversación bootstrap
- proposals organizativas
- creación incremental de UOs y agentes

### Fase E — Runtime-first instrumentation
Hacer que el sistema viva:
- timeline
- event stream
- runtime overlays
- decisions
- proposals
- budget tracking

### Fase F — Verticaler v2
Reconvertir Verticaler para demostrar el paradigma nuevo

## Riesgos de la migración
- mantener demasiada compatibilidad con el modelo viejo
- arrastrar términos viejos a la nueva UX
- confusión entre entities de diseño y runtime
- intentar hacer todo en una sola épica

## Recomendación
Entregar el pivot en hitos visibles:
1. nuevo lenguaje y docs
2. canvas semantic simplification
3. bootstrap CEO-first
4. proposals
5. live mode
6. Verticaler viva
