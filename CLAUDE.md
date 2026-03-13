# TheCrew

TheCrew está en **pivot completo a Live Company**.

## Qué significa
Cada proyecto deja de ser una empresa definida entera desde el principio y pasa a ser una **empresa viva** que:

- nace con una semilla mínima
- arranca con un CEO agent
- se refina conversando con el usuario
- crea departamentos, equipos y especialistas de forma incremental
- define workflows, contratos y artefactos conforme aparecen necesidades reales
- opera en tiempo real con observabilidad de estado, decisiones, comunicaciones y outputs

## Regla principal de producto
La empresa debe entenderse primero como:

1. unidades organizativas
2. agentes responsables
3. colaboración/workflows
4. runtime vivo

No priorizar modelos demasiado abstractos por encima de esta estructura humana.

## Fuente de verdad del pivot
Claude debe tratar como documentos principales:

- `docs/31-live-company-pivot-decision.md`
- `docs/32-live-company-repo-analysis.md`
- `docs/33-live-company-domain-model.md`
- `docs/34-live-company-canvas-v3-spec.md`
- `docs/35-live-company-growth-protocol.md`
- `docs/36-live-company-runtime-live-mode-spec.md`
- `docs/37-live-company-migration-strategy.md`
- `docs/38-live-company-backlog-v5.md`
- `docs/39-live-company-task-registry.md`

## Regla de sincronización documental
Si cambia cualquiera de estos:
- dominio
- canvas v3
- growth protocol
- runtime/live mode
- backlog
- task registry

Claude debe comprobar si también hay que actualizar:
- `README.md`
- `CLAUDE.md`
- `docs/25-verticaler-reference-company-spec.md`

## Flujo con Claude Code
- `/tc-next` decide la siguiente tarea desbloqueada del pivot
- `/tc-run <task-id>` ejecuta la tarea
- una tarea por sesión cuando sea posible
- no marcar una tarea como done sin tests y sin sincronizar docs afectadas

## Persistencia
- **PostgreSQL 16** vía Drizzle ORM (paquete `packages/drizzle-db`)
- 1 instancia, 2 schemas: `platform`, `company_design`
- `PERSISTENCE_MODE=drizzle` (default en k3d) o `in-memory` (tests unitarios)
- 30 repos tienen implementación Drizzle + in-memory
- Schemas en `services/*/src/drizzle/schema/`
- `docs/28-persistence-bootstrap-strategy.md` está SUPERSEDED

## Regla de implementación
No abrir nuevas features arbitrarias.
Todo trabajo debe encajar en el roadmap del pivot Live Company.

## Regla de diseño
No diseñar la empresa como un conjunto de capas abstractas equivalentes.
Diseñarla como:
- Company
- Department
- Team
- Coordinator Agent
- Specialist Agent
- Objective / Event / External Source
- Workflow / Handoff
- Contract / Artifact / Policy
- Live runtime state
