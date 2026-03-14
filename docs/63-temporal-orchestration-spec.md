# Temporal Orchestration Spec

## Objetivo
Usar Temporal como el orquestador durable de la nueva fase AI Runtime.

## Principio
Temporal debe coordinar:
- conversaciones bootstrap
- generación y actualización de documentos
- proposals estructurales
- tareas básicas de agentes

Claude Code debe usarse dentro de Activities o runners externos, no como lógica de Workflow.

## Primeros workflows recomendados

### 1. BootstrapConversationWorkflow
Responsable de:
- recibir mensaje del usuario
- recuperar contexto del proyecto
- decidir siguiente paso
- solicitar respuesta del CEO
- generar cambios documentales
- abrir proposals cuando proceda

### 2. FoundationDocumentWorkflow
Responsable de:
- generar documento inicial
- actualizar documento
- revisar coherencia
- producir patches o reemplazos

### 3. MinimalOrgGrowthWorkflow
Responsable de:
- proponer crear department/team/specialist
- validar reglas mínimas
- esperar aprobación
- materializar estructura aprobada

### 4. BasicAgentTaskWorkflow
Responsable de:
- lanzar una tarea concreta de un agente
- delegarla al runner de Claude
- recoger output
- generar eventos/runtime artifacts

## Activities principales

### Chat / context activities
- loadProjectSeed
- loadBootstrapState
- loadRelevantDocuments
- persistAssistantMessage

### Document activities
- generateFoundationDocument
- updateFoundationDocument
- persistDocumentRevision

### Org activities
- evaluateOrgProposal
- createDepartment
- createTeam
- createSpecialist

### Runner activities
- prepareExecutionWorkspace
- launchClaudeContainer
- collectExecutionResult
- persistExecutionOutputs

## Task queues iniciales
Separar al menos:
- `bootstrap`
- `documents`
- `growth`
- `agent-execution`

## Regla de task queues
Todos los workers de una misma task queue deben conocer los mismos tipos de workflows/activities.
Por eso conviene separar queues por responsabilidad.

## Estrategia de despliegue local
Fase 1:
- Temporal en entorno local reproducible
- worker service en Node/TypeScript
- UI de Temporal accesible para debugging
- persistencia suficiente para desarrollo

## Observabilidad mínima
- workflow ids previsibles
- correlation ids con projectId / agentId / executionId
- surfaced state hacia TheCrew runtime UI
- errores visibles en timeline

## Regla de diseño
Temporal coordina.
Claude ejecuta.
TheCrew visualiza y gobierna.
