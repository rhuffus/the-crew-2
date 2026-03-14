# Gap Analysis — Repo actual vs AI Runtime Enablement

## Resumen
El repo actual está muy bien preparado para esta fase, pero le faltan cuatro bloques fundamentales:

1. **IA real en chat/bootstrap**
2. **sistema real de documentos Markdown**
3. **runtime de Claude Code en contenedores**
4. **Temporal como orquestador**

## Hallazgos concretos

### 1. El bootstrap ya existe, pero no con el flujo nuevo pedido
El proyecto actual ya tiene `CeoFirstBootstrapService`, ProjectSeed, Constitution, Company UO y CEO Agent.

Sin embargo, el flujo actual sigue pidiendo:
- misión
- tipo de empresa
- visión
- growth pace
- approval level

y el nuevo pedido quiere:
- nombre
- descripción muy corta

y que el resto salga de la conversación con el CEO.

## Implicación
Hay que simplificar el alta del proyecto y mover más inteligencia al chat bootstrap.

### 2. El chat existe, pero hoy no hay respuesta de IA
El `ChatService` actual:
- crea threads por scope
- guarda mensajes del usuario
- lista mensajes
- borra threads

Pero no:
- genera respuesta del assistant
- llama a un runtime de IA
- dispara workflows de bootstrap
- crea documentos automáticamente

## Implicación
Hay que introducir un **Chat Runtime Pipeline** real.

### 3. No hay Temporal en el repo
No se detectan dependencias, servicios ni config de Temporal.

## Implicación
Hay que introducir:
- servicio Temporal
- worker app o worker module
- task queues
- workflows y activities
- estrategia local de despliegue

### 4. No hay runtime de Claude Code en contenedores
No hay:
- imagen runtime de claude
- runtime manager
- cola de ejecuciones
- persistencia de jobs
- acoplamiento real con agentes

## Implicación
Hay que diseñar un runtime bridge claro entre TheCrew y el contenedor ejecutor.

### 5. No hay sistema de documentos Markdown del proyecto
El producto ya maneja entities, artifacts y panels, pero no se ve un sistema canónico de:
- archivos base del proyecto
- editor rich markdown
- modal document viewer/editor
- versionado simple
- referencias desde inspector/company node

## Implicación
Hay que introducir una **Project Document System**.

### 6. Live Company ya aporta mucho valor reutilizable
Sí existe base útil para:
- project seed
- constitution
- UOs
- agents
- proposals
- runtime UI
- inspector
- chat dock
- company node
- overlays

## Implicación
No hace falta reescribir el producto; hace falta conectar trabajo real.

## Conclusión
La nueva fase no exige rehacer la app.
Exige convertir piezas ya existentes en un slice real:
- chat → AI conversation
- company node → document hub
- runtime model → Temporal-backed execution
- agents → Claude-in-container execution targets
