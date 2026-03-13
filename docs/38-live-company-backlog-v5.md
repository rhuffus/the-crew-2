# Backlog v5 — Live Company Pivot

## Fase nueva
A partir de aquí TheCrew entra en la fase **Live Company Pivot**.

## Epic 50 — Pivot Documentation & Product Reframing
Objetivo: dejar oficialmente adoptado el nuevo paradigma.

### Hitos
- ADR del pivot
- análisis profundo del repo
- nuevo dominio base
- canvas v3 spec
- growth protocol
- runtime/live mode spec
- migration strategy
- actualización de README / CLAUDE / commands

## Epic 51 — Language & Semantic Refactor
Objetivo: simplificar el lenguaje del producto para que sea más humano.

### Hitos
- sustituir “layers” como concepto principal por vistas/overlays
- priorizar UO + agentes + trabajo
- redefinir labels del canvas, inspector y toolbar
- revisar nomenclatura de entidades existentes

## Epic 52 — Live Company Domain Transition
Objetivo: introducir el nuevo modelo de dominio sin romper la base.

### Hitos
- project seed
- company constitution
- UO model
- coordinator/specialist agent model
- objective / event / external source
- proposal entity
- decision entity
- runtime execution model

## Epic 53 — Canvas v3 Reorientation
Objetivo: hacer que el canvas se lea como empresa viva.

### Hitos
- vista base centrada en estructura organizativa
- separación clara estructura vs workflow
- toolbar nueva
- overlays orientados a trabajo / deliverables / rules / live status
- panel derecho enriquecido para nodos y handoffs
- drill-in por company / department / team / agent detail

## Epic 54 — CEO-first Bootstrap
Objetivo: crear proyectos vivos desde una semilla mínima.

### Hitos
- crear proyecto seed
- CEO agent inicial
- chat bootstrap con el usuario
- refinamiento de misión/visión/reglas
- proposals de departamentos iniciales
- aprobación del founder

## Epic 55 — Organizational Growth Engine
Objetivo: permitir crecimiento incremental gobernado.

### Hitos
- proposals
- reglas de creación de departments / teams / specialists
- budgets
- context minimization
- madurez del proyecto
- approvals para expansión

## Epic 56 — Live Runtime & Observability
Objetivo: observar la empresa mientras trabaja.

### Hitos
- live mode
- timeline / event stream
- runtime statuses
- artifact lineage
- decision trail
- budget tracking
- replay básico

## Epic 57 — Verticaler v2 Live Company
Objetivo: convertir Verticaler en el ejemplo vivo del nuevo producto.

### Hitos
- Verticaler seed minimalista
- CEO bootstrap
- proposals iniciales
- departments/teams/specialists incrementales
- workflows y handoffs vivos
- ejemplos de runtime y decisiones
- checklist demo end-to-end

## Epic 58 — Frontend Live Company Adoption
Objetivo: conectar el frontend con todo el backend Live Company (bootstrap, proposals, growth engine, UOs, agents, runtime).

### Hitos
- API Gateway proxy para bootstrap, proposals y growth-engine
- Controllers REST para UOs y agents en backend + proxy en gateway
- API clients y TanStack hooks frontend
- Graph Projection v2: mapear UOs, agents y proposals al canvas
- CEO-first project creation wizard
- Layout engine + drilldown para team y agent-detail
- Proposals store + panel en Explorer
- CEO Chat Dock con proposal cards interactivas
- Growth dashboard + inspector panels para UO, Agent, Proposal
- Explorer entity tree + overlays para nuevos tipos
- Tests E2E de integración

## Orden recomendado
1. Epic 50
2. Epic 51
3. Epic 52
4. Epic 53
5. Epic 54
6. Epic 55
7. Epic 56
8. Epic 57
9. Epic 58

## Regla de implementación
No seguir ampliando features aisladas del modelo anterior.
Toda nueva implementación debe responder a este pivot.
