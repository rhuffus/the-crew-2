# Backlog completo de TheCrew (v2 — visual-first pivot)

## Estado consolidado
### Completado
- Epic 00 — Foundation
- Epic 01 — Local Platform
- Epic 02 — Web Shell
- Epic 03 — Projects
- Epic 04 — Company Model
- Epic 05 — Departments
- Epic 06 — Capabilities
- Epic 07 — Roles
- Epic 08 — Agents
- Epic 09 — Skills
- Epic 10 — Contracts
- Epic 11 — Workflows
- Epic 12 — Policies
- Epic 13 — Releases
- Epic 14 — Validation
- Epic 15 — Audit

### Pendiente legado
- Epic 16 — Operations placeholder
- Epic 17 — Authentication & Access
- Epic 18 — Hardening

## Decisión
No continuar linealmente con 16 → 17 → 18.
Primero ejecutar el pivot visual-first.

---

## Epic 19 — Visual-First Pivot Baseline
Objetivo: fijar la nueva dirección sin romper lo ya hecho.
- ADR del pivot visual-first
- freeze conceptual del CRUD actual como fallback administrativo
- criterios de adopción incremental del canvas
- definición de vistas: org, capabilities, workflows, contracts, artifacts, governance

## Epic 20 — Visual Grammar v1
Objetivo: definir el lenguaje visual del producto.
- tipos de nodo v1
- tipos de edge v1
- restricciones de conexiones válidas
- reglas de semantic zoom
- reglas de inspector
- reglas de capas y filtros

## Epic 21 — Graph Projection / Visual Read Model v1
Objetivo: servir a la UI un modelo de grafo optimizado.
- DTO del grafo por workspace
- DTO por department scope
- DTO por workflow scope
- mapeo de entidades actuales a nodos/edges
- estrategia de ids visuales y entidades referenciadas
- estrategia de diff visual por release

## Epic 22 — Visual Shell Refactor
Objetivo: rehacer la shell web para que el canvas sea el centro.
- sidebar explorer/layers/validation
- canvas viewport central
- inspector panel derecho
- chat dock
- breadcrumb visual
- toolbar de vista y filtros

## Epic 23 — Company Org Canvas v1
Objetivo: visualizar la empresa a nivel superior.
- CEO/root company node
- departments principales
- agentes de departamento / roles líderes
- relaciones jerárquicas
- navegación a subdiagramas

## Epic 24 — Inspector v1
Objetivo: editar el modelo desde el panel derecho.
- overview
- propiedades
- relaciones
- referencias cruzadas
- historial
- validaciones
- acciones de crear/vincular/eliminar

## Epic 25 — Relationship Editing v1
Objetivo: que las conexiones del canvas tengan semántica real.
- crear edge tipado
- editar edge desde inspector
- adjuntar contrato/condiciones a edge
- reglas de validación al conectar
- borrar edge con control de impacto

## Epic 26 — Department Drilldown Canvas v1
Objetivo: navegar dentro de un departamento.
- subcanvas departamental
- capabilities owned/contributed/consumed
- roles y agentes del área
- workflows owned/related
- contracts principales

## Epic 27 — Workflow Canvas v1
Objetivo: representar y editar workflows visualmente.
- workflow node root
- stages
- handoffs
- inputs/outputs
- approvals
- artifacts relacionados

## Epic 28 — Semantic Zoom & Nested Navigation
Objetivo: hacer que el zoom sea conceptual.
- entrar/salir de scopes
- breadcrumb jerárquico
- zoom in/out semántico
- colapso/expansión
- navegación consistente canvas ↔ explorer ↔ inspector

## Epic 29 — Visual Validation Overlay
Objetivo: enseñar la salud del modelo en el canvas.
- overlays de error/warning/info
- nodos incompletos
- edges inválidos
- contratos faltantes
- filtros por criticidad

## Epic 30 — Layers, Filters & Saved Views
Objetivo: controlar complejidad visual.
- capas activables
- filtros por owner/tipo/estado
- guardar vistas
- layout persistente por vista
- auto-layout inicial

## Epic 31 — Scoped Persistent Chat
Objetivo: conversar con la empresa desde cada ámbito.
- chat de CEO/company
- chat de department
- chat de workflow
- chat del elemento seleccionado
- persistencia por scope
- vinculación con artifacts y decisiones

## Epic 32 — Artifact/Explorer Synchronization
Objetivo: unificar navegación visual y navegación densa.
- explorer bidireccional con canvas
- artifacts sidebar
- tabla/lista como fallback
- navegación contextual desde cualquier entidad

## Epic 33 — Release-Aware Visual Diff
Objetivo: comparar cambios del operating model visualmente.
- diff entre draft/published
- nodos añadidos/cambiados/eliminados
- edges añadidos/cambiados/eliminados
- impacto por scope

## Epic 34 — Authentication & Access (reframed)
Objetivo: permisos conscientes del nuevo producto.
- acceso plataforma/proyecto
- permisos por módulo
- permisos por canvas action
- permisos por chat scope

## Epic 35 — Operations v1 on Canvas
Objetivo: empezar a enseñar runtime dentro del mapa.
- activity overlays
- runs vinculados a workflow
- incidents sobre nodos/edges
- tasks/queue view

## Epic 36 — Hardening v2
Objetivo: cerrar la primera versión visual usable.
- rendimiento de grafos grandes
- fixtures realistas
- pruebas e2e/playwright
- observabilidad ampliada
- docs finales de v1 visual

---

## Orden recomendado
19 → 20 → 21 → 22 → 23 → 24 → 25 → 26 → 27 → 28 → 29 → 30 → 32 → 33 → 31 → 34 → 35 → 36

## Qué queda aparcado temporalmente
- Epic 16 solo como placeholder
- Epic 17 absorbido y reformulado en Epic 34
- Epic 18 absorbido y reformulado en Epic 36

## Primera demo visual útil
La primera demo que ya cambia realmente la naturaleza del producto debería cubrir:
- shell visual
- canvas empresa v1
- inspector v1
- relaciones tipadas v1
- drilldown departamental v1
- workflow canvas v1
- overlays de validación
- explorer sincronizado

Eso ya permitiría entender una empresa visualmente y no solo por formularios/listados.
