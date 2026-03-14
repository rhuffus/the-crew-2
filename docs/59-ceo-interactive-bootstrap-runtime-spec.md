# CEO Interactive Bootstrap Runtime Spec

## Objetivo
Reemplazar el bootstrap “semi-estático” actual por un bootstrap conversacional real impulsado por IA.

## Nuevo flujo de creación de proyecto

### Paso 1 — Create Project
El diálogo de creación solo pide:
- `name`
- `shortDescription`

Nada más.

### Paso 2 — Immediate landing
Tras guardar:
- se crea el proyecto
- se crea el `ProjectSeed` mínimo
- se crea la `Company UO`
- se crea el `CEO bootstrap agent`
- se abre el canvas del proyecto
- la Company node aparece visible
- el chat dock se abre automáticamente en modo CEO bootstrap

### Paso 3 — CEO kickoff message
El CEO envía automáticamente:
- presentación
- resumen de lo que sabe
- primeras preguntas
- propuesta de cómo va a trabajar con el usuario

### Paso 4 — Conversación de bootstrap
El CEO:
- pregunta
- resume
- propone
- corrige
- detecta huecos
- crea o actualiza documentos base
- pide confirmaciones
- sugiere próximos pasos

### Paso 5 — Bootstrap completion
Cuando el CEO y el usuario acuerdan que hay suficiente base:
- se marca el bootstrap como completed o ready-to-grow
- el CEO puede empezar a proponer departamentos, equipos y primeros especialistas

## Roles del CEO bootstrap agent
Durante esta fase el CEO:
- es entrevistador
- sintetizador
- redactor de documentos
- guardián de coherencia
- iniciador de proposals de estructura mínima

No debe:
- crear estructura arbitraria sin justificación
- arrancar decenas de agentes sin necesidad
- convertir la conversación en teoría infinita

## Outputs obligatorios del bootstrap
Antes de considerar el bootstrap “suficiente”, deben existir al menos:
- company overview
- mission & vision
- founder constraints / preferences
- initial objectives
- initial roadmap
- initial backlog
- bootstrap decisions log

## Estado del bootstrap
Estados sugeridos:
- `not-started`
- `collecting-context`
- `drafting-foundation-docs`
- `reviewing-foundation-docs`
- `ready-to-grow`
- `growth-started`

## Conversación y documentos
Cada mensaje del CEO puede:
- no hacer cambios
- proponer cambio documental
- aprobar documento
- generar nuevo documento
- abrir una proposal
- avanzar el estado del bootstrap

## Integración con runtime
La conversación no debe hablar directamente con Claude Code desde el frontend.
Debe pasar por un workflow de runtime:
1. user message accepted
2. append chat event
3. start/continue bootstrap workflow
4. call assistant activity
5. persist assistant response
6. persist document patches / proposal drafts
7. emit runtime events al frontend

## Company node como hub
La Company node debe exponer:
- seed summary
- bootstrap status
- linked foundation documents
- recent decisions
- pending proposals
- last CEO activity
