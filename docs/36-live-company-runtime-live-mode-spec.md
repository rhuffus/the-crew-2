# Runtime / Live Mode Spec

## Objetivo
Hacer visible el estado real de la empresa mientras trabaja.

## Tesis
El diseño estático no basta.
Una vez la empresa funciona, TheCrew debe permitir observar:
- actividad
- decisiones
- handoffs
- documentos
- errores
- bloqueos
- uso de IA
- evolución organizativa

## Dos modos del producto

### Design Mode
Define:
- estructura
- agentes
- workflows
- contratos
- documentos
- reglas

### Live Mode
Observa:
- runs en curso
- agentes activos
- decisiones recientes
- artefactos generados
- comunicaciones
- aprobaciones
- estados de espera
- errores
- coste

## Qué debe verse en Live Mode

### 1. Estado por nodo
Para Company / Department / Team / Agent:
- idle
- active
- waiting
- blocked
- error
- degraded

### 2. Estado por enlace / handoff
- pending
- in-flight
- delivered
- awaiting-review
- failed
- timed-out

### 3. Event stream / timeline
Debe existir una timeline global y por scope con eventos como:
- objective created
- workflow started
- workflow stage completed
- handoff sent
- artifact produced
- artifact approved
- proposal created
- proposal approved/rejected
- incident detected
- escalation raised

### 4. Runtime inspector
Al clicar un nodo o enlace, además de sus propiedades de diseño debe verse:
- runs recientes
- último input
- último output
- duración media
- bloqueos
- errores
- aprobaciones pendientes
- decisiones tomadas
- coste IA aproximado
- links a artefactos/logs

### 5. Replay
Debe existir la posibilidad de reconstruir:
- un workflow concreto
- una decisión importante
- un handoff concreto
- la historia de un artefacto

## Entidades runtime mínimas
- RuntimeExecution
- RuntimeEvent
- HandoffExecution
- ArtifactVersion
- DecisionRecord
- ProposalLifecycle
- BudgetConsumption
- AgentActivityStatus

## Runtime overlays sugeridos
- Active Workflows
- Waiting / Blocked
- Errors
- Decisions
- Artifact Flow
- Cost / Budget
- Proposals / Org Evolution

## Observabilidad obligatoria
TheCrew no debe limitarse a “estar bonito”.
Debe poder responder:
- qué está haciendo la empresa ahora
- quién espera a quién
- qué se ha producido
- qué ha fallado
- qué se ha decidido
- cuánto ha costado
- por qué existe la estructura actual

## Verticaler como demo viva
Verticaler debe acabar cubriendo no solo diseño, sino también:
- eventos
- workflows runtime
- decisiones
- artefactos reales o simulados
- propuestas de cambio organizativo
