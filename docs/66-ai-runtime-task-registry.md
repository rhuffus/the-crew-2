# Task Registry — AI Runtime Enablement

## Leyenda
- status: todo | in-progress | done | blocked
- mode: plan | edit
- fresh-session: yes | no

| task-id | epic | status | mode | fresh-session | parallel-group | depends-on | objetivo |
|---|---:|---|---|---|---|---|---|
| AIR-001 | 59 | done | plan | yes | A | - | Formalizar la nueva fase AI Runtime Enablement y sincronizar documentación principal. |
| AIR-002 | 59 | done | plan | yes | A | AIR-001 | Completar gap analysis del repo actual frente a runtime real con IA, Temporal y documentos Markdown. |
| AIR-003 | 60 | done | plan | yes | B | AIR-001 | Diseñar el nuevo flujo de creación de proyecto + CEO bootstrap conversacional real. |
| AIR-004 | 61 | done | plan | yes | B | AIR-001 | Diseñar el sistema de documentos fundacionales y la UX de edición Markdown. |
| AIR-005 | 62 | done | plan | yes | C | AIR-001 | Diseñar el runtime de Claude Code en contenedores Docker con ejecución acotada y reproducible. |
| AIR-006 | 63 | done | plan | yes | C | AIR-001 | Diseñar la orquestación con Temporal para bootstrap, documentos, growth y tareas básicas. |
| AIR-007 | 64 | done | plan | yes | D | AIR-003, AIR-005, AIR-006 | Diseñar el primer slice de trabajo autónomo básico post-bootstrap. |

| AIR-008 | 60 | done | edit | yes | E | AIR-003 | Simplificar Create Project: solo nombre + descripción corta, redirigir al canvas del proyecto y abrir Company node + CEO chat automáticamente. |
| AIR-009 | 60 | done | edit | yes | E | AIR-003, AIR-006 | Implementar backend/frontend del bootstrap conversacional real: assistant responses, bootstrap states y persistencia de mensajes del CEO. |
| AIR-010 | 61 | done | edit | yes | F | AIR-004 | Introducir dominio y API de Project Documents (foundation docs en Markdown) con links desde Company inspector. |
| AIR-011 | 61 | done | edit | yes | F | AIR-004, AIR-010 | Integrar editor Markdown visual/source en modal de documentos y menciones desde chat. |
| AIR-012 | 62 | done | edit | yes | G | AIR-005 | Crear imagen base y launcher del Claude runner container con execution/result envelope. |
| AIR-013 | 63 | done | edit | yes | G | AIR-006 | Introducir Temporal en local dev, worker app y primeras task queues. |
| AIR-014 | 63 | done | edit | yes | H | AIR-009, AIR-012, AIR-013 | Implementar BootstrapConversationWorkflow end-to-end con assistant activity real. |
| AIR-015 | 63 | done | edit | yes | H | AIR-010, AIR-012, AIR-013 | Implementar FoundationDocumentWorkflow end-to-end con creación/actualización de Markdown docs. |
| AIR-016 | 64 | done | edit | yes | I | AIR-014, AIR-015 | Permitir que el CEO proponga y cree estructura mínima (department/team/specialist) cuando bootstrap esté ready-to-grow. |
| AIR-017 | 64 | done | edit | yes | I | AIR-012, AIR-013 | Implementar BasicAgentTaskWorkflow para una tarea real de un especialista usando Claude runner. |
| AIR-018 | 65 | done | edit | yes | J | AIR-014, AIR-015, AIR-017 | Integrar runtime traces en UI: timeline, execution summaries, outputs y errores visibles. |
| AIR-019 | 65 | done | edit | yes | J | AIR-012, AIR-017 | Añadir budgets/timeouts/retries/cleanup y documentar limitaciones de seguridad/local-dev. |
| AIR-020 | 65 | done | edit | yes | K | AIR-008..AIR-019 | Escribir smoke tests end-to-end del flujo completo: create project → CEO chat → docs → ready-to-grow → first specialist task. |

| AIR-021 | 67 | done | plan | yes | L | - | ADR para migración Drizzle → Prisma + database-per-service. Crear docs/67-prisma-migration-adr.md. |
| AIR-022 | 67 | done | edit | yes | L | AIR-021 | Crear packages/prisma-db con PrismaModule, token PRISMA_CLIENT y base service. Actualizar Dockerfile. |
| AIR-023 | 67 | done | edit | yes | M | AIR-022 | Prisma schema y PrismaService para platform (1 tabla: Project). PrismaProjectRepository. Módulo sin ternario. |
| AIR-024 | 67 | done | edit | yes | M | AIR-023 | Verificar platform e2e con Prisma. Generar migración inicial. Eliminar drizzle de platform. |
| AIR-025 | 67 | done | edit | yes | N | AIR-022 | Prisma schema completo para company-design (33 tablas). CompanyDesignPrismaService. |
| AIR-026 | 67 | done | edit | yes | O | AIR-025 | Convertir repos batch 1 — core domain (8): CompanyModel, Department, Capability, Role, Contract, Workflow, Policy, Skill. |
| AIR-027 | 67 | done | edit | yes | O | AIR-025 | Convertir repos batch 2 — agents/artifacts/audit/chat/collab (9): AgentArchetype, AgentAssignment, Artifact, Audit, Chat, Comment, Review, Lock, SavedView. |
| AIR-028 | 67 | done | edit | yes | P | AIR-026, AIR-027 | Convertir repos batch 3 — operations/runtime/LCP/new (14 repos). |
| AIR-029 | 67 | done | edit | yes | P | AIR-028 | Verificar company-design e2e con Prisma. Migración inicial. Eliminar drizzle config. |
| AIR-030 | 67 | done | edit | yes | Q | AIR-024, AIR-029 | Database-per-service en k8s: dos postgres, eliminar postgres.yaml y db-migrate.yaml, init containers. |
| AIR-031 | 67 | done | edit | yes | Q | AIR-030 | Actualizar Dockerfile.nestjs y verificar stack completo con tilt up. |
| AIR-032 | 67 | done | edit | yes | R | AIR-031 | Eliminar todos los artefactos Drizzle: packages/drizzle-db, schemas, drizzle-*.repository.ts, dependencias. |
| AIR-033 | 67 | done | edit | yes | R | AIR-032 | Actualizar toda la documentación: CLAUDE.md, MEMORY.md, docs canónicos, registry y backlog. |

## Estado actual
AIR-019 completada — Budgets, timeouts, retries, cleanup y documentación de seguridad/local-dev:
- `RUNTIME_SAFETY_LIMITS` en shared-types: hard caps (timeout 10-600s, maxRetries 5, pidsLimit 100, memory 512MB)
- `TASK_TYPE_DEFAULTS` por tipo de tarea: timeout, maxRetries, maxTurns, maxTokens, maxCostUsd
- Execution domain: timeout y maxRetries clampeados con safety limits
- ClaudeRunnerService: aplica defaults por task type, callers pueden override
- Docker adapter: container naming, labels (`the-crew.runner=true`), pids-limit, force-remove en hard timeout, cleanupStaleContainers()
- Entrypoint: logging de budgets, post-hoc token budget check con `budgetExceeded` flag
- Temporal workflow: activity proxies separados por duración, retry policy con backoff (2 attempts, 10s initial, 2x)
- Runner activities: forward de maxTokens, maxCostUsd, maxRetries al platform service
- AgentTaskInput/SubmitAgentTaskDto: campos maxTokens, maxCostUsd, maxRetries
- docs/62: sección completa de budgets/timeouts/retries/cleanup + limitaciones de seguridad local-dev vs producción
- Tests actualizados en shared-types (183 pass), platform (90 pass), temporal-worker (70 pass)

Grupo F cerrado (AIR-010 + AIR-011 done).
Grupo J cerrado (AIR-018 + AIR-019 done).

AIR-011 completada — Editor Markdown visual/source en modal + menciones desde chat:
- MDXEditor como editor WYSIWYG con toolbar (headings, bold/italic, lists, undo/redo)
- Toggle visual/source con sincronización bidireccional de contenido
- Textarea source mode con font-mono para edición Markdown raw
- Save button con mutation a API (UpdateProjectDocumentDto)
- Document metadata badges (status, sourceType) en el header del modal
- Lazy-loaded via React.lazy para no impactar bundle size del shell
- Dialog basado en @radix-ui/react-dialog (shadcn pattern)
- Inspector: document items clickables que abren el modal vía Zustand store (openDocument/closeDocument)
- Chat: DocumentMentionPopover con dropdown de docs disponibles
- Chat: @doc:slug mentions insertados en el texto del input
- Chat: renderWithDocLinks parsea mensajes y renderiza DocumentLink clickables
- DocumentLink abre el modal del documento referenciado
- Tests: 9 (modal) + 12 (mentions) = 21 tests nuevos, 0 regresiones

AIR-022 completada — packages/prisma-db con PrismaModule, PRISMA_CLIENT token y PrismaBaseService:
- `packages/prisma-db/` — nuevo paquete workspace con NestJS module pattern
- `PrismaBaseService` extiende PrismaClient con lifecycle hooks (onModuleInit/onModuleDestroy)
- `PRISMA_CLIENT` symbol token para inyección
- `PrismaModule.forRoot(options?)` — dynamic global module con factory, acepta `url` opcional
- Minimal `schema.prisma` para generación de tipos base
- `prisma generate` integrado en build script
- Dockerfile.nestjs actualizado: copia prisma-db, build CJS, `prisma generate` condicional por servicio
- 4 test files, 13 tests (constants, base service, module, exports)

Grupo L cerrado (AIR-021 + AIR-022 done).

AIR-018 completada — Runtime traces en UI: timeline, execution summaries, outputs y errores visibles:
- `ExecutionDetail` component: expandable execution card showing status, duration, cost, outputs (docs/proposals/decisions count), log summary, errors with severity
- `RuntimeTab` enhanced: shows all executions (not just active) via React Query hook, separates active vs terminal, prominent failed count badge, event timeline with severity colors and descriptions
- `use-runtime-executions` hook: React Query hook for fetching all project executions with polling
- `CanvasSummary` runtime section: project-level runtime summary in live mode (active/blocked/failed counts, cost, connection status)
- Events display enhanced with severity-colored borders, descriptions, and overflow indicator
- Fix pre-existing shared-types build error: imported `ProposalDto` and `MaturityPhase` into scope in index.ts
- 37 tests passing (31 component tests + 6 store tests), 0 regressions

AIR-016 completada — CEO propone y crea estructura mínima (department/team/specialist):
- `GrowthEngineAppService.implementProposal()`: crea UOs (department/team) con coordinadores y specialists, avanza fase de madurez (seed→formation→structured)
- `BootstrapConversationService`: 3 nuevos métodos — `proposeGrowth()`, `approveGrowthProposal()`, `rejectGrowthProposal()`
- `LocalAssistantResponseProvider`: maneja estados ready-to-grow y growth-started, trigger `__propose_growth__` genera propuestas estructuradas por tipo de empresa
- `BootstrapConversationController`: 3 nuevos endpoints (propose-growth, approve, reject)
- API Gateway: proxy endpoints + client methods
- Frontend: hooks (`useProposeGrowth`, `useApproveGrowthProposal`, `useRejectGrowthProposal`), "Propose Structure" button en CEO dock, ProposalCard inline
- Shared types: `GrowthProposalSuggestion`, `ProposeGrowthResponseDto`, `ApproveGrowthProposalResponseDto`, `RejectGrowthProposalResponseDto`
- Tests: 8 (implement-proposal) + 6 (local-assistant growth states) + existing live-company-flow mock updated = 0 regresiones

Grupo I cerrado (AIR-016 + AIR-017 done).

AIR-020 completada — Smoke tests end-to-end del flujo completo:
- `services/company-design/src/__tests__/smoke-full-bootstrap-flow.test.ts` — 10 tests: bootstrap → CEO conversation → status lifecycle → docs → growth proposals → approve/reject → specialist creation → idempotency
- `services/temporal-worker/src/__tests__/smoke-agent-task-chain.test.ts` — 17 tests: prepareExecutionWorkspace → launchClaudeContainer → collectExecutionResult → persistExecutionOutputs, full chain (success + failed + timed-out), input validation, error handling
- `apps/web/src/__tests__/smoke-ceo-bootstrap-flow.test.tsx` — 14 tests: create project form → CEO conversation dock → status display → messages → proposal cards → approve/reject actions
- Total: 41 smoke tests nuevos, 0 regresiones

Grupo K cerrado (AIR-020 done).
Epics 59–65 (AI Runtime Enablement) completas.

AIR-025 completada — Prisma schema completo para company-design (32 modelos) + CompanyDesignPrismaService:
- `services/company-design/prisma/schema.prisma` — 32 modelos Prisma mapeando 1:1 las tablas Drizzle existentes
- Modelos organizados por dominio: core (8), agents (2), artifacts (1), audit (1), chat (2), comments (1), collaboration (3), releases/compliance (2), operations (3), LCP (6), runtime (2), bootstrap (1), documents (1)
- Tipos mapeados: text→String, varchar→@db.VarChar(N), integer→Int, boolean→Boolean, doublePrecision→Float, jsonb→Json, text[]=String[], timestamptz→@db.Timestamptz
- `CompanyDesignPrismaService` extiende PrismaClient con lifecycle hooks (onModuleInit/onModuleDestroy)
- `CompanyDesignPrismaModule.forRoot(options?)` — dynamic global module, acepta `url` opcional
- package.json actualizado: @prisma/client + prisma deps, scripts prisma:generate/migrate/studio
- Dockerfile.nestjs ya soporta `prisma generate` condicional (de AIR-022)
- 8 tests nuevos (4 service + 4 module), 1314 tests totales en company-design, 0 regresiones

Grupo N cerrado (AIR-025 done).

AIR-023 completada — Prisma schema + PlatformPrismaService + PrismaProjectRepository (sin ternario):
- `services/platform/prisma/schema.prisma` — modelo Project con tipos column-by-column equivalentes a Drizzle
- `PlatformPrismaService` extiende PrismaClient generado (custom output `.prisma/platform-client`) con lifecycle hooks
- `PlatformPrismaModule` — global module, provee PlatformPrismaService a todo el servicio
- `PrismaProjectRepository` — implementa ProjectRepository con upsert, findUnique, findMany, delete
- `ProjectsModule` actualizado: sin ternario, siempre PrismaProjectRepository
- `AppModule` actualizado: PlatformPrismaModule reemplaza DrizzleModule condicional
- package.json: @prisma/client + prisma deps, eliminado drizzle-orm/drizzle-db/postgres/drizzle-kit
- Scripts actualizados: prisma generate integrado en build/typecheck/test
- Archivos Drizzle eliminados: drizzle.config.ts, drizzle/schema/projects.ts, drizzle-project.repository.ts
- 13 tests nuevos (4 service + 2 module + 7 repository), 103 tests totales en platform, 0 regresiones

AIR-024 completada — Verificación platform e2e con Prisma, migración inicial, limpieza drizzle:
- Migración Prisma inicial generada: `prisma/migrations/20260313000000_init/migration.sql`
- `migration_lock.toml` creado con provider=postgresql
- SQL: CREATE TABLE "projects" con id, name, description, status, created_at, updated_at
- Artefactos drizzle eliminados: `drizzle/` (schema .map files), `dist/drizzle/` (compiled output)
- Cero referencias a drizzle en todo `services/platform/`
- 14 test files, 103 tests — todos pasan
- Typecheck OK, Lint OK
- Monorepo sin regresiones (fallo pre-existente en web department-canvas.test.tsx, no relacionado)

Grupo M cerrado (AIR-023 + AIR-024 done).

AIR-026 completada — Prisma repos batch 1 core domain (8 repos convertidos):
- 8 nuevos Prisma repositories: PrismaCompanyModelRepository, PrismaDepartmentRepository, PrismaCapabilityRepository, PrismaRoleRepository, PrismaContractRepository, PrismaWorkflowRepository, PrismaPolicyRepository, PrismaSkillRepository
- 8 módulos actualizados: eliminado ternario `isPersistenceModeDrizzle()`, siempre `useClass: Prisma*Repository`
- Cada repo usa `CompanyDesignPrismaService` con `upsert/findUnique/findMany/delete`
- Domain mapping preservado 1:1 del patrón Drizzle (reconstitute, arrays spread, type casts)
- Fix preexistente: `prisma-chat.repository.ts` Json→unknown cast para entityRefs/actions
- 8 test files nuevos (48 tests), 1416 tests totales en company-design, 0 regresiones
- Typecheck OK, Lint OK (0 errores)

AIR-027 completada — Prisma repos batch 2 agents/artifacts/audit/chat/collab (9 repos convertidos):
- 9 nuevos Prisma repositories: PrismaAgentArchetypeRepository, PrismaAgentAssignmentRepository, PrismaArtifactRepository, PrismaAuditRepository, PrismaChatRepository, PrismaCommentRepository, PrismaReviewRepository, PrismaLockRepository, PrismaSavedViewRepository
- 7 módulos actualizados: eliminado ternario `isPersistenceModeDrizzle()`, siempre `useClass: Prisma*Repository`
- Chat repo usa `$transaction` para upsert thread + recrear messages (equivalente al patrón Drizzle)
- Audit repo usa `create` en vez de `upsert` (append-only, sin conflicto)
- Review/Lock repos usan `findFirst` para queries multi-campo (equivalente a `and(eq(...), eq(...))`)
- 9 test files nuevos (59 tests), 1423 tests totales en company-design, 0 regresiones
- Typecheck OK (12/12 monorepo), Lint OK (0 errores, solo warnings en tests)

Grupo O cerrado (AIR-026 + AIR-027 done).

AIR-028 completada — Prisma repos batch 3 operations/runtime/LCP/new (14 repos convertidos):
- 14 nuevos Prisma repositories: PrismaWorkflowRunRepository, PrismaStageExecutionRepository, PrismaIncidentRepository, PrismaContractComplianceRepository, PrismaRuntimeExecutionRepository, PrismaRuntimeEventRepository, PrismaLcpAgentRepository, PrismaOrganizationalUnitRepository, PrismaProjectSeedRepository, PrismaCompanyConstitutionRepository, PrismaBootstrapConversationRepository, PrismaProjectDocumentRepository, PrismaReleaseRepository, PrismaProposalRepository
- 10 módulos actualizados: eliminado ternario `isPersistenceModeDrizzle()`, siempre `useClass: Prisma*Repository`
- Módulos: operations (4 repos), runtime (2), lcp-agents (1), organizational-units (1), project-seed (1), constitution (1), bootstrap-conversation (1), project-documents (1), releases (1), proposals (1)
- Nullable JSON fields handled with `Prisma.JsonNull` (RuntimeExecution.output, Release.snapshot, LcpAgent.budget)
- StageExecution.listByProject uses two-step query (workflowRun findMany → stageExecution findMany with IN)
- RuntimeEvent uses append-only `create`, `count`, `findFirst` for latest, `findMany` with take/skip/orderBy
- RuntimeExecution.listActiveByProject uses `status: { in: [...] }` filter
- RuntimeExecution.listByEntity and RuntimeEvent.listByEntity use `OR` conditions
- Proposal.findByProjectId supports optional status/proposalType filters
- BootstrapConversation.findByProjectId uses `@unique` constraint for `findUnique`
- 14 test files nuevos (81 tests), 1504 tests totales en company-design, 0 regresiones
- Typecheck OK (12/12 monorepo), Lint OK (0 errores, solo warnings pre-existentes)

AIR-029 completada — Verificación company-design e2e con Prisma, migración inicial, limpieza Drizzle:
- Migración Prisma inicial generada: `prisma/migrations/20260313000000_init/migration.sql`
- `migration_lock.toml` creado con provider=postgresql
- SQL: CREATE TABLE para 32 tablas (company_models, departments, capabilities, roles, contracts, workflows, policies, skills, agent_archetypes, agent_assignments, artifacts, audit_entries, chat_threads, chat_messages, comments, entity_locks, review_markers, saved_views, releases, contract_compliances, incidents, workflow_runs, stage_executions, project_seeds, company_constitutions, organizational_units, lcp_agents, proposals, runtime_executions, runtime_events, bootstrap_conversations, project_documents)
- CREATE UNIQUE INDEX en bootstrap_conversations(project_id)
- `app.module.ts` actualizado: DrizzleModule reemplazado por CompanyDesignPrismaModule.forRoot()
- Artefactos Drizzle eliminados: `drizzle.config.ts`, `src/drizzle/` (33 schema files), `drizzle/` (compiled output), `dist/drizzle/`, 31 drizzle-*.repository.ts
- Dependencias eliminadas: drizzle-orm, drizzle-kit, postgres, @the-crew/drizzle-db
- Scripts eliminados: db:generate, db:migrate, db:push
- Cero referencias a drizzle en todo `services/company-design/`
- 128 test files, 1504 tests — todos pasan
- Typecheck OK (11/11 monorepo), Lint OK (0 errores, solo warnings pre-existentes)
- Fallo pre-existente en web department-canvas.test.tsx (no relacionado)

Grupo P cerrado (AIR-028 + AIR-029 done).

AIR-030 completada — Database-per-service en k8s: dos postgres, init containers para Prisma migrate:
- `infra/k8s/postgres-platform.yaml` — StatefulSet PostgreSQL dedicado para platform (DB: `platform`)
- `infra/k8s/postgres-company-design.yaml` — StatefulSet PostgreSQL dedicado para company-design (DB: `company_design`)
- `infra/k8s/postgres.yaml` eliminado — ya no existe un PostgreSQL unificado
- `infra/k8s/db-migrate.yaml` eliminado — ya no existe Job de migración centralizado
- `infra/k8s/platform.yaml` actualizado: init container `prisma-migrate` ejecuta `prisma migrate deploy`, DATABASE_URL apunta a `postgres-platform:5432/platform`, PERSISTENCE_MODE eliminado
- `infra/k8s/company-design.yaml` actualizado: init container `prisma-migrate` ejecuta `prisma migrate deploy`, DATABASE_URL apunta a `postgres-company-design:5432/company_design`, PERSISTENCE_MODE eliminado
- `Tiltfile` actualizado: dos recursos postgres (postgres-platform, postgres-company-design), db-migrate eliminado, resource_deps actualizados
- No más `search_path=` — cada servicio tiene su propia DB dedicada
- Typecheck OK (11/11), Lint OK (0 errores), Tests: platform 103/103, company-design 1504/1504
- Fallo pre-existente en web department-canvas.test.tsx (no relacionado)

AIR-031 completada — Dockerfile.nestjs actualizado y stack completo verificado con tilt up:
- `services/company-design/package.json` — scripts actualizados: `prisma generate` antes de build/typecheck/test (alineado con platform)
- `infra/docker/Dockerfile.nestjs` — CMD actualizado a exec form (JSON args) para manejo correcto de señales OS
- Docker builds verificados: 4/4 imágenes construyen correctamente (platform, company-design, temporal-worker, api-gateway)
- Init containers `prisma-migrate`: memoria aumentada a 384Mi (128Mi causaba OOMKilled con Node.js + Prisma)
- `infra/k8s/temporal.yaml`: migrado de `DB=sqlite` (no soportado) a `DB=postgres12_pgx` con PostgreSQL dedicado
- `infra/k8s/postgres-temporal.yaml` — nuevo PostgreSQL dedicado para Temporal (database-per-service)
- `enableServiceLinks: false` en temporal y temporal-ui para evitar conflictos con env vars de k8s
- Readiness probes de postgres corregidos: añadido `-d <dbname>` para evitar logs ruidosos
- `Tiltfile` actualizado: postgres-temporal como recurso, dependencia de temporal
- `tilt ci` exitoso: "SUCCESS. All workloads are healthy." — 11 pods running
- Typecheck 11/11, Lint 0 errores, Tests: platform 103, company-design 1504, temporal-worker 87 — todos pasan
- Fallos pre-existentes: web/department-canvas.test.tsx (1 test), drizzle-db (sin tests)

Grupo Q cerrado (AIR-030 + AIR-031 done).

AIR-032 completada — Eliminación total de artefactos Drizzle:
- `packages/drizzle-db/` eliminado completamente (src, dist, node_modules, config)
- Cero archivos `.ts` con referencia a drizzle en el monorepo
- Cero `package.json` con dependencias drizzle-orm, drizzle-kit o @the-crew/drizzle-db
- `pnpm install` exitoso: 11 workspace projects (antes 12)
- Typecheck 10/10, Lint 10/10, Tests: platform 103, company-design 1504, temporal-worker 87 — todos pasan
- Fallo pre-existente: web/department-canvas.test.tsx (1 test, no relacionado)

AIR-033 completada — Actualización de toda la documentación post-migración Prisma:
- CLAUDE.md: actualizado para reflejar que la fase AI Runtime Enablement está completa, Prisma es el ORM
- MEMORY.md: `packages/drizzle-db` reemplazado por `packages/prisma-db`, sección de persistencia actualizada
- docs/28: banner SUPERSEDED actualizado de Drizzle a Prisma
- docs/65: Epic 67 marcada como completada
- docs/66: AIR-033 marcada done, estado final del registry
- docs/67: ADR marcado como implementado
- Feedback memories actualizadas: referencia a Epic 67 como completada

Grupo R cerrado (AIR-032 + AIR-033 done).
Epic 67 (PostgreSQL + Prisma Migration) completada.
Todas las épicas de AI Runtime Enablement (59–65, 67) completadas.

No quedan tareas ejecutables en este registry.

## Contrato de uso con Claude Code
- `/tc-next` debe priorizar este registry mientras la fase activa sea AI Runtime Enablement.
- `/tc-run <task-id>` debe resolver tareas aquí antes que registries anteriores.
- Si una tarea cambia bootstrap, runtime o docs, revisar también:
  - `docs/59-ceo-interactive-bootstrap-runtime-spec.md`
  - `docs/60-foundation-documents-spec.md`
  - `docs/61-markdown-document-system-spec.md`
  - `docs/62-claude-container-runtime-spec.md`
  - `docs/63-temporal-orchestration-spec.md`
  - `docs/64-basic-autonomous-work-spec.md`
