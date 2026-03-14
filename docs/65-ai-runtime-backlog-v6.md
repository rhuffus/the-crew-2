# Backlog v6 — AI Runtime Enablement

## Epic 59 — AI Runtime Decision & Gap Closure
Objetivo: formalizar la nueva fase y cerrar el análisis preserve/adapt/gap.

### Hitos
- decisión oficial de fase
- gap analysis real del repo
- documentación canónica actualizada
- task registry nuevo

## Epic 60 — CEO Interactive Bootstrap Runtime
Objetivo: convertir el bootstrap en una conversación real con IA.

### Hitos
- simplificar create project dialog
- abrir canvas + company node inmediatamente
- CEO greeting automático
- pipeline real de chat assistant
- estado de bootstrap conversacional
- gating de “ready-to-grow”

## Epic 61 — Foundation Documents & Markdown UX
Objetivo: introducir sistema real de documentos Markdown.

### Hitos
- catálogo de foundation docs
- persistencia de docs
- links desde Company inspector
- modal de apertura
- editor markdown visual/source
- menciones desde chat
- revisiones mínimas

## Epic 62 — Claude Code Container Runtime
Objetivo: ejecutar Claude Code dentro de contenedores para tareas acotadas.

### Hitos
- diseño de execution envelope
- imagen runtime base
- launcher / runtime manager
- workspace efímero por ejecución
- persistencia de resultados
- timeouts / retries / cleanup
- logs resumidos

## Epic 63 — Temporal Orchestration
Objetivo: usar Temporal como orquestador durable.

### Hitos
- servicio Temporal local
- worker app/service
- bootstrap conversation workflow
- foundation document workflow
- minimal org growth workflow
- basic agent task workflow
- task queues separadas

## Epic 64 — Basic Autonomous Work
Objetivo: permitir que el CEO cree mínima estructura y que empiece trabajo real básico.

### Hitos
- CEO propone departments/teams/specialists
- founder aprueba
- se crean entidades
- specialist ejecuta una primera tarea real
- outputs ligados a documentos/proposals/runtime

## Epic 65 — AI Runtime Polish & Safety
Objetivo: hacer usable y segura la primera integración real.

### Hitos
- runtime events visibles en UI
- errores y timeouts legibles
- budget/cost approximation
- guardrails del runner
- smoke tests end-to-end
- docs de limitaciones local/dev

## Epic 67 — PostgreSQL + Prisma Migration ✅
Objetivo: reemplazar Drizzle ORM por Prisma, database-per-service, y eliminar persistencia dual.
Estado: **completada** — todos los hitos cerrados (AIR-021 a AIR-033).

### Hitos
- ✅ ADR y planificación formal
- ✅ Paquete compartido `packages/prisma-db`
- ✅ Platform migrado y verificado (1 tabla, proof-of-concept)
- ✅ Company-design schema Prisma (32 modelos)
- ✅ Repos convertidos en 3 batches (8 + 9 + 14)
- ✅ Company-design verificado e2e
- ✅ Infra: database-per-service en k8s (3 postgres: platform, company-design, temporal)
- ✅ Limpieza total de Drizzle
- ✅ Documentación actualizada

### ADR
- `docs/67-prisma-migration-adr.md`

## Orden recomendado
1. Epic 59
2. Epic 60
3. Epic 61
4. Epic 62
5. Epic 63
6. Epic 64
7. Epic 65
8. Epic 67
