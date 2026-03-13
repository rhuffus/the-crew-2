# Análisis profundo del repo actual frente al pivot Live Company

## Resumen ejecutivo
El repo actual **sí es una base válida** para implementar el nuevo enfoque.
No se recomienda reescribir desde cero.

## Hallazgos principales

### 1. La base técnica es sólida y reutilizable
Se observa una plataforma ya muy avanzada:
- monorepo con `pnpm` + `turbo`
- `apps/web` como shell visual madura
- `apps/api-gateway` como BFF
- `services/platform` y `services/company-design`
- `packages/shared-types` y `packages/domain-core`
- disciplina fuerte de testing

Esto es valioso y no debe tirarse.

### 2. El producto actual ya tiene una infraestructura de canvas potente
El repo ya incorpora:
- canvas con XYFlow / React Flow
- explorer
- inspector
- chat
- diff visual
- operaciones overlay
- permisos
- colaboración
- saved views
- persistencia de layout
- navegación multinivel

Esto significa que el nuevo canvas no nace de cero: nace sobre una base ya considerable.

### 3. El problema principal no es técnico: es semántico
El modelo actual aún gira alrededor de entidades como:
- capability
- role
- agent archetype
- agent assignment
- contract
- workflow
- policy
- artifact

Y la vista visual se articula con:
- `NodeType`
- `EdgeType`
- `LayerId`
- `ScopeType`

Todo esto es útil, pero hoy la lectura del sistema sigue siendo demasiado abstracta para un usuario humano.

### 4. El modelo actual ya incluye piezas que sirven para el pivot
El repo ya tiene:
- chat por scope
- overlay de operaciones
- bootstrap
- Verticaler seed
- graph projection
- visual diff
- collaboration

Estas piezas encajan muy bien con una futura empresa viva.

### 5. Hay un sesgo fuerte hacia “modelo completo predefinido”
La existencia de seeds completas, DTOs CRUD y tipos visuales cerrados sugiere que el sistema aún presupone:
- empresa definida entera
- catálogos ya cerrados
- estructura establecida antes de operar

Eso es justo lo que el pivot debe cambiar.

## Lo que se preserva

### Infraestructura
- monorepo
- stack
- toolchain
- testing
- k3d / Tilt
- hooks y Claude commands

### Frontend base
- shell visual
- explorer
- inspector
- chat dock
- diff
- operaciones overlay
- saved views
- layout persistence
- permission provider
- collaboration surfaces

### Backend base
- platform service
- company-design service
- graph projection
- audit
- validations
- saved views
- chat
- operations
- bootstrap pattern

## Lo que se adapta

### Dominio
- Company Model → Project Seed + Company Constitution
- Department → UO department
- Workflow → communication/work execution path
- Agent archetype / assignment → coordinator / specialist agent model
- Artifact / Contract / Policy → elementos secundarios anclados al trabajo real

### Visual grammar
- NodeType actual debe mapearse a un modelo más humano
- Layer model actual debe rebajarse a “views / overlays”
- Scope model actual sigue siendo útil, pero debe alinearse con:
  - company
  - department
  - team
  - agent / workflow detail

### Verticaler
Verticaler ya no debe ser solo una demo de CRUD y canvas.
Debe convertirse en el **ejemplo vivo** de una empresa que:
- nace
- se estructura
- trabaja
- evoluciona

## Lo que se depreca

### Conceptualmente
- layer-first mental model
- “empresa completa desde el día cero”
- prominencia del CRUD clásico
- exceso de abstracción en la vista principal

### Posibles tipos a revisar
No se decide aún eliminar tipos del código, pero sí se detecta que pueden necesitar:
- renombrado semántico
- nuevas agrupaciones
- relación distinta con el canvas principal

## Evaluación de viabilidad
### ¿Se puede pivotar dentro del repo actual?
Sí.

### ¿Hace falta reescribir todo?
No.

### ¿Hace falta redocumentar y replanificar casi todo?
Sí.

### ¿Habrá que tocar muchas piezas?
Sí, pero sobre cimientos útiles.

## Conclusión
La base actual es un **prototipo avanzado de plataforma**.
El siguiente paso correcto es usarlo como base para una nueva generación del producto, no abandonarlo.
