# ADR-001: Visual-First Pivot

## Estado
Aceptada

## Fecha
2026-03-09

## Contexto

TheCrew ha completado 16 épicas (00–15) que cubren el dominio CRUD completo: Projects, Company Model, Departments, Capabilities, Roles, Agents, Skills, Contracts, Workflows, Policies, Releases, Validation y Audit. La plataforma funciona como un sistema de administración con listados, formularios y cards.

Sin embargo, el objetivo de producto no es un backoffice. TheCrew debe ser una **plataforma visual para modelar y operar empresas autónomas versionadas**. La interfaz principal debe ser un editor visual semántico donde el usuario navega toda la empresa mediante diagramas drag & drop multinivel con semantic zoom.

El dominio existente es sólido y bien probado (843+ tests), pero la experiencia de usuario no refleja la visión del producto.

## Decisión

**TheCrew adopta un enfoque visual-first a partir de esta decisión.**

### Qué significa

1. **El diagrama es la interfaz principal.** No es una ilustración secundaria ni una vista complementaria. El canvas edita el modelo real del dominio.

2. **El plano semántico se conserva intacto.** Las entidades de dominio (departments, capabilities, roles, workflows, etc.) siguen siendo la verdad semántica. No se eliminan ni se degradan.

3. **Se introduce un plano visual sobre el semántico.** Una graph projection / visual read model sirve a la UI un grafo ya compuesto por scope, evitando que el frontend reconstruya la estructura uniendo endpoints CRUD arbitrarios.

4. **Los módulos CRUD existentes se congelan como fallback administrativo** (ver sección específica más abajo).

5. **La adopción es incremental.** No se rehace el producto de golpe. Cada épica del pivot (19–36) añade una capa visual sin romper lo anterior.

### Qué no significa

- No se borra el dominio existente.
- No se eliminan listados ni formularios.
- No se acoplan nodos/edges a un runtime concreto.
- No se introduce una pizarra libre sin semántica.

## Consecuencias

### Positivas
- El producto se diferencia de cualquier backoffice/CRUD genérico.
- La navegación visual permite comprender una empresa completa en segundos.
- El inspector y el canvas permiten editar el modelo sin cambiar de contexto.
- El semantic zoom ofrece niveles de detalle adecuados a cada rol de usuario.

### Negativas / Trade-offs
- Mayor complejidad frontend (canvas, zoom, drag & drop, inspector).
- Se requiere un read model visual nuevo en backend.
- Las tareas del pivot son más grandes y requieren diseño previo (plan mode).
- El testing de interacciones visuales requiere estrategia adicional (Playwright).

### Riesgos mitigados
- **Degradación del dominio**: las reglas duras de CLAUDE.md prohíben nodos/edges genéricos sin tipo semántico.
- **Reconstrucción caótica en frontend**: la graph projection sirve DTOs ya compuestos.
- **Pérdida de funcionalidad**: el CRUD se congela como fallback, no se elimina.

---

## Freeze del CRUD como fallback administrativo

### Política

Los módulos CRUD actuales (listados, formularios, cards, panels) se **congelan** a partir de esta decisión. Esto significa:

1. **No se eliminan.** Siguen accesibles como vistas alternativas.
2. **No se amplían.** No se añaden nuevas pantallas CRUD salvo corrección de bugs críticos.
3. **No se migran proactivamente.** El canvas absorbe el flujo principal de uso de forma progresiva; los CRUDs no se reescriben como canvas.
4. **Se mantienen probados.** Los 843+ tests existentes siguen pasando. No se degradan.
5. **Se etiquetan como "admin views".** En la navegación futura, las vistas tabulares/formulario se agrupan bajo un concepto de "vista administrativa" o "vista densa".

### Criterio de descongelación
Solo se modifica un módulo CRUD si:
- Un bug crítico lo requiere.
- Un cambio de dominio (nuevo campo, nueva entidad) necesita soporte mínimo antes de que exista su representación visual.
- Se elimina explícitamente una entidad del modelo.

---

## Criterios de adopción incremental del canvas

### Principios

1. **Cada épica visual es autónoma.** Añade valor visible sin requerir todas las demás.
2. **El canvas crece por scopes.** Primero Company, luego Department, luego Workflow.
3. **La shell visual se construye antes del primer canvas.** Sin shell, no hay dónde montar el canvas.
4. **La gramática visual se define antes de implementar nodos.** Sin gramática, no hay contrato.
5. **La graph projection se define antes de consumirla.** Sin DTO, el frontend no sabe qué renderizar.

### Orden de adopción

| Fase | Épicas | Entregable clave | Criterio de éxito |
|------|--------|-------------------|-------------------|
| 0 — Baseline | 19 | Este ADR + freeze | Documentación aprobada |
| 1 — Gramática | 20 | Nodos, edges, zoom rules, capas | Tipos exportados en shared-types |
| 2 — Projection | 21 | Graph read model DTO | Endpoint que sirve grafo por scope |
| 3 — Shell | 22 | Canvas + explorer + inspector shell | Ruta visual con placeholders |
| 4 — Org Canvas | 23 | Company org diagram v1 | Departments visibles, navegación |
| 5 — Inspector | 24 | Panel derecho funcional | Seleccionar nodo → ver/editar props |
| 6 — Relationships | 25 | Edges tipados editables | Crear/editar edge desde inspector |
| 7 — Drilldown | 26 | Department canvas | Entrar en dept → ver contenido |
| 8 — Workflow | 27 | Workflow canvas | Stages, handoffs, approvals |
| 9 — Navigation | 28 | Semantic zoom + nested nav | Zoom cambia nivel conceptual |
| 10 — Validation | 29 | Overlays visuales | Errores/warnings en nodos |
| 11 — Layers | 30 | Capas y filtros | Activar/desactivar vistas |
| 12 — Explorer | 32 | Sincronización explorer↔canvas | Click en explorer → foco en canvas |
| 13 — Diff | 33 | Diff visual por release | Nodos añadidos/eliminados visibles |
| 14 — Chat | 31 | Chat por scope | Conversar desde cada nivel |

### Criterio de "primera demo visual útil"

La primera demostración que cambia la naturaleza del producto requiere completar fases 0–10:
- Shell visual funcional
- Canvas empresa v1 con departments
- Inspector para ver/editar nodos
- Edges tipados
- Drilldown departamental
- Workflow canvas
- Overlays de validación
- Explorer sincronizado

---

## Definición de vistas del canvas

### Vista: Organization (`org`)
- **Scope:** Company-level
- **Nodos principales:** Company (root), Department, Role (líderes)
- **Edges principales:** contains, reports_to
- **Zoom semántico:** Al hacer zoom in en un Department → transición a vista Department
- **Capas activas por defecto:** Organization
- **Capas opcionales:** Governance (policies sobre departments)

### Vista: Department (`department`)
- **Scope:** Department-level (drilldown)
- **Nodos principales:** Department (contexto), Role, Agent, Capability, Workflow (owned), Contract (clave)
- **Edges principales:** owns, contributes_to, consumes, produces, implements
- **Zoom semántico:** Zoom in en Workflow → transición a vista Workflow
- **Capas activas por defecto:** Organization, Capabilities
- **Capas opcionales:** Contracts, Workflows, Governance

### Vista: Capabilities (`capabilities`)
- **Scope:** Cross-department
- **Nodos principales:** Capability, Department (como owner), Role (como contributor)
- **Edges principales:** owns, contributes_to, depends_on, produces
- **Propósito:** Ver el mapa completo de aptitudes y quién las provee
- **Capas activas por defecto:** Capabilities, Organization

### Vista: Workflows (`workflows`)
- **Scope:** Workflow-level (drilldown) o cross-workflow map
- **Nodos principales:** Workflow, Workflow Stage, Contract (como handoff), Artifact (como output)
- **Edges principales:** contains, hands_off_to, produces, consumes, approves, governs
- **Zoom semántico:** Zoom in en Stage → detalle con inputs/outputs/approvals
- **Capas activas por defecto:** Workflows, Artifacts
- **Capas opcionales:** Contracts, Governance

### Vista: Contracts (`contracts`)
- **Scope:** Cross-entity
- **Nodos principales:** Contract, Department (provider/consumer), Capability (subject)
- **Edges principales:** produces, consumes, governs, depends_on
- **Propósito:** Ver los acuerdos operativos y sus partes
- **Capas activas por defecto:** Contracts, Organization

### Vista: Governance (`governance`)
- **Scope:** Overlay sobre cualquier otra vista
- **Nodos principales:** Policy, Release (como referencia temporal)
- **Edges principales:** governs, approves, references
- **Propósito:** Visualizar qué reglas aplican a qué entidades
- **Comportamiento:** Se activa como capa sobre la vista actual, no como vista aislada
- **Capas activas:** Governance (overlay)

---

## Referencias
- `docs/01-arquitectura-inicial.md` — Arquitectura de producto visual-first
- `docs/06-analisis-estado-actual.md` — Análisis del estado del repo
- `docs/07-lenguaje-visual-y-gramatica.md` — Gramática visual v1
- `docs/03-backlog-completo.md` — Backlog completo con épicas 19–36
- `CLAUDE.md` — Reglas duras, principio rector y modelo mental
