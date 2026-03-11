# Revisión de polish del estado actual de TheCrew

> **POL-001** — Revisión completa del repo el 2026-03-11.
> Sustituye a la versión anterior (preliminar, sin exploración de código).

## Alcance

Revisión exhaustiva del repositorio actual para fijar una lista priorizada de correcciones de polish **sin nuevas funcionalidades de producto**.

## Resumen ejecutivo

El repositorio está bien estructurado, con buena cobertura de tests (~1700 tests unitarios + 8 e2e specs) y typecheck/lint limpios. Los problemas principales no son de calidad de código sino de **honestidad técnica** (100% in-memory), **higiene del repo** y **pequeños defectos acumulados**.

## Estado del quality gate (2026-03-11)

| Gate | Resultado | Detalle |
|------|-----------|---------|
| typecheck | PASS | 8/8 tasks |
| lint | PASS (7 warnings) | 7x `no-explicit-any` en test files de `apps/web` |
| test | 1 FAIL | `department-canvas.test.tsx` falla (`canvas-loading` testid no encontrado). 1691/1692 pasan. |
| e2e | no ejecutado | requiere servicios levantados |

---

## 1. Hallazgos verificados — Prioridad ALTA

### H1. 100% de los repositorios son in-memory

**33 repositorios** entre ambos servicios, todos `Map<string, T>` en memoria.

- `services/platform`: 1 repo (InMemoryProjectRepository)
- `services/company-design`: 32 repos (departments, capabilities, contracts, workflows, roles, agent-archetypes, agent-assignments, skills, policies, artifacts, releases, saved-views, chat, comments, collaboration ×2, audit, operations ×4)

**Impacto:** reiniciar cualquier servicio destruye todo el estado. Saved views, chat, locks, audit y operations son efímeros aunque la UX sugiera persistencia.

**Acción recomendada (no en scope de polish):** ya cubierto por VRT-002. Polish debe limitarse a ajustar textos UX que prometan durabilidad (→ POL-004).

### H2. 1 test roto en `apps/web`

**Archivo:** `apps/web/src/__tests__/department-canvas.test.tsx`
**Test:** "should render loading state at department route"
**Error:** `Unable to find an element by: [data-testid="canvas-loading"]`

**Causa raíz:** TanStack Router lazy route loading + testing-library timeout. Corregido en POL-002 haciendo `renderWithRouter` async con `await router.load()`.

**Estado:** RESUELTO. Todos los tests pasan (1692/1692).

### H3. `ioredis` como dependencia fantasma

Ambos servicios (`platform`, `company-design`) declaran `ioredis@5.4.2` en `dependencies` pero **ningún archivo lo importa**. Es un vestigio de una integración Redis planificada pero no ejecutada.

**Acción:** eliminar de ambos `package.json`. Incluir en POL-003.

---

## 2. Hallazgos verificados — Prioridad MEDIA

### H4. 7 warnings de `no-explicit-any` en tests del frontend

**Archivos afectados:**
- `src/__tests__/use-operations.test.tsx` (2 warnings)
- `src/__tests__/validation-overlay.test.tsx` (1)
- `src/__tests__/visual-node-collab.test.tsx` (1)
- `src/__tests__/visual-nodes.test.tsx` (1)
- (+ 2 más en tests relacionados)

**Acción:** reemplazar `any` por tipos específicos o `unknown`. Incluir en POL-003.

### H5. Directorio raíz `src/` vacío y huérfano

`/the-crew-2/src/` existe, está vacío (solo `.` y `..`), no está trackeado en git. Es un artefacto de una estructura anterior.

**Acción:** eliminar el directorio. Incluir en POL-003.

### H6. `playwright-report/` presente en disco

El directorio `playwright-report/` existe en el working tree (contiene `index.html`). Está correctamente excluido de git via `.gitignore`, pero contamina el árbol de trabajo.

**Acción:** añadir `playwright-report/` al script `clean` o documentar que se limpia manualmente. Incluir en POL-003.

### H7. Inconsistencia de naming: `infra/` vs `infrastructure/`

En `services/company-design`, algunos módulos usan `infra/` y otros usan `infrastructure/` para la capa de infraestructura:

- **`infra/`:** company-model, departments, capabilities, contracts, workflows, roles, agent-archetypes, agent-assignments, skills, policies, artifacts, releases, audit, saved-views
- **`infrastructure/`:** chat, comments, collaboration, operations

**Acción:** unificar a un solo nombre (`infra/`). Incluir en POL-003.

### H8. `shared-types` no tiene tests

`packages/shared-types/package.json` tiene `"test": "echo 'No tests yet'"`. El paquete contiene ~1379 líneas con lógica de negocio real:
- `SCOPE_REGISTRY` (constantes de alcance)
- `CONNECTION_RULES` (15 reglas de conexión válida)
- `LAYER_DEFINITIONS` (capas visuales)
- `ROLE_PERMISSIONS` (permisos por rol)
- `buildManifest()` (construcción de manifiesto de permisos)

**Acción:** añadir tests para la lógica ejecutable de `shared-types`. Incluir en POL-003.

### H9. TODO pendiente en producción

**Archivo:** `apps/web/src/components/visual-shell/inspector/comments-tab.tsx:39`
```typescript
authorId: 'current-user', // TODO: real user from auth context
```

**Impacto:** hardcodea el autor de comentarios. No es un bug bloqueante (no hay auth system aún) pero debe documentarse como deuda técnica explícita.

**Acción:** documentar en este fichero. No corregir hasta que haya auth real.

### H10. Permisos hardcodeados en dev mode

Dos puntos del sistema devuelven permisos fijos de desarrollo:

1. `apps/api-gateway/src/company-model/permissions.controller.ts`: devuelve `project:editor` + `platform:member` siempre.
2. `apps/web/src/providers/permission-provider.tsx`: fallback `DEV_MANIFEST` con los mismos roles.

**Acción:** no corregir (no hay auth system), pero documentar claramente como deuda técnica. Incluir en POL-004.

---

## 3. Hallazgos verificados — Prioridad BAJA

### H11. Ficheros de test con naming mixto (`.test.ts` vs `.spec.ts`)

En `apps/api-gateway` coexisten `visual-graph.controller.spec.ts` y `visual-graph.controller.test.ts`.

**Acción:** unificar a `.test.ts` (convención mayoritaria). Incluir en POL-003.

### H12. Dockerfile.nestjs usa mutaciones `sed` frágiles

`infra/docker/Dockerfile.nestjs` modifica `package.json` de `shared-types` y `domain-core` durante el build con `sed` para convertir ESM → CJS. Es funcional pero frágil.

**Acción:** considerar pre-generar variantes CJS o usar un build script dedicado. Baja prioridad, no bloquea.

### H13. Campo `types` en package.json apunta a `src/` en vez de `dist/`

`packages/domain-core` y `packages/shared-types` declaran `"types": "./src/index.ts"` en vez de `"./dist/index.d.ts"`. Funciona por resolución de TypeScript pero es técnicamente incorrecto para consumers externos.

**Acción:** corregir a `./dist/index.d.ts`. Incluir en POL-003.

### H14. Archivos grandes que podrían beneficiarse de splitting

| Archivo | Líneas | Contexto |
|---------|--------|----------|
| `apps/web/src/components/visual-shell/canvas-viewport.tsx` | 753 | Canvas principal |
| `apps/web/src/stores/visual-workspace-store.ts` | 640 | Store con deprecated fields |
| `apps/web/src/lib/graph-to-flow.ts` | 585 | Conversión domain→flow |
| `apps/api-gateway/src/company-model/company-design.client.ts` | 868 | HTTP client con 65 métodos |
| `packages/shared-types/src/index.ts` | 1379 | Todas las definiciones de tipo |

**Acción:** no refactorizar ahora (no es polish, es mejora interna). Documentar como deuda técnica para futuro.

### H15. Deprecated fields en `visual-workspace-store.ts`

```typescript
/** @deprecated Use ScopeType instead */
export type CanvasView = 'org' | 'department' | 'workflow'
/** @deprecated Use currentScope.scopeType */
currentView: CanvasView
/** @deprecated Use currentScope.zoomLevel */
zoomLevel: ZoomLevel
/** @deprecated Use currentScope.entityId */
scopeEntityId: string | null
```

**Acción:** evaluar si la migración está completa y se pueden eliminar. Incluir en POL-003 si es seguro.

### H16. Dependencias de producción en root `package.json`

El root `package.json` lista `@xyflow/react`, `react-resizable-panels` y `zustand` como `dependencies` en vez de estar solo en `apps/web/package.json`. No causa problemas funcionales pero es conceptualmente incorrecto para un monorepo.

**Acción:** mover a `apps/web/package.json` si no están ya ahí (verificado: ya están en web también). Eliminar del root. Incluir en POL-003.

---

## 4. Hallazgos NO confirmados (del review anterior)

Los siguientes hallazgos del review preliminar se verificaron y **no son problemas reales**:

| Hallazgo previo | Estado verificado |
|-----------------|-------------------|
| P4. Artefactos generados en git | `.gitignore` cubre correctamente dist/, coverage/, .turbo/, .DS_Store. Ninguno está trackeado. |
| P5. Documentación no encadenada | Ya se creó `docs/25-verticaler-reference-company-spec.md` y la regla de sincronización en CLAUDE.md. |
| P6. Backlog/registry obsoleto | Ya se creó `docs/09-task-registry.md` con la fase Verticaler + Polish. |
| P7. Divergencia producto/ejemplo | Ya cubierta por regla documental en CLAUDE.md. |

---

## 5. Checklist priorizado de correcciones de polish

### Para POL-002 (limpieza documental) — DONE
- [x] Revisar y limpiar CLAUDE.md para reflejar la nueva fase
- [x] Verificar coherencia backlog ↔ registry ↔ Verticaler spec
- [x] Documentar deuda técnica explícita: auth hardcodeado, persistencia in-memory (nueva sección en CLAUDE.md)
- [x] Reescribir README.md como README real del proyecto (era un overlay doc)
- [x] Corregir colisión de numeración docs/26 (renombrado persistence strategy a docs/28)
- [x] Añadir sección "Documentos entregables" al task registry

### Para POL-003 (higiene del repo) — DONE
- [x] Corregir test roto `department-canvas.test.tsx` (H2) — ya estaba corregido (`renderWithRouter` es async con `router.load()`)
- [x] Eliminar `ioredis` de ambos servicios (H3)
- [x] Corregir todos los warnings `no-explicit-any` en tests — 15 warnings eliminados en web, api-gateway y company-design (H4)
- [x] Eliminar directorio huérfano `src/` en raíz (H5)
- [x] Unificar naming `infra/` vs `infrastructure/` en company-design — 4 módulos renombrados, 17 imports actualizados (H7)
- [x] Añadir tests para lógica ejecutable de `shared-types` — 57 tests nuevos (H8)
- [x] Unificar naming de tests a `.test.ts` — 17 archivos renombrados, 1 duplicado eliminado (H11)
- [x] Corregir campo `types` en package.json de domain-core y shared-types (H13)
- [x] Evaluar deprecated fields en visual-workspace-store (H15) — NO eliminados: `currentView` y `setView` tienen consumidores activos en `canvas-toolbar.tsx` y `diff.tsx`
- [x] Mover dependencias de producción del root package.json a apps/web (H16) — ya estaban en web, eliminadas del root
- [x] Limpiar `playwright-report/` del working tree (H6)

### Para POL-004 (honestidad de persistencia) — DONE
- [x] Revisar textos UX que sugieran durabilidad en saved views, chat, locks, audit — "Saved successfully" → "Updated", "Saving..." → "Updating...", "audit trail" → "audit log", saved views heading hints "(session)"
- [x] Documentar permisos hardcodeados como deuda técnica explícita (H10) — TODO comments added to lock-indicator, review-indicator, permission-provider, use-permissions
- [x] Añadir disclaimer visible en dev mode sobre estado efímero — DevModeBanner component renders in both visual shell and admin shell when `import.meta.env.DEV`

---

## 6. Qué NO propone este documento

- Añadir nuevas superficies funcionales
- Cambiar el paradigma visual-first
- Migrar a persistencia real (eso es VRT-002)
- Refactorizar archivos grandes (no es polish)
- Implementar auth real (no es polish)

---

## 7. Conclusión

El repo está en buen estado general. Los problemas son de **honestidad** (in-memory presentado como durable), **higiene** (dependencias fantasma, naming inconsistente, test roto) y **pequeña deuda acumulada** (deprecated fields, hardcoded auth). Todo corregible sin abrir nuevas funcionalidades.
