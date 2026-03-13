# Backlog completo de TheCrew (v4 — Verticaler + Polish)

> **SUPERSEDED** — Esta fase está completada. El backlog activo es ahora
> **`docs/38-live-company-backlog-v5.md`** (Live Company Pivot).
> Este archivo se conserva como referencia histórica.

## Contexto
Canvas Editor v2 ya existe y debe considerarse la base del producto actual.
La siguiente fase no consiste en abrir nuevas funcionalidades grandes, sino en:

1. introducir una **empresa de referencia viva** llamada **Verticaler**;
2. garantizar que una instancia vacía arranca con algo usable;
3. pulir el estado actual del producto y de la documentación.

---

## Epic 46 — Verticaler Reference Company
Objetivo: crear una empresa de referencia canónica, siempre disponible al arrancar vacío.

### Hitos
- especificación exhaustiva de Verticaler
- estrategia de bootstrap y migraciones
- creación automática de Verticaler en instancia vacía
- baseline completa de company model, departments, capabilities, roles, agents, skills, contracts, workflows, policies y artifacts
- sincronización continua entre Verticaler y canvas spec

---

## Epic 47 — Persistence Honesty & Bootstrap Reliability
Objetivo: alinear la nueva feature Verticaler con una historia honesta de persistencia y arranque.

### Hitos
- identificar qué módulos siguen in-memory
- definir el punto real de bootstrap
- formalizar cómo se ejecutan data migrations / seed migrations
- dejar comportamiento idempotente y seguro
- aclarar textos/documentación donde hoy la persistencia sea solo parcial

---

## Epic 48 — Current-State Polish
Objetivo: pulir el producto actual sin abrir nuevas superficies funcionales de producto.

### Hitos
- revisión del estado actual
- limpieza de inconsistencias documentales
- actualización de backlog/registry/CLAUDE commands
- hardening de experiencia inicial
- limpieza de artefactos generados y ruido del repo

---

## Epic 49 — Verticaler Coverage Maintenance
Objetivo: convertir Verticaler en la empresa canónica para probar TheCrew de punta a punta.

### Hitos
- matriz de cobertura entre canvas spec y Verticaler
- regla de actualización obligatoria
- checklist manual de smoke test sobre Verticaler
- actualización de Verticaler ante nuevas features del producto

---

## Orden recomendado
1. Epic 46
2. Epic 47
3. Epic 48
4. Epic 49

---

## Regla de implementación
No seguir ampliando el producto antes de cerrar:
- startup con empresa de referencia;
- coherencia mínima de persistencia/bootstrapping;
- polish documental y de repo.
