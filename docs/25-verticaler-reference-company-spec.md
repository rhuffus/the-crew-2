# Verticaler — empresa de referencia canónica de TheCrew

## 1. Propósito del documento

Este documento define la **empresa de referencia viva** de TheCrew.

Verticaler no es un dato de demo opcional.
Es el ejemplo canónico con el que debe comprobarse que TheCrew puede:

- arrancar con una empresa usable;
- mostrar una organización completa en el canvas;
- navegar por niveles múltiples;
- editar entidades y relaciones desde el panel derecho;
- visualizar contratos, flujos, artefactos y gobierno;
- validar que la experiencia visual-first funciona de verdad.

Este documento debe mantenerse siempre sincronizado con:

- `docs/18-canvas-editor-v2-spec.md`
- `docs/03-backlog-completo.md`
- `docs/09-task-registry.md`

## 2. Regla de producto

Cuando TheCrew arranque en una instancia **vacía**, debe existir automáticamente un proyecto inicial:

- **nombre**: `Verticaler`
- **tipo**: empresa SaaS B2B
- **producto**: plataforma SaaS para la gestión de empresas de ascensores

La creación y evolución de Verticaler debe gestionarse como **migraciones versionadas de datos**.
No como fixtures ad hoc.
No como datos metidos manualmente desde la UI.
No como lógica especial del frontend.

## 3. Objetivos de Verticaler

Verticaler debe cumplir cuatro funciones a la vez:

### 3.1 Empresa de demo
Permite entrar en TheCrew y ver algo completo desde el minuto uno.

### 3.2 Empresa de validación
Permite verificar que el canvas, el inspector, la navegación multinivel y las vistas funcionan de forma integrada.

### 3.3 Empresa de regresión funcional
Cuando se añada una feature o cambie el modelo, Verticaler debe actualizarse para reflejarla y servir como prueba manual canónica.

### 3.4 Empresa de documentación ejecutable
La documentación del producto no debe describir una empresa imaginaria abstracta distinta.
Debe describir Verticaler.

## 4. Restricciones de implementación

### 4.1 Creación solo cuando la instancia esté vacía
Regla:
- si no existe ningún proyecto, se crea Verticaler;
- si ya existe al menos un proyecto, no se vuelve a crear automáticamente;
- las migraciones deben ser idempotentes.

### 4.2 Versionado por migraciones
Cada cambio en Verticaler debe introducirse como una migración explícita, auditable y repetible.

Ejemplos de cambios futuros:
- añadir un nuevo departamento;
- enriquecer capacidades;
- introducir nuevos artefactos;
- extender workflows;
- añadir políticas o relaciones visuales nuevas;
- poblar operaciones overlay cuando proceda.

### 4.3 Sincronización documental obligatoria
Toda migración que cambie Verticaler debe evaluar si también necesita tocar este documento.

## 5. Nota importante sobre el estado actual del repo

En el estado actual analizado del proyecto, los repositorios de `platform` y `company-design` son mayoritariamente **in-memory**.
Eso significa que hoy no existe todavía una base sólida de persistencia/migraciones reales para cumplir este requisito de forma honesta.

Por tanto, la feature Verticaler implica en la práctica:

1. definir un mecanismo de bootstrapping persistente;
2. definir un sistema de migraciones o data migrations coherente con la arquitectura real;
3. sembrar Verticaler sobre esa infraestructura.

Si no se hace eso, se puede simular un seed, pero no una solución correcta de “migraciones de base de datos”.

## 6. Identidad de Verticaler

### 6.1 Empresa
- **Project slug lógico**: `verticaler`
- **Nombre comercial**: `Verticaler`
- **Descripción**: SaaS para la gestión operativa, comercial y técnica de empresas de ascensores
- **Tipo de empresa**: SaaS B2B vertical
- **Scope**: España primero, multi-sede a futuro

### 6.2 Qué resuelve su producto
El producto de Verticaler ayuda a empresas de ascensores a gestionar:
- clientes;
- contratos de mantenimiento;
- parque de ascensores;
- inspecciones;
- averías e incidencias;
- planificación de técnicos;
- partes de trabajo;
- facturación y renovaciones;
- cumplimiento documental y auditoría.

## 7. Modelo operativo de referencia

## 7.1 Nivel 1 del canvas: empresa global
El primer nivel visual debe mostrar, como mínimo:
- CEO / company root
- Product
- Engineering
- Design
- Operations
- Customer Success
- Sales
- Finance & Admin
- Compliance / Quality

No todos tienen que ser departamentos hijos directos si el modelo final recomienda otra estructura, pero el nivel 1 debe ser comprensible de un vistazo.

## 7.2 Nivel 2 y multinivel
Cada bloque relevante debe permitir drilldown.
Ejemplos:

- Engineering → Platform, Backend, Frontend, QA
- Operations → Dispatch, Field Service, Incident Management
- Product → Discovery, Product Ops, Delivery Planning
- Compliance → Regulatory, Inspection Standards, Audit Readiness

## 7.3 Teams / Unit Containers
Los subdepartamentos del nivel 2 (Platform, Backend, QA, Dispatch, etc.) deben modelarse como **team/unit containers** según la paleta de nodos del canvas spec.
Esto permite que el drilldown L2→L3 funcione con nodos tipados, no solo con agrupaciones visuales.

## 8. Entidades mínimas que Verticaler debe traer de serie

## 8.1 Company Model
Debe incluir:
- propósito
- tipo
- scope
- principios de diseño

### Propósito sugerido
"Construir el sistema operativo para empresas de ascensores, conectando mantenimiento, incidencias, inspecciones, técnicos, contratos y facturación en una única plataforma."

### Principios sugeridos
- trazabilidad completa
- operaciones primero
- claridad contractual entre áreas
- seguridad y compliance visibles
- automatización sin perder supervisión
- visual-first para comprender la empresa

## 8.2 Departamentos mínimos
- Executive / CEO
- Product
- Engineering
- Design
- Operations
- Customer Success
- Sales
- Finance & Admin
- Compliance & Quality

## 8.3 Capacidades mínimas
- Product Discovery
- PRD Definition
- UX Design
- Technical Design
- Software Implementation
- QA Validation
- Release Management
- Incident Intake
- Field Dispatch Planning
- Maintenance Contract Management
- Elevator Asset Registry
- Inspection Management
- Work Order Processing
- Billing & Renewals
- Customer Support
- Compliance Monitoring

## 8.4 Roles mínimos
- CEO
- Head of Product
- Product Manager
- Head of Engineering
- Tech Lead
- Frontend Engineer
- Backend Engineer
- QA Lead
- Head of Operations
- Dispatch Coordinator
- Compliance Manager
- Customer Success Lead
- Sales Lead
- Finance Manager

## 8.5 Agentes / assignments mínimos
Verticaler debe incluir agentes suficientes para que el canvas no se vea hueco.
No hace falta “llenarlo de bots”, pero sí mostrar claramente cómo TheCrew modela una empresa.

Sugerencia mínima:
- CEO Agent
- Product Strategist Agent
- Product Ops Agent
- Design Lead Agent
- Engineering Manager Agent
- Frontend Builder Agent
- Backend Builder Agent
- QA Reviewer Agent
- Release Coordinator Agent
- Ops Coordinator Agent
- Compliance Reviewer Agent
- Customer Success Agent
- Sales Operations Agent
- Finance Ops Agent

## 8.6 Skills mínimas
- Draft PRD
- Refine Scope
- Map Workflow
- Define Contract
- Review UX
- Produce Tech Spec
- Implement Feature
- Review Code
- Design Test Plan
- Validate Release
- Analyze Incident
- Plan Dispatch
- Review Compliance
- Update Artifact Metadata

## 8.7 Contratos mínimos
Verticaler debe mostrar contratos reales y legibles entre áreas.
Ejemplos:
- Product → Design: handoff de PRD a design spec
- Design → Engineering: handoff de design package
- Engineering → QA: handoff de candidate build
- QA → Release: release validation contract
- Sales → Finance: closed won to billing activation
- Customer Success → Operations: incident escalation contract
- Operations → Compliance: inspection evidence contract

## 8.8 Workflows mínimos
Debe haber varios workflows de verdad, no uno solo.
Como mínimo:

### A. Product Delivery
PRD → Design → Tech Spec → Planning → Implement → Review → QA → Release

### B. Incident Management
Incident Intake → Triage → Dispatch → Field Resolution → Verification → Customer Update → Close

### C. Maintenance Contract Lifecycle
Lead / Renewal → Contract Setup → Asset Linkage → Schedule Maintenance → Execute Service → Invoice / Renew

### D. Inspection / Compliance
Inspection Scheduled → Evidence Collection → Findings Review → Remediation → Sign-off → Archive

## 8.9 Policies mínimas
- release approval policy
- production change gate
- compliance evidence retention policy
- incident severity escalation policy
- contract acceptance criteria policy

## 8.10 Artifacts mínimos
- PRD
- Design Spec
- Tech Spec
- Delivery Plan
- QA Report
- Release Note
- Incident Report
- Work Order
- Maintenance Contract
- Inspection Evidence
- Billing Activation Record
- Compliance Finding

## 8.11 Relaciones tipadas mínimas
Verticaler debe poblar ejemplos explícitos de cada tipo de relación definido en el canvas spec para garantizar cobertura visual completa.

| Tipo de relación | Ejemplo concreto en Verticaler |
|---|---|
| reports_to | Head of Engineering → CEO |
| owns | Engineering owns Software Implementation |
| assigned_to | Frontend Builder Agent assigned_to Frontend Engineer role |
| contributes_to | Design contributes_to Product Discovery |
| has_skill | Backend Builder Agent has_skill Implement Feature |
| compatible_with | Tech Lead compatible_with Review Code |
| provides | Engineering provides candidate build (contract con QA) |
| consumes | QA consumes candidate build |
| bound_by | Product Delivery workflow bound_by release approval policy |
| participates_in | Product Manager participates_in Product Delivery workflow |
| hands_off_to | Design hands_off_to Engineering (design package) |
| governs | compliance evidence retention policy governs Inspection/Compliance workflow |

Cada relación debe ser editable desde el inspector y visible en la vista correspondiente.

## 8.12 Workflow Stages explícitos
Cada workflow debe tener stages como entidades formales, no solo descripciones textuales.

### A. Product Delivery — stages
1. PRD Draft
2. Design Spec
3. Tech Spec
4. Sprint Planning
5. Implementation
6. Code Review
7. QA Validation
8. Release

### B. Incident Management — stages
1. Incident Intake
2. Triage
3. Dispatch
4. Field Resolution
5. Verification
6. Customer Update
7. Close

### C. Maintenance Contract Lifecycle — stages
1. Lead / Renewal
2. Contract Setup
3. Asset Linkage
4. Schedule Maintenance
5. Execute Service
6. Invoice / Renew

### D. Inspection / Compliance — stages
1. Inspection Scheduled
2. Evidence Collection
3. Findings Review
4. Remediation
5. Sign-off
6. Archive

Cada stage debe tener: nombre, orden, participant owner, artifacts de entrada/salida y handoffs, según la especificación del inspector del canvas spec.

## 9. Requisitos visuales de Verticaler en el canvas

Verticaler debe servir para probar visualmente todas las capacidades principales del editor.
Por tanto, el seed debe poblar relaciones suficientes para que tengan sentido estas vistas:

### 9.1 Vista Organization
- jerarquía clara de empresa y departamentos
- reporting lines
- nodos colapsables o navegables

### 9.2 Vista Capabilities
- ownership departamental
- contribuciones cruzadas
- dependencias

### 9.3 Vista Workflows
- varios procesos diferenciados
- participantes visibles
- handoffs reales

### 9.4 Vista Contracts
- edges contractuales editables
- criterios de aceptación visibles en inspector

### 9.5 Vista Artifacts
- circulación de artefactos entre áreas
- productores y consumidores

### 9.6 Vista Governance
- approvals, policies y puntos de control

### 9.7 Vista Operations
Si el overlay operacional está activo en el producto, Verticaler debe poblar datos mínimos coherentes para poder probar la vista.
Si no, al menos debe quedar preparada la estructura documental para introducirlos.

## 10. Requisitos de navegación

Verticaler debe permitir demostrar:
- entrada a nivel company;
- drilldown a department;
- drilldown a workflow;
- drilldown a stage o nodo específico;
- breadcrumb coherente;
- vuelta a niveles superiores sin perder contexto;
- filtros y capas que modifiquen la lectura sin romper la navegación.

## 11. Requisitos de inspector

Para cualquier nodo o edge relevante de Verticaler debe poder comprobarse en el panel derecho:
- overview
- propiedades
- relaciones
- contratos
- artefactos relacionados
- validaciones
- historial, si procede

Verticaler debe incluir suficientes ejemplos para que todas esas pestañas tengan contenido real.

## 12. Estrategia de migraciones de Verticaler

## 12.1 Filosofía
Verticaler debe evolucionar por **migraciones acumulativas y auditables**.

## 12.2 Capas de migración
Dado el diseño actual del sistema, la estrategia correcta debería separar:

### A. Migración platform
Crea el proyecto `Verticaler` si el sistema está vacío.

### B. Migraciones company-design
Pueblan por fases el modelo de la empresa:
- company model
- departments
- capabilities
- roles
- agent archetypes / assignments
- skills
- contracts
- workflows
- policies
- artifacts
- visual metadata / layouts si aplica

## 12.3 Orden sugerido de bootstrap
1. project
2. company model
3. departments
4. capabilities
5. roles
6. agents
7. skills
8. contracts
9. workflows
10. policies
11. artifacts
12. visual layout baseline
13. release inicial si el modelo lo requiere

## 12.4 Regla de idempotencia
Cada migración debe ser segura si se ejecuta dos veces.

## 13. Regla de mantenimiento continuo

Cada vez que TheCrew gane una capacidad relevante del canvas o del dominio:
- se evalúa si Verticaler debe reflejarla;
- si sí, se crea migración y se actualiza este documento.

Ejemplos:
- si se añade un nuevo tipo de nodo visual → Verticaler debe incorporarlo si es representativo;
- si se añade un nuevo tipo de relación → Verticaler debe mostrar al menos un ejemplo;
- si cambia el modelo de chat por scope → Verticaler debe describir cómo se manifiesta;
- si mejora governance o operations → Verticaler debe adaptarse.

## 14. Criterios de aceptación

La feature Verticaler se considera bien resuelta cuando:

1. una instancia vacía de TheCrew arranca con un proyecto `Verticaler` visible;
2. la creación no depende de clicks manuales en la UI;
3. el seed está gestionado como migraciones/versionado real, no como fixture temporal;
4. Verticaler permite recorrer visualmente la empresa y entender el producto;
5. el canvas muestra suficientes nodos/relaciones para probar todas las vistas principales;
6. el inspector tiene contenido real en los elementos principales;
7. este documento está sincronizado con el canvas spec y el backlog.

## 15. Checklist de sincronización con canvas spec

Cuando cambie `docs/18-canvas-editor-v2-spec.md`, validar en este documento:

| Área del canvas spec | Sección de Verticaler | Qué validar |
|---|---|---|
| Nodos v2 mínimos | §8.1–8.10 | Cada tipo de nodo tiene al menos un ejemplo en Verticaler |
| Relaciones v2 mínimas | §8.11 | Cada tipo de relación tiene un ejemplo concreto |
| Presets / Vistas | §9.1–9.7 | Verticaler puebla datos suficientes para cada vista |
| Navegación multinivel | §10 | Verticaler permite drilldown L1→L2→L3→L4 |
| Inspector por tipo | §11 | Cada tab del inspector tiene contenido real en Verticaler |
| Workflow stages | §8.12 | Stages formalizados con owner, artifacts y handoffs |
| Capas y filtros | §9 | Las relaciones y nodos cubren las capas mínimas |
| Chat contextual | §10 | Scopes company/department/workflow/node disponibles |
| Diff / releases | §14 | Verticaler incluye release inicial para habilitar diff |

Cuando cambie `docs/03-backlog-completo.md` o `docs/09-task-registry.md`, validar:
- que los épicos y tareas de Verticaler siguen alineados con la fase actual;
- que no hay tareas en conflicto con el contenido de esta especificación.

## 16. Estado de baseline

| Versión | Fecha | Estado | Notas |
|---|---|---|---|
| v1 | 2026-03-11 | **baseline aceptada** | Especificación canónica inicial. Validada contra canvas spec v2. Cubre todos los tipos de nodo, relaciones, vistas, navegación e inspector. |

Próximo hito de revisión: al completar VRT-003 (implementación del bootstrap automático).

## 17. Regla final

Si hay conflicto entre “hacer una demo rápida” y “mantener Verticaler como referencia canónica sostenible”, gana lo segundo.
Verticaler debe ser una empresa de ejemplo mantenible, no un parche visual para evitar la pantalla vacía.
