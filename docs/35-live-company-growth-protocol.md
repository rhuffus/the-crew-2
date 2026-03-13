# Live Company Growth Protocol

> **Note:** This document is the original conceptual protocol. The implementable design spec is `docs/44-live-company-growth-engine-spec.md` (produced by LCP-007). This document is preserved as reference.

## Objetivo
Definir cómo una empresa viva puede crecer organizativamente sin convertirse en caos.

## Regla general
La IA no crea estructura libremente.
La IA **propone**, justifica y ejecuta dentro de un marco de gobierno.

## Jerarquía de autonomía

### Usuario / Founder / Board
- define misión, visión y límites
- aprueba cambios mayores
- corrige cultura y forma de trabajar
- tiene autoridad final

### CEO
Puede:
- refinar visión contigo
- proponer departamentos
- repartir contexto
- crear objetivos y contratos iniciales
- decidir cuándo una necesidad justifica nueva estructura

No debe:
- expandirse sin control
- crear equipos o agentes solo por conveniencia local sin justificación

### Department Executive
Puede:
- proponer equipos mínimos
- negociar contratos interdepartamentales
- crear workflows de su área
- elevar decisiones al CEO

### Team Lead
Puede:
- proponer especialistas
- repartir trabajo
- ajustar workflows de equipo
- definir handoffs concretos

### Specialist
Puede:
- ejecutar trabajo
- producir artefactos
- pedir revisión o colaboración
- proponer mejoras limitadas
- no debe reorganizar la empresa por sí mismo

## Regla de creación de estructura

### Crear Department solo si:
- existe una función estratégica u operativa sostenida
- la carga de coordinación lo justifica
- hay owner claro
- hay budget
- el CEO lo propone y el founder lo aprueba cuando aplique

### Crear Team solo si:
- un department tiene trabajo recurrente diferenciado
- separar el trabajo reduce fricción o sobrecarga
- hay un lead claro
- la propuesta justifica contexto mínimo y coste

### Crear Specialist solo si:
- existe una función repetible o claramente especializada
- no basta con un agente generalista
- su activación y outputs están claros
- hay una necesidad real en workflows activos

## Proposal flow
Toda expansión organizativa pasa por Proposal.

Una proposal debe incluir:
- tipo de cambio
- motivación
- problema detectado
- expected benefit
- coste esperado
- contexto que se asignará
- contratos/workflows que habilita o modifica
- aprobación necesaria

Estados posibles:
- draft
- proposed
- under-review
- approved
- rejected
- implemented
- superseded

## Budgets y límites
La empresa viva debe respetar:
- budget global del proyecto
- budget por UO
- límite de profundidad organizativa
- límite de fan-out
- límite de contexto por unidad
- ratio coordinación/ejecución

## Contexto mínimo
Cada nueva unidad recibe solo:
- el contexto necesario
- contratos relevantes
- workflows relevantes
- objetivos relevantes
- artefactos relevantes
- reglas relevantes

No hereda “todo el proyecto” por defecto.

## Fases de madurez del proyecto

### Seed
- solo CEO
- discovery con el usuario

### Formation
- primeros departments
- primeros workflows

### Structured
- teams y especialistas mínimos
- contratos principales

### Operating
- empresa ejecutando trabajo real

### Scaling
- optimización de estructura
- más autonomía y observabilidad

### Optimizing
- reorganización y mejora continua

## Reglas de seguridad
- no expansión sin justificación
- no prompts arbitrarios sin plantilla
- no contratos sin responsables
- no workflows sin owner
- no artefactos huérfanos
- no cambios estructurales invisibles

## Resultado esperado
La empresa debe crecer:
- despacio
- con intención
- con trazabilidad
- y siempre bajo gobierno humano
