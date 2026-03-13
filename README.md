# TheCrew

Plataforma para **crear, cultivar y operar empresas IA vivas**.

## Qué es ahora TheCrew

TheCrew deja de tratar cada proyecto como una empresa completamente diseñada desde el principio y pasa a tratarlo como una **empresa viva** que:

- nace con una semilla mínima
- empieza con un **CEO agent**
- se organiza progresivamente
- propone su propia estructura
- crea departamentos, equipos y especialistas mínimos cuando lo necesita
- define contratos, workflows, documentos y reglas de forma incremental
- opera en tiempo real con observabilidad completa

## Enfoque del producto

La vista principal del producto ya no debe ser “capas abstractas de entidad”, sino:

1. **estructura organizativa**
2. **agentes responsables**
3. **trabajo y comunicación**
4. **estado vivo de la empresa**

## Principios del pivot

- **No big-bang rewrite**
- **Reutilizar la base técnica actual**
- **Migrar el canvas a una semántica más humana**
- **Empresa viva y gobernada, no autonomía caótica**
- **Diseño y runtime como dos modos del mismo sistema**

## Desarrollo local

### Requisitos
- Node >= 22
- pnpm
- k3d + Tilt (para entorno con PostgreSQL)

### Sin k3d (in-memory, solo desarrollo rápido)
```bash
pnpm install
PERSISTENCE_MODE=in-memory pnpm turbo run dev
```

### Con k3d (producción-paridad, PostgreSQL real)
```bash
tilt up
```

Tilt arranca:
- **PostgreSQL 16** con schemas `platform` y `company_design`
- **Redis** para pub/sub
- **platform** y **company-design** services con hot-reload
- **api-gateway** como BFF
- **web** frontend

### Base de datos
- ORM: **Drizzle**
- Driver: `postgres` (postgres.js)
- Schemas: `platform`, `company_design` (1 instancia PostgreSQL, 2 schemas lógicos)
- `PERSISTENCE_MODE=drizzle` (default) usa PostgreSQL real
- `PERSISTENCE_MODE=in-memory` usa Map<> en memoria (tests unitarios)

```bash
# Generar migraciones
pnpm --filter @the-crew/company-design-service run db:generate
pnpm --filter @the-crew/platform-service run db:generate

# Aplicar migraciones
pnpm --filter @the-crew/company-design-service run db:migrate
pnpm --filter @the-crew/platform-service run db:migrate
```

## Documentación canónica del pivot

- `docs/31-live-company-pivot-decision.md`
- `docs/32-live-company-repo-analysis.md`
- `docs/33-live-company-domain-model.md`
- `docs/34-live-company-canvas-v3-spec.md`
- `docs/35-live-company-growth-protocol.md`
- `docs/36-live-company-runtime-live-mode-spec.md`
- `docs/37-live-company-migration-strategy.md`
- `docs/38-live-company-backlog-v5.md`
- `docs/39-live-company-task-registry.md`
