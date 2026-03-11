# Canvas Editor v2 — Acceptance Checklist

## Bloque A — Base estable
- [ ] Las mutaciones de relaciones están conectadas end-to-end en org, department y workflow canvas
- [ ] Las capas activas se envían al backend en todos los scopes relevantes
- [ ] La navegación multinivel no tiene límite artificial de profundidad
- [ ] El botón de auto-layout ejecuta un layout real o deja de llamarse auto-layout
- [ ] Existe persistencia real de layout por scope

## Bloque B — Interacción visual
- [ ] Existe toolbar con modos explícitos (select, pan, connect, add-node, add-edge)
- [ ] Existe paleta de nodos tipada
- [ ] Existe paleta de relaciones tipada
- [ ] Existe context menu sobre canvas, nodo y edge
- [ ] Existe undo/redo

## Bloque C — Inspector completo
- [ ] Todos los tipos de nodo relevantes tienen formulario de edición completo desde inspector
- [ ] Todos los tipos de relación relevantes tienen edición completa desde inspector
- [ ] Hay tabs de validation/history/relations al menos en nodos principales
- [ ] La multiselección permite acciones útiles

## Bloque D — Navegación y semantic zoom
- [ ] El usuario puede entrar y salir por múltiples niveles de forma estable
- [ ] Los breadcrumbs representan correctamente el path real
- [ ] La vuelta a nivel superior restaura el foco en el nodo previo
- [ ] El sistema soporta scopes más allá de org/department/workflow

## Bloque E — Perspectivas completas
- [ ] Existe vista de organización
- [ ] Existe vista de capacidades
- [ ] Existe vista de workflows
- [ ] Existe vista de contratos
- [ ] Existe vista de artifacts
- [ ] Existe vista de governance
- [ ] Existe vista de operations

## Bloque F — Artifacts
- [ ] Artifact es un nodo de primer nivel del lenguaje visual
- [ ] Los artifacts pueden crearse, editarse y navegarse desde canvas/inspector
- [ ] Puede verse el flujo productor → artifact → consumidor

## Bloque G — Chat
- [ ] Existe chat persistente de empresa/CEO
- [ ] Existe chat persistente por department
- [ ] Existe chat persistente por workflow o nodo
- [ ] El chat está realmente conectado al scope y no es placeholder

## Bloque H — Gobernanza y operaciones
- [ ] Los errores de validación son navegables desde canvas y sidebar
- [ ] Existe overlay de runtime/operations
- [ ] Existen estados visuales de incidentes o bloqueos

## Bloque I — Multiusuario y hardening
- [ ] Los permisos del canvas están implementados, no solo documentados
- [ ] Las saved views pueden persistirse a nivel proyecto
- [ ] Hay tests unitarios, integración y e2e para las interacciones críticas
- [ ] La UX del editor es usable con proyectos medianos/grandes
