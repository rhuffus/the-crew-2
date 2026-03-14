# Foundation Documents Spec

## Objetivo
Definir el conjunto mínimo de documentos Markdown que el CEO bootstrap debe crear y mantener.

## Principio
Los documentos base no son un “extra”.
Son el primer artefacto real del proyecto y la memoria compartida inicial de la empresa.

## Requisitos
- todos los documentos en Markdown
- todos vinculados al proyecto
- visibles desde la Company node
- editables por el usuario
- revisables por el CEO
- trazables en runtime/audit

## Conjunto mínimo recomendado

### 00-company-overview.md
Contiene:
- nombre del proyecto
- descripción corta
- tipo de empresa/producto
- problema que resuelve
- a quién sirve
- estado actual del bootstrap

### 01-mission-vision.md
Contiene:
- misión
- visión
- narrativa corta de propósito
- cómo sería una buena empresa según el founder

### 02-founder-constraints-and-preferences.md
Contiene:
- preferencias del founder
- límites de autonomía
- tolerancias de coste
- tono/cultura deseada
- prioridades
- cosas que no quiere

### 03-operating-principles.md
Contiene:
- principios operativos iniciales
- cómo se toman decisiones
- cuándo pedir aprobación
- cómo documentar
- reglas mínimas de calidad

### 04-initial-objectives.md
Contiene:
- objetivos iniciales
- prioridades
- horizonte temporal
- criterios de éxito

### 05-initial-roadmap.md
Contiene:
- roadmap inicial por fases
- hitos
- dependencias
- riesgos principales

### 06-initial-backlog.md
Contiene:
- primeras iniciativas
- tareas o workstreams
- owner propuesto
- prioridad
- status

### 07-bootstrap-decisions-log.md
Contiene:
- decisiones tomadas durante bootstrap
- razonamiento resumido
- fecha
- quién aprobó
- impacto

## Documentos opcionales muy recomendables

### 08-product-scope.md
Qué entra y qué no entra en el producto inicial.

### 09-user-and-market-notes.md
Hipótesis de usuarios, mercado y competencia.

### 10-org-bootstrapping-plan.md
Qué departamentos/equipos parecen necesarios primero y por qué.

## Ownership
- owner primario: CEO bootstrap agent
- editor autorizado: founder/user
- revisores futuros: executives cuando existan

## Regla de completitud
No hace falta que estén “perfectos”.
Sí hace falta que sean:
- suficientes
- coherentes
- utilizables como base para arrancar la empresa

## Document metadata recomendada
Cada documento debería tener metadata visible en UI:
- title
- slug
- status (`draft|review|approved`)
- lastUpdatedBy
- source (`user|ceo|system`)
- linkedEntityIds
- linkedProposalIds
