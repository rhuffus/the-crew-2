# ADR 68 — Consolidar 3 instancias PostgreSQL en 1

## Estado
Implementada — 2026-03-13

## Contexto

Tras la migración a Prisma (ADR 67), el cluster k3d desplegaba **3 pods PostgreSQL independientes** (`postgres-platform`, `postgres-company-design`, `postgres-temporal`), cada uno con su PVC, Deployment y Service. Esto consumía recursos innecesarios (~768Mi RAM, 3 PVCs) y no reflejaba cómo operaría el sistema en producción, donde habría una sola instancia con múltiples bases de datos.

## Decisión

Consolidar en **1 sola instancia PostgreSQL** con:
- **4 bases de datos**: `platform`, `company_design`, `temporal`, `temporal_visibility`
- **3 usuarios de servicio** con permisos mínimos: `svc_platform`, `svc_company_design`, `svc_temporal`
- Cada usuario es OWNER de su(s) DB(s) — puede crear tablas y ejecutar migraciones
- `REVOKE CONNECT ON DATABASE ... FROM PUBLIC` — aislamiento real entre servicios
- **1 superuser** (`thecrew_admin`) solo para administración, nunca usado por servicios

### Init script

Un ConfigMap monta el SQL de inicialización en `/docker-entrypoint-initdb.d/`. PostgreSQL lo ejecuta automáticamente en el primer arranque.

### Temporal auto-setup

La imagen `temporalio/auto-setup` crea las databases `temporal` y `temporal_visibility` si no existen. Si ya existen (creadas por nuestro init script), las reutiliza. El usuario `svc_temporal` como OWNER tiene permisos completos para crear tablas en ambas.

## Consecuencias

### Positivas
- De 3 pods a 1 — reduce consumo de CPU, RAM y almacenamiento en dev local
- De 3 PVCs a 1 — simplifica la gestión de volúmenes
- Modelo de permisos explícito (OWNER per DB, REVOKE PUBLIC)
- Refleja mejor el modelo de producción (1 instancia managed, N databases)
- Simplifica el Tiltfile (1 recurso `postgres` en vez de 3)

### Negativas
- Un solo punto de fallo en dev local (si postgres cae, caen todos los servicios)
- El PVC debe ser más grande (2Gi en vez de 3x1Gi, pero en la práctica usa menos)

### Neutrales
- El patrón database-per-service se mantiene intacto (separación lógica, no física)
- Las migraciones Prisma siguen funcionando igual (init containers)
- Los `DATABASE_URL` cambian de host pero la semántica es idéntica

## Notas sobre producción

- Los passwords vendrían de Kubernetes Secrets (no hardcodeados)
- La instancia PostgreSQL sería un managed service (RDS, Cloud SQL, etc.)
- El init script se ejecutaría como parte del provisioning de infraestructura (Terraform/Pulumi)
- El modelo de permisos (OWNER per DB, REVOKE PUBLIC) aplica igual

## Archivos afectados

| Accion   | Archivo |
|----------|---------|
| CREAR    | `infra/k8s/postgres.yaml` (Deployment + ConfigMap + PVC + Service) |
| ELIMINAR | `infra/k8s/postgres-platform.yaml` |
| ELIMINAR | `infra/k8s/postgres-company-design.yaml` |
| ELIMINAR | `infra/k8s/postgres-temporal.yaml` |
| EDITAR   | `infra/k8s/platform.yaml` (DATABASE_URL) |
| EDITAR   | `infra/k8s/company-design.yaml` (DATABASE_URL) |
| EDITAR   | `infra/k8s/temporal.yaml` (POSTGRES_SEEDS, USER, PWD) |
| EDITAR   | `Tiltfile` (consolidar recursos) |

## Referencias
- `docs/67-prisma-migration-adr.md` — ADR previa de Prisma
- `infra/k8s/postgres.yaml` — manifiesto consolidado
