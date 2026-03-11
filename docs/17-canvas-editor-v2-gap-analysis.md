# Canvas Editor v2 — Gap Analysis del estado actual

## Resumen ejecutivo
El estado actual del repo demuestra que el giro a **visual-first** ya ha arrancado, pero todavía no se ha completado. La base existente es útil y no debe tirarse: ya hay shell visual, graph projection, rutas de canvas, inspector, explorer, diff visual, filtros, capas, collapse/expand y contratos iniciales de navegación.

Aun así, el producto actual sigue siendo más parecido a una **vista gráfica del dominio** que a un **editor visual completo de la empresa**.

La distancia entre lo que existe y la visión objetivo no es cosmética. Los principales huecos son:
- el canvas todavía no gobierna toda la empresa
- la edición desde canvas/inspector no cubre el modelo completo
- la navegación multinivel sigue siendo rígida y limitada
- la gramática visual no cubre artifacts ni operaciones reales
- el chat contextual está en placeholder
- hay varias piezas implementadas a nivel de componentes que todavía no están conectadas end-to-end
- hay bugs arquitectónicos que impedirán escalar el canvas aunque la UI mejore

---

## Lo que ya está bien encaminado

### 1. Shell visual real
Existe una shell razonable con:
- top bar
- explorer izquierdo
- canvas central
- inspector derecho
- chat dock

Referencia principal:
- `apps/web/src/components/visual-shell/visual-shell.tsx`

### 2. Proyección visual dedicada
El repo ya tiene una capa de **graph projection** separada del CRUD de dominio.
Eso es correcto y debe mantenerse.

Referencias:
- `services/company-design/src/graph-projection/application/graph-projection.service.ts`
- `services/company-design/src/graph-projection/mapping/scope-filter.ts`
- `packages/shared-types/src/index.ts`

### 3. Drilldown inicial
Ya hay rutas y navegación para:
- organización (`L1`)
- departamento (`L2`)
- workflow (`L3`)

Referencias:
- `apps/web/src/routes/projects/$projectId/org.tsx`
- `apps/web/src/routes/projects/$projectId/departments.$departmentId.tsx`
- `apps/web/src/routes/projects/$projectId/workflows.$workflowId.tsx`

### 4. Inspector básico funcional
Ya hay una base de inspector con overview/properties/relations/changes.

Referencia:
- `apps/web/src/components/visual-shell/inspector/inspector.tsx`

### 5. Gramática visual v1 y diff visual
Ya existen tipos de nodos, edges, capas, diff y documentación asociada.
Eso da una base semántica buena.

Referencias:
- `packages/shared-types/src/index.ts`
- `docs/11-visual-grammar-v1-spec.md`
- `docs/16-visual-diff-v1-spec.md`

---

## Gaps de producto

## A. El canvas todavía no cubre toda la empresa
La visión acordada era que el panel visual permitiera **gestionar completamente toda la empresa** desde un sistema de diagramas multinivel. Hoy no es así.

### Falta
- vista completa por categorías/perspectivas de empresa
- artifacts como ciudadanos de primer nivel
- operations overlay
- gobernanza operativa integrada
- chat persistente real por scope
- edición completa de entidades y relaciones desde inspector

### Consecuencia
El usuario sigue necesitando pensar en términos de pantallas CRUD y no todavía en términos de “empresa navegable y editable desde el canvas”.

---

## B. El canvas es visual-first, pero todavía no es editor-first
Ahora mismo el canvas muestra información y soporta algunas interacciones, pero no es todavía la interfaz maestra del modelo.

### Señales claras
- la toolbar es pequeña y genérica
- no existe una paleta completa de nodos y relaciones
- no existe un modo explícito de edición (select/pan/connect/create)
- no existe un sistema completo de context menu / quick actions
- no existe undo/redo
- no existe dirty state del canvas ni guardado visual real

Referencia principal:
- `apps/web/src/components/visual-shell/canvas-toolbar.tsx`

---

## C. El panel derecho no edita “todo”
La idea acordada era: cualquier click en el diagrama abre toda la configuración del elemento en el panel derecho y se puede editar desde ahí.

Actualmente eso no se cumple.

### Lo que sí hay
- overview básico
- properties tab
- relations tab
- changes en diff mode

### Lo que falta
- formularios completos por tipo de nodo
- formularios completos por tipo de edge
- tabs de artifacts, metrics, history, policies, runtime, ownership
- edición de stages dentro del workflow
- edición de layouts, agrupaciones y metadata visual
- bulk edit para multiselección

Referencias:
- `apps/web/src/components/visual-shell/inspector/overview-tab.tsx`
- `apps/web/src/components/visual-shell/inspector/properties-tab.tsx`
- `apps/web/src/components/visual-shell/inspector/relations-tab.tsx`

---

## D. La navegación multinivel sigue siendo rígida
La visión objetivo requería diagramas **multi-nivel** con entrada y salida fluida de niveles cada vez más profundos.

Hoy el modelo de navegación sigue atado a tres vistas fijas:
- `org`
- `department`
- `workflow`

Referencias:
- `apps/web/src/stores/visual-workspace-store.ts`
- `services/company-design/src/graph-projection/application/graph-projection.service.ts`

### Problemas concretos
1. `CanvasView` está hardcodeado a tres valores.
2. `inferEntityType()` solo soporta `L2` y `L3`.
3. `L4` existe en tipos pero no tiene proyección real.
4. no existe una noción genérica de `scope type` / `scope descriptor`.
5. no existe navegación multinivel arbitraria; existe drilldown predeterminado a tipos concretos.

### Bug importante
`pushNavigation()` limita artificialmente la pila:
- `navigationStack: [...s.navigationStack.slice(0, 2), entry]`

Eso impide una navegación profunda real.

Referencia:
- `apps/web/src/stores/visual-workspace-store.ts`

---

## Gaps funcionales importantes

## 1. Relationship editing implementado a medias
Existe una base potente de edición de relaciones:
- validador
- picker de edge type
- metadata input
- mutation resolver
- hook de mutación
- edge inspector
- add relationship dialog

Pero la pieza clave falla: **no está conectada de extremo a extremo en las rutas del canvas**.

### Evidencia
No hay referencias de uso real de `useRelationshipMutation` en las rutas del canvas.

### Impacto
- el usuario ve affordances de edición que no forman parte del flujo vivo
- hay riesgo de falsa sensación de completitud
- la arquitectura aparenta estar más madura de lo que realmente está

Referencias:
- `apps/web/src/hooks/use-relationship-mutation.ts`
- búsqueda en rutas sin wiring real

---

## 2. Las capas no se cargan de forma consistente en todos los scopes
En `org.tsx` y `workflow-canvas.tsx` el fetch del grafo no se hace con `activeLayers`.
Eso rompe la promesa de filtros/capas dinámicas si el servidor ya ha recortado nodos/edges antes de llegar al cliente.

### Casos afectados
- `apps/web/src/routes/projects/$projectId/org.tsx`
- `apps/web/src/components/visual-shell/workflow-canvas.tsx`

### Consecuencia
El usuario puede activar una capa en UI y no ver nada nuevo simplemente porque el servidor nunca entregó esos nodos.

Esto no es solo una mejora pendiente: es un **bug de contrato entre query layer y filtros visuales**.

---

## 3. Auto-layout no es realmente auto-layout
El botón de auto layout actualmente hace `fitView()`.
Eso no es auto-layout.

Referencias:
- `apps/web/src/components/visual-shell/workflow-canvas.tsx`
- lógica equivalente en las vistas de canvas

### Consecuencia
La UI promete una capacidad que en realidad no existe.

---

## 4. No existe persistencia real de posiciones/layout
Los nodos tienen `position`, pero el mapeo actual los genera como `null` y no existe un circuito real de persistencia de layout manual.

Referencias:
- `services/company-design/src/graph-projection/mapping/node-mapper.ts`
- `apps/web/src/lib/graph-to-flow.ts`

### Consecuencia
- el usuario no “ordena su empresa”, solo ve layouts transitorios
- no puede construir un mapa mental estable
- el canvas no es todavía un espacio de trabajo personalizable

---

## 5. Saved Views son locales y no compartibles
Las vistas guardadas viven en `localStorage`.

Referencias:
- `apps/web/src/lib/view-persistence.ts`
- `apps/web/src/components/visual-shell/explorer/saved-views-panel.tsx`

### Problema
Para un producto como TheCrew, las vistas deberían ser:
- del proyecto
- opcionalmente compartidas
- potencialmente ligadas a release
- auditables

`localStorage` sirve para un v1 rápido, no para el producto objetivo.

---

## 6. Chat dock es placeholder
El chat existe solo como carcasa visual y está deshabilitado.

Referencia:
- `apps/web/src/components/visual-shell/chat-dock/chat-dock.tsx`

### Consecuencia
Se pierde una de las piezas más distintivas del producto: hablar con el CEO o con un scope concreto con contexto persistente.

---

## 7. Artifacts no existen como entidad visual real
La visión acordada incluía artifacts como parte central del flujo empresarial.

Sin embargo:
- no hay `artifact` en `NodeType`
- no hay `artifacts` en `LayerId`
- no hay proyección visual ni inspector específico

Referencia:
- `packages/shared-types/src/index.ts`

### Consecuencia
No se puede representar bien el movimiento de PRDs, specs, reports, decisiones y outputs, que es clave para entender cómo “circula” la empresa.

---

## 8. Permissions model existe en docs, no en implementación visible
Hay especificación de permisos para canvas y chat, pero no implementación observable en frontend/backend del editor.

Referencia:
- `docs/13-permissions-model-v1-spec.md`

### Consecuencia
A día de hoy el producto no tiene todavía guardrails reales para operar en multiusuario.

---

## Gaps de UX

## 1. Toolbar insuficiente
La toolbar actual soporta:
- zoom
- fit view
- pseudo auto-layout
- validation overlay
- collapse/expand
- reset filters
- add entity básico

Pero falta lo crítico:
- modo select / pan / connect / add-node / add-edge
- paleta tipada de nodos
- paleta tipada de relaciones
- comandos rápidos
- undo/redo
- search/jump to node
- snapshots / save layout / restore layout
- view presets
- release selector y diff quick actions

Referencia:
- `apps/web/src/components/visual-shell/canvas-toolbar.tsx`

## 2. Explorer incompleto
El explorer actual tiene:
- tree
- layers
- filters
- saved views
- validation

Falta:
- artifacts
- search global potente
- outline del scope actual
- recent / favorites
- scopes de chat
- métricas rápidas
- operations / incidents

Referencia:
- `apps/web/src/components/visual-shell/explorer/explorer.tsx`

## 3. Multi-select con poco valor
Existe summary de multiselección, pero no acciones reales de batch edit.

Referencia:
- `apps/web/src/components/visual-shell/inspector/multi-select-summary.tsx`

## 4. No hay context menu ni quick actions sobre nodos/edges
Esto debilita mucho la experiencia visual-first.

## 5. No hay sentimiento de “workspace vivo”
Faltan señales de:
- dirty state
- saving
- validation recomputing
- sync status
- active release / comparing release
- last modified

---

## Gaps de modelo visual

## 1. Gramática todavía demasiado pequeña
La gramática actual cubre:
- company
- department
- role
- agent-archetype
- agent-assignment
- capability
- skill
- workflow
- workflow-stage
- contract
- policy

Pero la visión completa exige ampliar o preparar para:
- artifact
- decision
- run / queue / incident / runtime node
- team / unit container intermedio
- external system / integration endpoint
- approval gate visual dedicado

## 2. Semantic zoom todavía es de rutas, no de modelo
Existe zoom conceptual básico, pero no un verdadero sistema de transformación semántica entre niveles.

## 3. Falta una noción clara de `view preset`
No basta con activar capas: hacen falta vistas como:
- organization
- capability map
- workflow map
- contract map
- artifact flow
- governance
- operations

---

## Recomendación de reenfoque inmediato
Antes de seguir añadiendo features visuales “bonitas”, conviene hacer cuatro cosas en este orden:

### Prioridad 1 — Reparar la base existente
- wiring real de relationship mutation
- fix de layers/fetch contract
- fix de navigation stack depth
- clarificar el contrato de layout

### Prioridad 2 — Convertir el canvas en editor real
- toolbar/palette/modes
- inspector v2 con forms tipados completos
- creación y edición completas de nodos/edges desde canvas e inspector

### Prioridad 3 — Romper la rigidez de scopes
- pasar de `org/department/workflow` a un `scope model` genérico
- soportar drilldown profundo y navegación arbitraria

### Prioridad 4 — Completar los missing pillars del producto
- artifacts
- chat persistente
- operations overlay
- permisos reales

---

## Conclusión
El proyecto no necesita rehacerse. Necesita una **segunda ola de producto**.

La base actual ya sirve como cimiento, pero todavía no entrega lo que prometimos:
> un sistema visual desde el que gestionar completamente toda la empresa.

Ese objetivo sigue siendo viable, pero requiere asumir que el próximo backlog no debe ser incremental “de CRUD mejorado”, sino una fase específica de **Canvas Editor v2**.
