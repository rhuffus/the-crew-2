# Arquitectura de producto y sistema — Visual-First

## Resumen
TheCrew ya no se entiende como una plataforma de administración con un editor visual añadido.
Se entiende como una **plataforma visual para modelar y operar empresas**.

## Dos planos distintos

### 1. Plano semántico
El dominio real:
- projects
- company model
- departments
- capabilities
- roles
- agents
- skills
- contracts
- workflows
- policies
- releases
- audit

### 2. Plano visual
La representación navegable y editable:
- canvas views
- nodos tipados
- edges tipados
- layouts
- vistas por nivel
- capas visuales
- filtros
- inspector
- scoped chats

El plano visual no sustituye al semántico. Lo hace navegable.

## Principio arquitectónico
No reconstruir el canvas directamente desde veinte endpoints CRUD en frontend.
Crear una **graph projection / visual read model** optimizada para la UI.

## Recomendación técnica
A corto plazo:
- mantener `platform-service` y `company-design-service` como base semántica
- mantener `api-gateway` como entrada web
- introducir una proyección visual v1 en el borde o en `company-design-service`
- servir a la web un DTO de grafo ya compuesto por scope

A medio plazo:
- extraer un `workspace-projection-service` si la complejidad o el volumen lo justifican

## UI shell objetivo
- barra superior
- sidebar izquierdo (explorer, artifacts, search, layers, validation)
- canvas central
- inspector derecho
- chat dock

## Semantic zoom
El zoom debe cambiar el nivel conceptual visible:
1. Company map
2. Department map
3. Process/workflow map
4. Detail map

## Lenguaje visual mínimo
### Nodos v1
- company
- department
- role
- agent
- capability
- workflow
- workflow-stage
- contract
- artifact
- policy

### Edges v1
- contains
- reports_to
- owns
- contributes_to
- consumes
- produces
- governs
- depends_on
- approves
- hands_off_to
- implements

## Módulos de backend recomendados para el pivot
- platform-service
- company-design-service
- api-gateway / BFF
- visual projection module (nuevo módulo lógico)
- chat context module (más adelante)

## Regla de migración
No eliminar los módulos CRUD actuales.
Conservarlos como:
- soporte de edición densa
- fallback administrativo
- superficie de pruebas y auditoría

El canvas debe ir absorbiendo el flujo principal de uso progresivamente.
