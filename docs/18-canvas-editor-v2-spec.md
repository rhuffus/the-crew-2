# Canvas Editor v2 — Especificación exhaustiva

## Objetivo
Convertir el editor visual de TheCrew en la **interfaz principal** para diseñar, navegar, gobernar y operar una empresa completa.

El canvas debe permitir:
- entender la estructura de toda la empresa
- entrar y salir de niveles cada vez más profundos
- crear y editar nodos tipados
- crear y editar relaciones tipadas
- inspeccionar y modificar cualquier elemento desde el panel derecho
- visualizar artifacts, flujos, contratos, gobierno y operaciones
- conversar con el CEO o con scopes específicos
- trabajar con vistas, filtros, layouts y diffs

---

## Principios rectores
1. **Visual-first, no visual-only.** Todo debe poder recorrerse desde el canvas, pero también debe existir inspector, búsqueda y vistas tabulares.
2. **Editor semántico, no pizarra libre.** Cada nodo y cada relación tienen tipo, reglas y validación.
3. **El canvas edita el modelo real.** Crear un nodo crea una entidad real; conectar crea una relación real.
4. **Semantic zoom, no solo zoom gráfico.** Al entrar o salir de nivel cambia el significado visible, no solo el tamaño.
5. **Un sistema visual, múltiples perspectivas.** Organización, capacidades, workflows, contratos, artifacts, governance y operations.
6. **Layout separado de semántica.** Mover un nodo cambia presentación, no significado.
7. **Toda interacción importante debe tener feedback y validación.**

---

## Arquitectura mental de la pantalla

## 1. Barra superior
Siempre visible. Debe incluir:
- selector de proyecto
- nombre del proyecto y release activa
- breadcrumbs del scope actual
- selector de vista/perspectiva
- selector draft/published/diff
- búsqueda global
- acciones rápidas (save layout, compare releases, command palette)
- estado del workspace (dirty/saving/synced)

### Contenido recomendado
- izquierda: breadcrumbs + scope icon + nivel actual
- centro: búsqueda, command palette, jump-to
- derecha: release selector, view preset, estado de sync, user/actions

---

## 2. Sidebar izquierdo
Panel de navegación y utilidades densas.

### Tabs mínimas
#### Explorer
Árbol de entidades del scope visible y del proyecto.

Debe permitir:
- expand/collapse
- focus en canvas
- reveal in canvas
- drilldown
- acciones rápidas

#### Artifacts
Listado y navegación de artifacts del scope o del proyecto.

#### Search
Búsqueda global por:
- nombre
- tipo
- owner
- relación
- texto
- status
- validation issues

#### Layers / Views
- activar/desactivar capas
- cambiar preset de vista
- cambiar filtros de relación/nodo

#### Validation
- lista de errores/warnings del scope
- focus en elemento problemático
- agrupación por severidad/tipo

#### Saved Views
- vistas del usuario
- vistas compartidas del proyecto
- vistas por release

#### Runtime / Operations
- runs activos
- incidentes
- colas
- bloqueos

---

## 3. Canvas central
Es el corazón del producto.

### Responsabilidades
- mostrar el grafo semántico del scope actual
- permitir navegar entre scopes
- permitir crear, seleccionar, mover, conectar y agrupar
- representar validación, estados y overlays
- mantener estabilidad espacial y mapa mental

### Modos de interacción
El canvas debe tener modos explícitos:
- **Select**
- **Pan**
- **Connect**
- **Add Node**
- **Add Relationship**
- **Comment / Review** (futuro cercano)

El modo activo debe ser visible en la toolbar.

### Interacciones mínimas
- click selecciona
- shift+click multiselección
- arrastre mueve selección o crea marquee
- doble click / enter sobre nodo drillable → drilldown
- escape → subir de nivel o cancelar acción
- drag desde handle → crear relación
- drop desde palette → crear nodo
- context menu sobre nodo/edge/canvas
- fit view / focus selected
- collapse / expand container

---

## 4. Panel derecho (Inspector)
El inspector debe ser el lugar donde se **revisa y edita todo** lo que se selecciona.

### Cuando se selecciona un nodo
Tabs sugeridas:
- Overview
- Properties
- Relations
- Artifacts
- Validation
- History
- Metrics / Runtime
- Chat

### Cuando se selecciona una relación
Tabs sugeridas:
- Overview
- Properties
- Contract / Metadata
- Validation
- History

### Cuando hay multiselección
- resumen de selección
- bulk edit compatible
- acciones masivas
- align / distribute / group

### Cuando no hay selección
- resumen del scope actual
- stats del canvas
- issues abiertas
- quick actions

---

## Modelo de navegación multinivel

## Niveles
El editor debe soportar al menos estos niveles semánticos:
- **L0**: plataforma / lista de empresas (fuera del canvas principal de proyecto)
- **L1**: empresa general
- **L2**: scope de categoría o departamento / unidad
- **L3**: workflow, sub-sistema o cluster interno
- **L4**: detalle profundo (stage, artifact flow, contract internals, etc.)

### Importante
No debe estar hardcodeado a solo tres rutas fijas. Debe existir una noción genérica de:
- `scopeType`
- `scopeEntityId`
- `scopePath`
- `scopeCapabilities`

### Drilldown esperado
Ejemplos de drilldown válidos:
- empresa → departamento
- empresa → capability map filtrado
- empresa → workflow cluster
- departamento → subdepartamento
- departamento → workflow
- workflow → stage map
- workflow → artifact flow
- contract → contract internals

### Drillout esperado
Siempre debe existir:
- breadcrumb navegable
- historial de navegación
- back/forward del navegador coherente
- focus restore al volver al nivel superior

---

## Vistas / perspectivas del canvas
El mismo modelo debe poder verse desde varias perspectivas.

## Presets v2 mínimos
### 1. Organization View
Muestra:
- company
- departments
- roles
- agent archetypes
- agent assignments
- relaciones jerárquicas y asignaciones

### 2. Capability View
Muestra:
- departments
- capabilities
- roles
- skills
- relaciones de ownership/contribution/compatibility

### 3. Workflow View
Muestra:
- workflows
- workflow stages
- participants
- contracts
- handoffs

### 4. Contract View
Muestra:
- departments/capabilities
- contracts
- bound workflows
- provide/consume links

### 5. Artifact Flow View
Muestra:
- artifacts
- producers
- consumers
- transformations
- contractual handoffs

### 6. Governance View
Muestra:
- policies
- approvals
- blocked paths
- exceptions

### 7. Operations View
Muestra:
- runs
- queues
- incidents
- live state overlays

### Regla
Los presets no reemplazan a las capas; las capas refinan el preset.

---

## Capas y filtros

## Capas mínimas
- organization
- capabilities
- workflows
- contracts
- artifacts
- governance
- operations

## Filtros mínimos
- por tipo de nodo
- por tipo de relación
- por owner department
- por estado/validación
- por release/diff status
- por texto
- por scope
- por runtime state

## Persistencia
Las capas y filtros deben poder guardarse como:
- vista temporal local
- vista guardada de usuario
- vista compartida de proyecto

---

## Paleta de nodos
Debe existir una paleta visual clara para crear nodos nuevos.

## Requisitos
- nodos agrupados por categoría
- búsqueda dentro de la paleta
- disabled states si el scope no permite ese tipo
- explicación breve de cada nodo
- creación por click o drag-and-drop

## Nodos v2 mínimos
- company (solo contexto, no creable libremente en proyecto)
- department
- team / unit container
- role
- agent archetype
- agent assignment
- capability
- skill
- workflow
- workflow stage
- contract
- policy
- artifact

### Nodos futuros previstos
- decision
- approval gate
- run
- queue
- incident
- integration endpoint

---

## Paleta de relaciones
Debe existir una paleta explícita de relaciones, no solo drag handles.

## Formas de crear relaciones
- drag desde handle de un nodo
- menú contextual “Create relationship”
- toolbar/palette de relaciones
- inspector → Relations tab

## Información mínima por relación
- tipo
- origen
- destino
- categoría
- metadata
- validación
- si es derivada o editable

## Relaciones v2 mínimas
- reports_to
- owns
- assigned_to
- contributes_to
- has_skill
- compatible_with
- provides
- consumes
- bound_by
- participates_in
- hands_off_to (derivada o semi-editable según diseño futuro)
- governs

### Relaciones futuras previstas
- produces_artifact
- consumes_artifact
- transforms_into
- blocks
- approves
- escalates_to
- depends_on
- triggers

---

## Inspector — especificación por tipo

## Department
Debe poder editar:
- nombre
- descripción
- mandato
- parent
- leadership
- capacidades owned/contributed/consumed
- workflows owned/participated
- contratos
- políticas
- artifacts

## Role
- nombre
- descripción
- accountability
- authority
- department
- capabilities
- compatible skills
- workflows participados

## Agent Archetype
- nombre
- descripción
- role asignado
- department
- skills
- constraints / policies
- style / persona metadata futura

## Agent Assignment
- nombre
- archetype
- status
- placement
- scope

## Capability
- definición
- propósito
- owner
- contributors
- consumers
- dependencies
- contracts
- workflows que la implementan
- metrics

## Skill
- definición
- categoría
- tags
- roles compatibles
- archetypes que la poseen
- límites

## Workflow
- nombre
- descripción
- owner department
- trigger
- contract ids
- participants
- stages
- artifacts de entrada/salida
- gates

## Workflow Stage
- nombre
- descripción
- orden
- participant owner
- artifacts de entrada/salida
- validaciones
- handoffs

## Contract
- nombre
- tipo
- provider
- consumer
- SLA
- acceptance criteria
- workflows vinculados
- artifacts intercambiados

## Policy
- nombre
- scope
- department/global
- tipo
- enforcement
- condition
- override / exceptions

## Artifact
- nombre
- tipo
- productor
- consumidores
- schema
- quality criteria
- estado
- versiones

---

## Multi-select y bulk actions
Debe existir soporte real para multi-select.

## Acciones mínimas
- align horizontal/vertical
- distribute
- move together
- apply layer visibility focus
- bulk tag / bulk owner change cuando sea compatible
- bulk delete con guardrails
- bulk group

---

## Context menu
### Sobre el canvas vacío
- add node
- paste
- fit view
- auto layout
- save layout
- create frame/group

### Sobre nodo
- inspect
- edit
- drilldown
- create relationship
- duplicate
- delete
- focus related
- open chat in this scope

### Sobre edge
- inspect relation
- edit metadata
- delete
- highlight source/target

---

## Layout y persistencia visual

## Requisitos
- auto-layout real
- manual positioning
- guardar posiciones
- restaurar layout
- layout por scope y por preset
- layouts compartidos opcionalmente
- layout estable tras refetches

## Reglas
- layout no debe alterar semántica
- mover nodos no crea relaciones
- cambios de layout deben ser persistibles separadamente del draft del modelo

---

## Diff y release awareness
El canvas debe ser consciente de:
- draft vs published
- compare between releases
- visual diff
- changes only filter
- before/after in inspector

El diff visual actual es una buena base, pero debe integrarse mejor con:
- toolbar
- release selector
- focus on changed scopes
- compare from any scope

---

## Chat contextual persistente
Debe existir chat persistente por scope.

## Scopes mínimos
- company / CEO
- department
- workflow
- selected node

## Requisitos
- historial persistente
- contexto del scope actual
- acciones sugeridas sobre el modelo
- posibilidad de crear cambios propuestos desde el chat
- enlaces a nodos/edges/artifacts mencionados

---

## Runtime / operations overlay
El canvas no solo debe diseñar la empresa: también debe mostrar su actividad.

## Elementos mínimos en overlay
- runs activos
- stages ejecutándose
- bloqueos
- colas
- incidentes
- fallos de handoff
- cumplimiento o incumplimiento contractual

## UX
Debe poder activarse/desactivarse como una capa o vista.

---

## Validación visual
Debe ser visible directamente en canvas e inspector.

## Requisitos mínimos
- badges en nodo
- edges inválidos destacados
- lista navegable en sidebar
- panel derecho con detalle y quick fixes
- validación por scope
- validación pre-publicación

---

## Accesibilidad y ergonomía
- navegación por teclado
- atajos documentados
- foco visible
- contraste correcto
- labels accesibles en nodos y toolbars
- funcionamiento razonable en resoluciones comunes de desktop

---

## Estado de la especificación
Esta especificación define el objetivo de **Canvas Editor v2**.
No implica implementarlo todo de golpe.

La estrategia correcta es:
1. reparar la base actual
2. convertir el canvas en editor completo
3. generalizar navegación y scopes
4. completar artifacts/chat/operations/permissions
