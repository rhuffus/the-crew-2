# Basic Autonomous Work Spec

## Objetivo
Conseguir que, tras el bootstrap, el CEO pueda iniciar trabajo real muy básico.

## Alcance mínimo
No buscamos todavía una empresa completamente autónoma.
Sí buscamos estas capacidades básicas:

### 1. CEO can generate foundation docs
- crear docs base
- refinarlos con el usuario
- aprobarlos para seguir adelante

### 2. CEO can create minimal org structure
- department(s) mínimos
- team(s) mínimos
- specialist(s) mínimos

### 3. One specialist can do one real task
Ejemplos válidos:
- investigar competencia y resumir findings
- proponer primer backlog
- revisar documento y devolver mejoras
- redactar primer plan de roadmap

### 4. Runtime leaves trace
Cada ejecución deja:
- runtime event
- execution record
- outputs
- linked documents/proposals/decisions

## Modelo de ejecución básico
1. CEO identifica necesidad
2. CEO crea proposal estructural o task
3. founder aprueba si hace falta
4. se crea entidad mínima
5. se lanza workflow Temporal
6. Temporal dispara actividad runner
7. Claude container ejecuta tarea
8. se persiste resultado
9. se refleja en canvas/live mode

## Tareas válidas en esta fase
- document drafting
- document revision
- structured summarization
- proposal drafting
- backlog drafting
- roadmap drafting
- research memo drafting

## Tareas no prioritarias todavía
- coding compleja multiagente
- PR lifecycle completo
- CI/CD autónomo
- despliegues reales
- operaciones profundas multiworker

## Reglas de gobierno
- toda creación de estructura mínima debe quedar registrada
- todo trabajo ejecutado debe estar ligado a una razón de negocio
- no lanzar especialistas “por si acaso”
- usar contexto mínimo
- respetar budgets y timeouts
