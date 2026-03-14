# Markdown Document System Spec

## Objetivo
Introducir un sistema real de documentos Markdown dentro de TheCrew.

## Casos de uso iniciales
- documentos fundacionales del proyecto
- documentos generados por el CEO bootstrap
- edición manual por parte del usuario
- revisión y propuesta de cambios por parte del CEO
- apertura desde el inspector de la Company node

## Requisitos de UX
- ver lista de documentos desde inspector lateral
- abrir un documento en modal
- editar en modo visual
- alternar a modo source Markdown
- guardar
- ver metadata básica
- permitir mencionar el documento al CEO en el chat

## Requisitos de dominio
Cada documento debe poder:
- pertenecer a un proyecto
- estar vinculado a una o varias entidades
- registrar autor/fuente
- tener revisiones simples
- emitir eventos de actualización
- participar en workflows y proposals

## Requisitos de datos
Modelo mínimo:
- documentId
- projectId
- slug
- title
- bodyMarkdown
- status
- linkedEntityIds
- linkedWorkflowIds
- createdAt
- updatedAt
- lastUpdatedBy
- sourceType (`user|agent|system`)

## Editor recomendado
Primera opción recomendada: **MDXEditor**
Razones:
- acepta y emite Markdown como string
- está específicamente diseñado para restricciones de Markdown
- ofrece toolbar extensible
- soporta source/diff mode mediante plugins
- encaja bien con React/Vite

## Regla de producto
En esta fase no hace falta un sistema documental enterprise.
Sí hace falta un editor muy usable para:
- docs fundacionales
- docs de decisiones
- docs de handoff/output

## Integración con canvas
### Company node
Debe mostrar:
- foundation docs
- status de cada doc
- open-in-modal

### Otros nodos
Más adelante podrán mostrar:
- docs ligados a team/agent/workflow/handoff

## Integración con chat
Desde el chat se debe poder:
- mencionar documento
- pedir cambios sobre documento
- aceptar/rechazar propuesta documental del CEO
- ver enlaces rápidos a docs afectados

## Versionado mínimo recomendado
Para esta fase:
- current version
- previous version snapshot
- audit trail básico

No hace falta branching complejo todavía.
