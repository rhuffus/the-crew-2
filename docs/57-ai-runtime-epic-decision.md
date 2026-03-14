# AI Runtime Enablement — Product / Architecture Decision

## Estado
Accepted

## Objetivo
Añadir la primera funcionalidad **real** de trabajo con IA a TheCrew, preservando el modelo Live Company ya implementado.

## Qué cambia
Hasta ahora:
- el bootstrap CEO-first existe
- el canvas y el chat existen
- la estructura Live Company existe
- runtime/observability existen como modelo y UI
- pero **no existe todavía ejecución real de Claude Code ni orquestación real con Temporal**

A partir de esta fase, TheCrew debe poder:
1. Crear un proyecto con solo:
   - nombre
   - descripción muy corta
2. Abrir inmediatamente el canvas del proyecto con la **Company UO**
3. Iniciar conversación real con el **CEO bootstrap agent**
4. Crear y mantener documentos Markdown base del proyecto
5. Permitir al usuario abrir y editar esos documentos
6. Hacer que el CEO cree estructura mínima cuando lo considere oportuno
7. Ejecutar al menos algunos trabajos reales con:
   - Claude Code dentro de contenedores Docker
   - Temporal como orquestador durable

## Tesis
No conviene intentar desde el primer día toda la empresa autónoma completa.
Conviene construir un **vertical slice real**:

create project → CEO chat → markdown docs → approval → minimal org growth → basic agent work

## Criterios de éxito de la fase
- el chat del CEO ya no es solo persistencia de mensajes; genera respuestas reales
- la documentación base del proyecto se crea en Markdown y es editable
- la Company node muestra esos documentos en inspector y el usuario puede abrirlos en modal editor
- Temporal orquesta al menos:
  - bootstrap conversation workflow
  - document generation/update workflow
  - un workflow básico de creación organizativa
  - un workflow básico de ejecución de un agente
- Claude Code corre en contenedores Docker para tareas acotadas y reproducibles
- el sistema deja trazabilidad de runtime, outputs, artefactos y decisiones

## No-objetivos de esta fase
- plataforma multi-tenant de producción
- sandboxing perfecto
- autonomía completa sin supervisión
- toda la empresa trabajando a gran escala
- ejecución paralela masiva de decenas de agentes reales

## Principio de honestidad
Esta fase debe quedar explícitamente descrita como:
- válida para **local/dev** y repositorios confiables
- arquitectura base para evolucionar luego
- no garantía de entorno enterprise hardened todavía
