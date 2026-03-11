# Verticaler — Checklist manual de smoke testing

## Objetivo

Validar que una instancia de TheCrew arranca correctamente con la empresa Verticaler y que el recorrido visual principal funciona de punta a punta.

Este checklist se ejecuta manualmente. No sustituye a los tests automatizados sino que los complementa con validaciones visuales y de integración que solo un operador humano puede confirmar.

## Prerrequisitos

1. Repo limpio: `git status` sin cambios no deseados.
2. Dependencias instaladas: `pnpm install`.
3. Quality gate verde:
   ```bash
   pnpm turbo run typecheck
   pnpm turbo run lint
   pnpm turbo run test -- --run
   ```
4. Servicios levantados localmente (Tilt / manual).

---

## 1. Bootstrap y arranque

| # | Check | Resultado esperado | OK? |
|---|-------|-------------------|-----|
| 1.1 | Arrancar `services/platform` en instancia vacía | Log: `Verticaler project created` | [ ] |
| 1.2 | Arrancar `services/company-design` | Log: `Verticaler seed complete — 9 departments, 16 capabilities, 15 roles, 14 skills, 14 archetypes, 14 assignments, 7 contracts, 4 workflows, 5 policies, 12 artifacts` | [ ] |
| 1.3 | Segundo arranque (idempotencia) | Log: `Verticaler project already exists — skipping` / `Company model already exists — skipping seed` | [ ] |
| 1.4 | API gateway responde | `GET /health` devuelve 200 | [ ] |
| 1.5 | Web app carga sin errores de consola | `http://localhost:5173` sin errores rojos en devtools | [ ] |

---

## 2. Seleccion de proyecto y entrada al canvas

| # | Check | Resultado esperado | OK? |
|---|-------|-------------------|-----|
| 2.1 | Proyecto Verticaler aparece en la lista | Se muestra "Verticaler" con descripcion SaaS ascensores | [ ] |
| 2.2 | Click en Verticaler abre la vista company | Ruta `/projects/verticaler-0000.../org`, canvas con nodos visibles | [ ] |
| 2.3 | Barra superior muestra nombre y breadcrumb | "Verticaler" en la top bar, breadcrumb "Verticaler" | [ ] |
| 2.4 | DevModeBanner visible en dev | Banner de modo desarrollo presente | [ ] |

---

## 3. Vista Organization (L1 — empresa)

| # | Check | Resultado esperado | OK? |
|---|-------|-------------------|-----|
| 3.1 | Se ven los 9 departamentos como nodos | Executive, Product, Engineering, Design, Operations, Customer Success, Sales, Finance & Admin, Compliance & Quality | [ ] |
| 3.2 | Relaciones reports_to visibles | Edges de reporting entre departamentos y CEO | [ ] |
| 3.3 | Zoom y pan funcionan | Scroll zoom, click-drag para mover el canvas | [ ] |
| 3.4 | Fit view centra todos los nodos | Toolbar: fit view deja todos los nodos visibles | [ ] |
| 3.5 | Auto-layout reordena nodos | Toolbar: auto-layout produce disposicion legible | [ ] |

---

## 4. Explorer (sidebar izquierdo)

| # | Check | Resultado esperado | OK? |
|---|-------|-------------------|-----|
| 4.1 | Tab Explorer muestra arbol de entidades | Departamentos listados con hijos | [ ] |
| 4.2 | Click en entidad del explorer selecciona nodo | El nodo se resalta en el canvas | [ ] |
| 4.3 | Tab Artifacts lista los 12 artifacts | PRD, Design Spec, Tech Spec, etc. | [ ] |
| 4.4 | Search filtra por nombre | Buscar "Engineering" filtra resultados | [ ] |
| 4.5 | Layers/Views cambia capa visible | Activar "capabilities" altera los nodos/edges mostrados | [ ] |

---

## 5. Inspector (panel derecho)

| # | Check | Resultado esperado | OK? |
|---|-------|-------------------|-----|
| 5.1 | Click en departamento abre inspector | Panel derecho con nombre, descripcion, mandato | [ ] |
| 5.2 | Tab overview muestra datos reales | Datos coherentes con seed de Verticaler | [ ] |
| 5.3 | Tab relaciones muestra edges | reports_to, owns, contributes_to segun departamento | [ ] |
| 5.4 | Editar nombre de departamento | Cambio se refleja en nodo del canvas | [ ] |
| 5.5 | Click en rol abre inspector de rol | Tabs: overview, capabilities, skills, workflows | [ ] |
| 5.6 | Click en workflow abre inspector de workflow | Tabs: stages, participants, contracts, artifacts | [ ] |
| 5.7 | Click en contract muestra provider/consumer | SLA, acceptance criteria, tipo de contrato | [ ] |
| 5.8 | Click en policy muestra enforcement y scope | Global vs departamental, tipo mandatory/advisory | [ ] |

---

## 6. Navegacion multinivel

| # | Check | Resultado esperado | OK? |
|---|-------|-------------------|-----|
| 6.1 | Doble click en Engineering hace drilldown | Ruta cambia a department view, se ven sub-teams (Platform, Backend, Frontend, QA) | [ ] |
| 6.2 | Breadcrumb muestra Verticaler > Engineering | Clickable para volver | [ ] |
| 6.3 | Doble click en workflow hace drilldown | Vista de workflow con stages como nodos | [ ] |
| 6.4 | Breadcrumb muestra Verticaler > Dept > Workflow | Todos los niveles navegables | [ ] |
| 6.5 | Click en breadcrumb nivel superior vuelve | Regreso limpio al scope padre | [ ] |
| 6.6 | Boton back del navegador funciona | History coherente con la navegacion del canvas | [ ] |

---

## 7. Presets de vista

| # | Check | Resultado esperado | OK? |
|---|-------|-------------------|-----|
| 7.1 | Selector de vista muestra presets | Organization, Capabilities, Workflows, Contracts, Artifacts, Governance | [ ] |
| 7.2 | Cambiar a Capability View | Se ven capabilities con edges owns/contributes_to | [ ] |
| 7.3 | Cambiar a Workflow View | Se ven 4 workflows con participantes | [ ] |
| 7.4 | Cambiar a Contract View | Se ven 7 contratos con edges provides/consumes | [ ] |
| 7.5 | Cambiar a Governance View | Se ven 5 policies con edges governs/bound_by | [ ] |
| 7.6 | Volver a Organization View | Vista original restaurada | [ ] |

---

## 8. Context menu

| # | Check | Resultado esperado | OK? |
|---|-------|-------------------|-----|
| 8.1 | Click derecho en canvas vacio | Menu: add node, fit view, auto layout | [ ] |
| 8.2 | Click derecho en nodo | Menu: inspect, edit, drilldown, create relationship, delete | [ ] |
| 8.3 | Click derecho en edge | Menu: inspect, edit metadata, delete | [ ] |

---

## 9. Creacion y edicion

| # | Check | Resultado esperado | OK? |
|---|-------|-------------------|-----|
| 9.1 | Crear nodo desde context menu o toolbar | Nodo nuevo aparece en canvas y explorer | [ ] |
| 9.2 | Crear relacion arrastrando desde handle | Edge nuevo conecta dos nodos | [ ] |
| 9.3 | Eliminar nodo con confirmacion | Nodo desaparece del canvas y explorer | [ ] |
| 9.4 | Eliminar edge | Edge desaparece del canvas | [ ] |

---

## 10. Toolbar del canvas

| # | Check | Resultado esperado | OK? |
|---|-------|-------------------|-----|
| 10.1 | Zoom in / zoom out | Canvas escala correctamente | [ ] |
| 10.2 | Fit view | Todos los nodos visibles | [ ] |
| 10.3 | Auto layout | Nodos reorganizados sin solapamiento | [ ] |
| 10.4 | Undo / redo | Ultima accion revertida / restaurada | [ ] |

---

## 11. Chat contextual

| # | Check | Resultado esperado | OK? |
|---|-------|-------------------|-----|
| 11.1 | Chat dock visible | Panel de chat accesible | [ ] |
| 11.2 | Scope de chat refleja contexto | Si estoy en Engineering, chat muestra scope Engineering | [ ] |
| 11.3 | Enviar mensaje | Mensaje aparece en el hilo (efimero en dev mode) | [ ] |

---

## 12. Colaboracion y permisos (dev mode)

| # | Check | Resultado esperado | OK? |
|---|-------|-------------------|-----|
| 12.1 | Lock indicator presente en inspector | Icono de lock visible (hardcoded dev permissions) | [ ] |
| 12.2 | Review indicator presente | Indicador de review visible | [ ] |
| 12.3 | Permisos no bloquean edicion en dev | Todas las acciones de edicion disponibles | [ ] |

---

## 13. Admin pages

| # | Check | Resultado esperado | OK? |
|---|-------|-------------------|-----|
| 13.1 | Ruta admin departments carga | `/projects/.../admin/departments` muestra lista | [ ] |
| 13.2 | Ruta admin audit carga | `/projects/.../admin/audit` muestra log | [ ] |
| 13.3 | DevModeBanner visible en admin shell | Banner presente | [ ] |

---

## 14. Validacion y calidad

| # | Check | Resultado esperado | OK? |
|---|-------|-------------------|-----|
| 14.1 | Validation overlay disponible | Tab Validation en sidebar sin errores criticos | [ ] |
| 14.2 | No hay errores de consola durante todo el recorrido | DevTools console limpia (warnings aceptables) | [ ] |
| 14.3 | No hay requests HTTP fallidas | Network tab sin 4xx/5xx inesperados | [ ] |

---

## 15. Limitaciones conocidas (no son fallos)

Estas situaciones son esperadas en el estado actual y no deben marcarse como errores:

| Limitacion | Referencia |
|---|---|
| Todos los datos se pierden al reiniciar servicios | 100% in-memory, ver CLAUDE.md |
| Autor de comentarios siempre "current-user" | Hardcoded hasta auth real |
| Permisos de dev mode fijos (editor + member) | Hardcoded, ver docs/26 H10 |
| Operations View sin datos runtime | Gap documentado en coverage matrix G-04 |
| Saved views no pre-pobladas | Gap documentado en coverage matrix G-02 |
| Diff/releases sin baseline publicada | Gap documentado en coverage matrix G-01 |
| Indicadores "Updated" en vez de "Saved" | POL-004 honestidad de persistencia |

---

## Registro de ejecucion

| Fecha | Ejecutado por | Resultado | Notas |
|---|---|---|---|
| — | — | — | Primera ejecucion pendiente |

---

## Regla de mantenimiento

Actualizar este checklist cuando:
1. Se anada una nueva entidad al seed de Verticaler.
2. Se implemente una feature que cierre un gap de la coverage matrix.
3. Cambie la navegacion o estructura del canvas editor.
4. Se anada persistencia real (eliminar items de "limitaciones conocidas").
