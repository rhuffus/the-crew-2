# Backlog completo de TheCrew (v3 — Canvas Editor v2)

## Contexto
Las épicas del pivot visual-first inicial ya están mayoritariamente implementadas.
El siguiente tramo del producto no es “seguir añadiendo vistas”, sino una fase nueva:

## **Canvas Editor v2**

Objetivo:
convertir el canvas actual en el sistema visual completo desde el que pueda gestionarse toda la empresa.

---

## Epic 36 — Canvas Foundations Repair
Objetivo: reparar los huecos y bugs que impiden que la base actual escale.

### Hitos
- wiring real de mutaciones de relaciones
- contrato consistente de capas/fetch en todos los scopes
- navegación profunda sin límite artificial
- contrato honesto de layout
- feedback de pending/saving en canvas e inspector

---

## Epic 37 — Interaction Model & Tooling
Objetivo: convertir el canvas en un editor de verdad.

### Hitos
- modos explícitos de interacción
- toolbar avanzada
- paleta de nodos
- paleta de relaciones
- context menus
- keyboard shortcuts
- undo/redo

---

## Epic 38 — Inspector v2
Objetivo: hacer que el panel derecho edite por completo el modelo seleccionado.

### Hitos
- formularios tipados por nodo
- formularios tipados por relación
- tabs de validation/history/artifacts/runtime
- bulk actions para multiselección

---

## Epic 39 — Generic Scope Navigation
Objetivo: romper la rigidez org/department/workflow y soportar multi-level real.

### Hitos
- scope model genérico
- breadcrumbs e historial profundos
- drilldown arbitrario
- semantic zoom consistente
- L4 real

---

## Epic 40 — Visual Views, Layers & Artifact Flow
Objetivo: permitir ver toda la empresa desde distintas perspectivas.

### Hitos
- presets de vista
- artifact layer
- artifact nodes y edges
- mejoras de filters/search/view persistence

---

## Epic 41 — Layout Persistence & Shared Views
Objetivo: convertir el canvas en un workspace estable y personalizable.

### Hitos
- auto-layout real
- persistencia de posiciones
- layouts por scope/preset
- saved views compartidas del proyecto

---

## Epic 42 — Scoped Chat & AI Assistance
Objetivo: introducir el eje conversacional real del producto.

### Hitos
- chat persistente company
- chat persistente department
- chat persistente workflow/node
- acciones sugeridas desde chat

---

## Epic 43 — Operations Overlay
Objetivo: proyectar runtime y ejecución encima del modelo visual.

### Hitos
- runs overlay
- queue/incidents overlay
- stage live state
- contractual/runtime failures

---

## Epic 44 — Permissions & Collaboration
Objetivo: hacer el editor seguro y colaborativo.

### Hitos
- enforcement de permisos reales
- bloqueo de acciones por rol
- vistas compartidas
- comentarios/review/locks básicos

---

## Epic 45 — Hardening, Performance & Accessibility
Objetivo: dejar el editor preparado para uso continuado.

### Hitos
- rendimiento con grafos medianos/grandes
- accesibilidad por teclado
- robustez de autosave / recovery
- test e2e y Playwright reforzados

---

## Orden recomendado
1. Epic 36
2. Epic 37 + Epic 38
3. Epic 39
4. Epic 40 + Epic 41
5. Epic 42
6. Epic 43
7. Epic 44
8. Epic 45

---

## Regla de implementación
No seguir añadiendo features visuales aisladas sobre una base inestable.
Antes de abrir nuevas superficies visuales, cerrar Foundation Repair.
