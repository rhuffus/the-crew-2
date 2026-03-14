# ADR 67 — Migración de Drizzle a Prisma + Database-per-Service

## Estado
Implementada — 2026-03-13 (AIR-021 a AIR-033 completadas)

## Contexto

### Problema con Drizzle + persistencia dual

Los servicios `platform` y `company-design` usan un sistema dual de persistencia controlado por `isPersistenceModeDrizzle()`:
- Si `PERSISTENCE_MODE=drizzle`, usan repositorios Drizzle contra PostgreSQL
- Si no, caen a repositorios in-memory

En la práctica, el pod de PostgreSQL no arranca consistentemente en el cluster k3d. Cuando esto ocurre, ambos servicios degradan silenciosamente a repos in-memory, perdiendo todos los datos en cada restart sin ningún error visible.

### Deuda técnica con Drizzle

- 32 archivos `drizzle-*.repository.ts` + 34 schemas manuales
- `drizzle.config.ts` en cada servicio sin integrarse al lifecycle de NestJS
- Migraciones gestionadas externamente via `db-migrate.yaml` Job
- Sin auto-migrate al arrancar el servicio
- El paquete `packages/drizzle-db` es un wrapper fino que no aporta suficiente valor

### Motivaciones para Prisma

- **Schema declarativo** con generación automática de tipos y cliente
- **Migraciones integradas** (`prisma migrate deploy` al arrancar)
- **Introspección** (`prisma db pull`) para validar schemas
- **Ecosistema maduro**: studio, seed, format
- **Mejor DX** para un equipo pequeño: menos boilerplate, tipos generados
- **Transacciones interactivas** (`$transaction()`) equivalentes a lo que ya usa `company-design`

## Decisión

1. **Reemplazar Drizzle ORM por Prisma ORM** en ambos servicios
2. **Database-per-service**: cada microservicio tiene su propio PostgreSQL
3. **Eliminar el modo in-memory** de los módulos NestJS (solo permitido en tests unitarios directos)
4. **Cada servicio ejecuta sus migraciones al arrancar** via init container o entrypoint

## Consecuencias

### Positivas
- El servicio falla al arrancar si la DB no está disponible → no más degradación silenciosa
- Un schema Prisma por servicio reemplaza 34 schemas Drizzle manuales
- Tipos generados automáticamente por `prisma generate`
- Migraciones versionadas y reproducibles
- Database-per-service permite escalar y evolucionar schemas independientemente
- Elimina ~35 archivos de configuración/schema Drizzle
- Simplifica 30 módulos NestJS (sin ternario de persistencia)

### Negativas
- Migración de 32 repositorios (esfuerzo concentrado)
- Prisma Client es más opinionado que Drizzle (menos control SQL directo)
- ~~Dos pods PostgreSQL en vez de uno~~ — resuelto en ADR 68: consolidado a 1 instancia con N databases
- `prisma generate` añade un paso al build Docker

### Neutrales
- Los 32 repositorios InMemory se mantienen para tests unitarios (uso directo, sin DI)
- El patrón Repository del dominio no cambia, solo la implementación
- La interfaz de cada repository permanece idéntica

## Estrategia de migración

### Fase 1 — Infraestructura base
- Crear `packages/prisma-db` (PrismaModule, token, base service)
- Dos pods PostgreSQL en k8s (platform, company-design)

### Fase 2 — Platform (proof of concept)
- 1 schema Prisma, 1 modelo (Project)
- Migración, verificación e2e
- Eliminar Drizzle de platform

### Fase 3 — Company-design (migración completa)
- Schema Prisma con 33 modelos
- Conversión en 3 batches:
  - Batch 1: core domain (8 repos)
  - Batch 2: agents/artifacts/audit/chat/collab (9 repos)
  - Batch 3: operations/runtime/LCP/new (14 repos)
- Verificación e2e

### Fase 4 — Limpieza
- Eliminar `packages/drizzle-db` completo
- Eliminar todos los schemas Drizzle
- Eliminar todos los `drizzle-*.repository.ts`
- Limpiar dependencias
- Actualizar documentación

## Inventario de archivos afectados

### A eliminar
| Tipo | Cantidad | Ubicación |
|------|----------|-----------|
| Paquete completo | 1 | `packages/drizzle-db/` |
| Config files | 2 | `services/*/drizzle.config.ts` |
| Schema dirs | 2 | `services/*/src/drizzle/` (34 schemas total) |
| Repository files | 32 | `services/*/src/**/drizzle-*.repository.ts` |
| k8s manifests | 2 | `infra/k8s/postgres.yaml`, `infra/k8s/db-migrate.yaml` |

### A crear
| Tipo | Cantidad | Ubicación |
|------|----------|-----------|
| Paquete compartido | 1 | `packages/prisma-db/` |
| Prisma schemas | 2 | `services/*/prisma/schema.prisma` |
| Prisma services | 2 | `services/*/src/prisma/*-prisma.service.ts` |
| Repository files | 32 | `services/*/src/**/prisma-*.repository.ts` |
| k8s manifests | 2 | `infra/k8s/postgres-platform.yaml`, `infra/k8s/postgres-company-design.yaml` |

### A modificar
| Tipo | Cantidad | Cambio |
|------|----------|--------|
| NestJS modules | 30 | Eliminar ternario, siempre Prisma |
| app.module.ts | 2 | PrismaModule en vez de DrizzleModule |
| Dockerfile | 1 | prisma-db build + `prisma generate` |
| Tiltfile | 1 | Dos recursos postgres, deps actualizadas |
| k8s deployments | 2 | DATABASE_URL actualizado, sin PERSISTENCE_MODE |

## Riesgos y mitigaciones

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| Schema mismatch Drizzle → Prisma | Alta | Comparar column-by-column. Usar `prisma db pull` para validar |
| jsonb/Array tipos distintos | Media | Prisma `Json` type + casting en repo. Tests unitarios validan |
| Transacciones (`db.transaction()`) | Media | `$transaction()` interactive mode es equivalente directo |
| Build Docker más complejo | Media | Probar en AIR-031 antes de limpiar Drizzle |
| Tests rotos | Baja | Tests usan InMemory repos directamente, no pasan por DI |

## Referencias
- [Prisma docs](https://www.prisma.io/docs)
- `docs/65-ai-runtime-backlog-v6.md` — Epic 67
- `docs/66-ai-runtime-task-registry.md` — AIR-021 a AIR-033
- Feedback memory: `feedback_no-inmemory-runtime.md`
