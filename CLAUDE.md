# TheCrew

TheCrew es una plataforma multi-proyecto para diseñar, gobernar y operar empresas autónomas versionadas.
Cada proyecto representa una empresa concreta.

## Reenfoque actual
TheCrew pasa a un enfoque **visual-first**.

La app no debe sentirse principalmente como un conjunto de pantallas CRUD, sino como un **editor visual semántico** donde el usuario navega toda la empresa mediante diagramas drag & drop multinivel con semantic zoom.

## Principio rector de producto
El diagrama es la interfaz principal del sistema.
No es una ilustración ni una vista secundaria.
El diagrama debe editar el modelo real del dominio.

## Fuente de verdad
- Las entidades de dominio siguen siendo la verdad semántica.
- El canvas es la verdad de navegación y edición visual.
- El layout visual nunca debe introducir semántica por sí mismo.
- Las conexiones del diagrama sí representan relaciones reales y tipadas.

## Modelo mental del producto
Cada workspace de proyecto debe ofrecer:
- sidebar izquierdo con explorer, artefactos, búsqueda, capas y validación
- canvas central visual
- panel derecho inspector/editor contextual
- chat persistente por scope
- barra superior con proyecto, breadcrumb, release/draft, filtros y vista activa

## Niveles visuales esperados
1. Empresa
2. Departamento
3. Sub-sistema / proceso / workflow
4. Elemento detallado

El zoom debe ser semántico, no solo gráfico.

## Lenguaje ubicuo base
- Platform
- Project
- Company Workspace
- Company Model
- Visual Workspace
- Canvas View
- Node
- Edge
- Semantic Zoom
- Inspector
- Explorer
- Scope Chat
- Release
- Department
- Capability
- Role
- Agent Archetype
- Agent Assignment
- Skill
- Contract
- Workflow
- Policy
- Artifact
- Run

## Reglas duras
1. No degradar el dominio a una pizarra libre.
2. No usar nodos o edges genéricos sin tipo semántico.
3. No acoplar el modelo visual a Claude Code ni a ningún runtime.
4. No hacer que la web reconstruya el grafo completo uniendo entidades arbitrariamente desde el cliente.
5. Introducir una proyección o read model visual específica para el canvas.
6. Mantener las vistas tabulares y formularios como apoyo, no como centro del producto.
7. No cerrar una tarea si fallan lint, typecheck, tests o cobertura del scope.
8. No cerrar una tarea sin actualizar documentación/backlog cuando cambie el modelo o el plan.
9. Preferir una tarea por sesión de Claude Code.
10. Si una tarea es grande o toca muchos archivos, empezar en Plan Mode.
11. `/tc-next` debe bastar para decidir la siguiente tarea. No esperar un prompt humano adicional.
12. `/tc-run <task-id>` debe bastar para ejecutar la tarea. No pedir un prompt humano adicional salvo bloqueo real.

## Stack objetivo
- TypeScript en todo
- Monorepo con pnpm + turbo
- Backend: NestJS
- Integración entre micros: Redis
- Frontend: Vite + React + TanStack + Tailwind + shadcn/ui
- Editor visual: canvas con nodos, edges, inspector y semantic zoom
- Testing: unit, integration, functional, e2e y Playwright
- Coverage obligatorio del 100% en el scope tocado

## Realidad actual del repo
El repositorio ya cubre buena parte del dominio CRUD inicial (Projects, Company Model, Departments, Capabilities, Roles, Agents, Skills, Contracts, Workflows, Policies, Releases, Validation y Audit), pero todavía no está reenfocado a visual-first.

## Prioridad actual
Construir el primer eje del nuevo producto:
1. gramática visual
2. read model / graph projection
3. canvas shell
4. inspector
5. navegación multinivel
6. overlays de validación
7. chat por scope

## Flujo de trabajo con Claude Code
- `/tc-next`: sincroniza backlog y propone la siguiente tarea y paralelización posible
- `/tc-run <task-id>`: ejecuta una tarea concreta siguiendo gates y documentación
- `/quality-gate`: gate de calidad antes de cerrar tarea

## Contrato operativo de slash commands
### `/tc-next`
Debe:
- leer backlog y task registry
- decidir la siguiente tarea desbloqueada
- indicar si conviene sesión nueva
- indicar si debe arrancarse en plan o edit
- listar tareas paralelizables
- devolver el comando exacto siguiente
- no pedir prompt humano adicional

### `/tc-run <task-id>`
Debe:
- resolver y validar la tarea en el registry
- leer el contexto mínimo suficiente
- ejecutar el alcance de la tarea sin pedir un prompt adicional
- bloquearse solo si faltan dependencias reales o hay una decisión externa imprescindible
- ejecutar quality gate al final
- actualizar el task registry si cambia el estado real

## Higiene de sesión
- Preferir una tarea por sesión.
- Si `/tc-next` indica `fresh-session: yes`, cerrar la sesión y abrir otra.
- Usar `.claude/bin/tc-plan` para planificación o tareas grandes.
- Usar `.claude/bin/tc-edit` para implementación cuando la tarea ya está clara.
- Si el contexto ya está contaminado, usar `/clear` o empezar una sesión nueva.
