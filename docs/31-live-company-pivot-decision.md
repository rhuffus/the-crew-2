# ADR / Product Decision — Live Company Pivot

## Estado
Accepted

## Decisión
TheCrew pivota desde el modelo actual de “empresa diseñada por adelantado + canvas visual-first” hacia un modelo de **empresa viva, auto-organizable y gobernada**.

## Contexto
El producto actual ha demostrado varias cosas:

### Lo que sí funciona
- base técnica del monorepo
- shell visual
- canvas, inspector, explorer y diff
- CRUD/admin
- validación, audit, permisos y colaboración
- disciplina de Claude Code y roadmap

### Lo que no termina de encajar
- el modelo actual exige demasiada planificación previa
- el canvas es potente pero cognitivamente complejo
- la empresa se percibe como una mezcla de entidades abstractas en vez de como una organización viva
- el flujo de diseño sigue siendo demasiado manual para un producto impulsado por IA

## Nueva tesis de producto
No debemos pedir al usuario que diseñe una empresa completa desde cero.
Debemos permitirle crear una **semilla de empresa** y dejar que la empresa se organice progresivamente con IA, bajo gobierno humano.

## Nueva definición de TheCrew
TheCrew es una plataforma para **crear, cultivar y operar empresas IA vivas**.

Cada proyecto:
- arranca con una semilla mínima
- tiene inicialmente un solo agente gestor: el CEO
- conversa con el usuario para refinar misión, visión, reglas y prioridades
- crea unidades organizativas mínimas cuando hacen falta
- define contratos, workflows, artefactos y responsabilidades de forma incremental
- entra en modo operativo con observabilidad runtime

## Lo que se conserva
- repo actual
- stack
- visual shell
- canvas base
- explorer / inspector / chat / diff
- validación, audit, permisos, colaboración
- infraestructura local
- workflow con Claude Code

## Lo que cambia
- modelo de dominio principal
- jerarquía conceptual de entidades
- gramática visual
- onboarding / creación de proyectos
- rol de Verticaler
- roadmap de producto
- prioridad del runtime vivo

## Lo que se depreca conceptualmente
- empresa rígida diseñada por adelantado
- lectura del canvas por “capas equivalentes”
- bootstrap basado en poblar todo el modelo desde el principio
- prominencia del CRUD como experiencia principal

## Razón para no rehacer desde cero
El cambio es conceptual y de UX, no una invalidación completa del stack ni del repo.
El coste de rehacer sería mayor que el de migrar incrementalmente.

## Consecuencias
- habrá una fase de transición old → new
- parte del modelo existente se preservará
- parte se adaptará
- parte se deprecará o quedará como compatibilidad temporal
- el roadmap debe reorganizarse a partir de este pivot
