# Canvas Editor v2 — Acceptance Checklist

## Bloque A — Base estable
- [x] Las mutaciones de relaciones están conectadas end-to-end en org, department y workflow canvas
- [x] Las capas activas se gestionan con contrato consistente en todos los scopes (client-side filtering, full graph fetch)
- [x] La navegación multinivel no tiene límite artificial de profundidad
- [x] El botón de auto-layout ejecuta un layout real o deja de llamarse auto-layout
- [x] Existe persistencia real de layout por scope

## Bloque B — Interacción visual
- [x] Existe toolbar con modos explícitos (select, pan, connect, add-node, add-edge)
- [x] Existe paleta de nodos tipada
- [x] Existe paleta de relaciones tipada
- [x] Existe context menu sobre canvas, nodo y edge
- [x] Existe undo/redo

## Bloque C — Inspector completo
- [x] Todos los tipos de nodo relevantes tienen formulario de edición completo desde inspector
- [x] Todos los tipos de relación relevantes tienen edición completa desde inspector
- [x] Hay tabs de validation/history/relations al menos en nodos principales
- [x] La multiselección permite acciones útiles

## Bloque D — Navegación y semantic zoom
- [x] El usuario puede entrar y salir por múltiples niveles de forma estable
- [x] Los breadcrumbs representan correctamente el path real
- [x] La vuelta a nivel superior restaura el foco en el nodo previo
- [x] El sistema soporta scopes más allá de org/department/workflow

## Bloque E — Perspectivas completas
- [x] Existe vista de organización
- [x] Existe vista de capacidades
- [x] Existe vista de workflows
- [x] Existe vista de contratos
- [x] Existe vista de artifacts
- [x] Existe vista de governance
- [x] Existe vista de operations

## Bloque F — Artifacts
- [x] Artifact es un nodo de primer nivel del lenguaje visual
- [x] Los artifacts pueden crearse, editarse y navegarse desde canvas/inspector
- [x] Puede verse el flujo productor → artifact → consumidor

## Bloque G — Chat
- [x] Existe chat persistente de empresa/CEO
- [x] Existe chat persistente por department
- [x] Existe chat persistente por workflow o nodo
- [x] El chat está realmente conectado al scope y no es placeholder

## Bloque H — Gobernanza y operaciones
- [x] Los errores de validación son navegables desde canvas y sidebar
- [x] Existe overlay de runtime/operations
- [x] Existen estados visuales de incidentes o bloqueos

## Bloque I — Multiusuario y hardening
- [x] Los permisos del canvas están implementados, no solo documentados
- [x] Las saved views pueden persistirse a nivel proyecto
- [x] Hay tests unitarios, integración y e2e para las interacciones críticas
- [ ] La UX del editor es usable con proyectos medianos/grandes
- [x] Error boundary catches and displays canvas crashes (CAV-022c)
- [x] Mutation errors surface to user via toast notifications (CAV-022c)
- [x] beforeunload warning when mutations in flight (CAV-022c)
- [x] Workflow route has layout+view persistence parity (CAV-022c)
- [x] QueryClient mutation retry disabled (no auto-retry for writes) (CAV-022c)
