# Revisión de polish del estado actual de TheCrew

## Alcance
Este documento recoge hallazgos de revisión del repo actual con dos objetivos:

1. detectar errores, incoherencias y puntos de mejora sin abrir nuevas funcionalidades de producto;
2. preparar una fase de pulido para que TheCrew quede lo más sólido posible antes de seguir creciendo.

No sustituye a la especificación del canvas.
La acompaña.

## Resumen ejecutivo

El proyecto está ya bastante avanzado y el salto visual-first es visible, pero todavía hay una serie de problemas de **coherencia de producto**, **honestidad técnica** y **higiene del repo** que conviene cerrar ahora.

El hallazgo más importante es este:

## el producto puede estar visualmente avanzado, pero su base de persistencia sigue siendo principalmente in-memory

Eso afecta directamente a:
- arranque con datos iniciales;
- seed de Verticaler;
- credibilidad de saved views / chat / locks / audit / operations a largo plazo;
- estabilidad al reiniciar servicios.

---

## 1. Hallazgos críticos

### P1. Persistencia real insuficiente para el estado actual del producto
Se observan múltiples repositorios `in-memory` tanto en `services/platform` como en `services/company-design`.

Impacto:
- la aplicación puede aparentar completitud, pero reiniciar servicios destruye estado;
- la nueva feature de Verticaler no puede resolverse honestamente como “migraciones de base de datos” sobre una base in-memory;
- varias capacidades del producto se comportan más como demo state que como estado durable.

Recomendación:
- priorizar una fase de persistencia/bootstrapping mínima antes o junto con Verticaler;
- si aún no se cambia toda la infraestructura, al menos dejar explícito qué partes siguen siendo in-memory y qué partes ya son persistentes.

### P2. Estado del backlog demasiado optimista
El task registry actual declara que Canvas Editor v2 está completo.
Eso ya no representa bien la realidad operativa que describe el usuario: el producto todavía necesita polish importante y ahora necesita también empresa de referencia.

Impacto:
- `/tc-next` puede quedarse sin criterio real;
- la documentación da una falsa sensación de cierre;
- aumenta el riesgo de que Claude siga añadiendo cosas fuera de orden.

Recomendación:
- abrir una nueva fase formal en backlog/registry para Verticaler + Polish.

### P3. TheCrew arranca vacío
Hoy la experiencia inicial del producto es floja: entras y no hay proyectos.

Impacto:
- mala primera impresión;
- complica validar el canvas en una prueba rápida;
- obliga a crear manualmente estructura antes de comprobar nada.

Recomendación:
- añadir Verticaler como empresa de referencia por bootstrap/migración.

---

## 2. Hallazgos de coherencia del repo

### P4. Artefactos generados incluidos en el repo/zip
En el análisis del ZIP aparecen artefactos generados o no deseables dentro del árbol de trabajo, por ejemplo:
- `dist/`
- `coverage/`
- `playwright-report/`
- `tsconfig.tsbuildinfo`
- `.turbo/`
- `.DS_Store`
- incluso `.git/` dentro del ZIP entregado

Impacto:
- ruido innecesario;
- ZIP más pesado;
- análisis del repo más confuso;
- posible contaminación de diffs y de Claude Code.

Recomendación:
- endurecer `.gitignore` y reglas de limpieza;
- evitar empaquetar artefactos generados cuando se comparta el repo.

### P5. Documentación dispersa pero no encadenada
La documentación del canvas está bastante avanzada, pero falta un documento que haga de **empresa de referencia viva**.
Sin eso, la spec describe el producto, pero no siempre queda claro cómo se materializa todo junto.

Impacto:
- difícil validar cobertura real del producto;
- más ambigüedad al implementar;
- cuesta saber si una nueva feature está bien reflejada en un ejemplo completo.

Recomendación:
- introducir `Verticaler` como documento canónico y exigir sincronización con canvas spec y backlog.

---

## 3. Hallazgos de experiencia de desarrollo

### P6. Claude Code necesita una nueva fase explícita
El contrato `/tc-next` / `/tc-run` está bien encaminado, pero si backlog/registry siguen diciendo “todo terminado”, los comandos pierden utilidad práctica.

Recomendación:
- abrir nuevas épicas y tareas centradas en:
  - Verticaler bootstrap;
  - correcciones de polish;
  - documentación sincronizada;
  - revisión de infraestructura de persistencia mínima para demo durable.

### P7. Riesgo de divergencia entre producto y ejemplo
Si Verticaler no se formaliza desde ya como “empresa canónica”, en pocos ciclos volverá a quedarse desalineada con el producto real.

Recomendación:
- imponer regla documental: cambio importante en spec/backlog → evaluar actualización de Verticaler.

---

## 4. Hallazgos funcionales sin abrir nuevas features

### P8. Falta una historia de arranque coherente
Para probar el producto, un usuario debería poder:
1. abrir TheCrew;
2. ver Verticaler ya creada;
3. entrar al canvas;
4. recorrer la empresa completa sin tener que sembrar nada manualmente.

Ahora mismo ese flujo no existe.

### P9. Riesgo de datos “demasiado vacíos” incluso tras seed
Si Verticaler se implementa de forma superficial, podría resolver la pantalla vacía pero no la validación real del producto.

Recomendación:
- definir de antemano densidad mínima de datos:
  - varios departamentos;
  - varias capacidades;
  - varios workflows;
  - contratos;
  - artefactos;
  - relaciones suficientes para distintas vistas del canvas.

### P10. Saved views / chat / collaboration deben revisarse también desde la óptica de durability
No se propone abrir nuevas funcionalidades, pero sí revisar que la experiencia actual no prometa persistencia que en realidad no existe todavía.

Recomendación:
- revisar textos UX y expectativas de persistencia si siguen apoyándose en estado efímero.

---

## 5. Recomendaciones de polish prioritarias

## 5.1 Prioridad alta
- crear Verticaler automáticamente al arrancar vacío;
- introducir una estrategia realista de migraciones/bootstrapping;
- rehacer backlog y task registry para la nueva fase;
- limpiar la experiencia inicial vacía;
- revisar textos/documentación para que no prometan más persistencia de la que existe.

## 5.2 Prioridad media
- limpiar artefactos generados del repo y mejorar ignores;
- revisar naming y coherencia documental;
- asegurar que Verticaler cubre visualmente las vistas principales del canvas.

## 5.3 Prioridad baja
- endurecer packaging para compartir zips limpios;
- revisar pequeños restos de documentación histórica que ya no representen la realidad actual.

---

## 6. Qué no propone este documento

Este documento no propone:
- añadir nuevas superficies funcionales grandes del producto;
- abrir un nuevo megapivot de UX;
- cambiar el paradigma visual-first;
- tocar código directamente aquí.

La idea es cerrar ahora una fase de **solidez, demostrabilidad y coherencia**.

---

## 7. Conclusión

La mejor siguiente fase no es “meter más features”.
La mejor siguiente fase es:

## **hacer que TheCrew arranque bien, se entienda bien y se sostenga mejor**

Eso pasa por dos piezas:
- **Verticaler** como empresa de referencia viva y sembrada automáticamente;
- **polish** del estado actual para reducir incoherencias técnicas y documentales.
