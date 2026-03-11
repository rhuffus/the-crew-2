# Lenguaje visual y gramática de TheCrew (v1)

## Objetivo
Definir un sistema visual semántico. No una pizarra libre.

## Nodos v1
### Company
Representa la empresa/proyecto como raíz del workspace visual.

### Department
Unidad organizativa y operativa.

### Role
Responsabilidad formal dentro de un departamento o ámbito.

### Agent
Instancia conceptual asignada a un rol/ámbito.

### Capability
Aptitud organizativa formal para producir un resultado repetible.

### Workflow
Proceso formal de la empresa.

### Workflow Stage
Etapa concreta de un workflow.

### Contract
Acuerdo operativo o interfaz entre partes.

### Artifact
Documento, entregable o pieza operativa.

### Policy
Regla, gate o restricción.

## Edges v1
- contains
- reports_to
- owns
- contributes_to
- consumes
- produces
- depends_on
- governs
- approves
- hands_off_to
- implements
- references

## Reglas básicas
1. Todo edge debe tener tipo.
2. No todos los nodos se pueden conectar entre sí.
3. El inspector debe mostrar y editar la semántica del nodo/edge.
4. El layout nunca cambia la semántica.
5. Borrar una conexión debe evaluar impacto.

## Semantic zoom esperado
### Company level
Company + departments + líderes + relaciones principales.

### Department level
Departamento + roles + agentes + capabilities + workflows + contracts clave.

### Workflow level
Workflow + stages + approvals + artifacts + handoffs.

### Detail level
Elemento único con relaciones y propiedades.

## Capas visuales iniciales
- Organization
- Capabilities
- Workflows
- Contracts
- Artifacts
- Governance
- Runtime (futuro)

## Panel derecho
Al seleccionar un nodo o edge, el inspector debe permitir:
- overview
- propiedades
- relaciones
- contratos / condiciones
- referencias cruzadas
- validaciones
- historial
- chat contextual
