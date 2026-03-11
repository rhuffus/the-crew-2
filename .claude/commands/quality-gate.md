---
name: quality-gate
description: Ejecuta el gate de calidad antes de cerrar una tarea
disable-model-invocation: true
---

Ejecuta o verifica:
1. lint
2. typecheck
3. unit tests
4. integration/functional tests del área tocada
5. e2e/playwright si cambia UI o un flujo visible
6. regresión de lo existente
7. cobertura al 100% en el scope afectado

Si algo falla:
- no cerrar la tarea
- explicar el fallo
- proponer corrección
