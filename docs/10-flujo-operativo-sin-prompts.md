# Flujo operativo sin prompts manuales

## Objetivo
Hacer que el uso diario de Claude Code en TheCrew sea casi mecánico.

## Rutina deseada
### 1. Abrir sesión
Para tareas de análisis o arquitectura:
```bash
.claude/bin/tc-plan
```

Para tareas de implementación claras:
```bash
.claude/bin/tc-edit
```

### 2. Decidir siguiente tarea
En Claude Code:
```text
/tc-next
```

Eso debe bastar para obtener:
- tarea siguiente
- modo recomendado
- necesidad de sesión nueva
- lista paralelizable
- comando siguiente exacto

### 3. Ejecutar tarea
En Claude Code:
```text
/tc-run VIS-001
```

Eso debe bastar para arrancar la tarea.

## Qué sí puede automatizar este setup
- memoria de proyecto y reglas persistentes
- decisión de siguiente tarea
- validación de dependencias
- ejecución disciplinada por task-id
- recordatorio de higiene de sesión al arrancar
- gates de calidad y actualización del registry

## Qué no resuelve por sí solo
- cerrar por sí mismo una sesión interactiva ya abierta
- relanzarse automáticamente en otro modo desde dentro de esa misma sesión

## Interpretación correcta
Por tanto, el contrato realista es:
- `/tc-next` decide y te dice si debes reiniciar
- tú reinicias si corresponde
- `/tc-run <task-id>` ejecuta

## Reglas para minimizar gasto/contexto
- una tarea por sesión
- preferir plan para tareas nuevas o estructurales
- pasar a edit solo cuando la tarea ya esté cerrada conceptualmente
- si la sesión ya mezcló exploración y ejecución, reiniciar antes de la siguiente tarea
