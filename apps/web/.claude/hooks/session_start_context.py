#!/usr/bin/env python3
import json
import sys

payload = json.load(sys.stdin)
permission_mode = payload.get("permission_mode", "unknown")
source = payload.get("source", "startup")

context = f"""Sesión iniciada. source={source}. permission_mode={permission_mode}.
Reglas del repo:
- ejecuta /tc-next antes de empezar si no hay task-id explícito
- /tc-next debe bastar para decidir la siguiente tarea
- /tc-run <task-id> debe bastar para ejecutar la tarea
- preferir una tarea por sesión
- si la tarea es grande o toca arquitectura/canvas, conviene sesión nueva en plan mode
- antes de cerrar, ejecuta /quality-gate y actualiza docs/09-task-registry.md si cambió el estado real"""

print(json.dumps({
    "hookSpecificOutput": {
        "hookEventName": "SessionStart",
        "additionalContext": context
    }
}))
