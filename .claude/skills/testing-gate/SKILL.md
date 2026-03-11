---
name: testing-gate
description: Aplicar el gate de calidad y tests antes de cerrar cualquier cambio.
disable-model-invocation: true
allowed-tools: Read,Write,Edit,MultiEdit,Grep,Glob,LS,Bash
---

Antes de declarar una tarea completada:
1. lint
2. typecheck
3. tests unitarios
4. tests integración/funcionales
5. e2e/playwright si aplica
6. regresión del área
7. revisar cobertura del scope
