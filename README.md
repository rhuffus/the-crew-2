# TheCrew

Plataforma visual-first para diseñar, gobernar y operar empresas autónomas versionadas.

## Qué es

TheCrew permite modelar una empresa completa — departamentos, capacidades, roles, agentes, contratos, workflows, políticas y artefactos — y navegarla visualmente desde un canvas multinivel con inspector, filtros y vistas semánticas.

## Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Frontend**: Vite + React + TanStack Router + Tailwind + shadcn/ui + XYFlow
- **Backend**: NestJS microservices (platform, company-design)
- **Dominio**: DDD con domain-core compartido
- **Testing**: Vitest + Playwright
- **Infra local**: k3d + Tilt

## Estructura

```
apps/
  web/              → UI visual-first (canvas, explorer, inspector)
  api-gateway/      → BFF NestJS

services/
  platform/         → Gestión de proyectos
  company-design/   → Modelo de empresa (DDD)

packages/
  domain-core/      → Primitivas DDD (Entity, ValueObject, AggregateRoot, etc.)
  shared-types/     → Tipos compartidos, reglas de conexión, permisos
  tsconfig/         → Configuración TS compartida
  eslint-config/    → ESLint 9 flat config
```

## Requisitos

- Node >= 22
- pnpm >= 9

## Desarrollo

```bash
pnpm install
pnpm dev          # Arranca todos los servicios en paralelo
pnpm typecheck    # Verifica tipos
pnpm lint         # Linting
pnpm test         # Tests unitarios
pnpm test:e2e     # Tests e2e (requiere servicios levantados)
```

## Empresa de referencia: Verticaler

TheCrew incluye **Verticaler**, una empresa SaaS B2B de gestión de ascensores que se crea automáticamente en instancias vacías. Verticaler sirve como demo, validación funcional y documentación ejecutable del producto.

Spec completa: `docs/25-verticaler-reference-company-spec.md`

## Fase actual

**Verticaler + Polish** — consolidar el producto existente sin abrir funcionalidades nuevas. Ver `docs/09-task-registry.md`.

## Documentación

| Documento | Contenido |
|---|---|
| `docs/03-backlog-completo.md` | Backlog de producto |
| `docs/09-task-registry.md` | Registry de tareas ejecutables |
| `docs/18-canvas-editor-v2-spec.md` | Especificación del canvas editor |
| `docs/25-verticaler-reference-company-spec.md` | Spec de Verticaler |
| `docs/26-current-state-polish-review.md` | Revisión de estado actual y deuda técnica |
| `docs/28-persistence-bootstrap-strategy.md` | Estrategia de bootstrap y persistencia |
| `CLAUDE.md` | Instrucciones para Claude Code |
