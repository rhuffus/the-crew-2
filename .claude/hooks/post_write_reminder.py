#!/usr/bin/env python3
import json
import sys

json.load(sys.stdin)
print(json.dumps({
    "decision": "approve",
    "message": "Recuerda: /quality-gate antes de cerrar y actualiza docs/09-task-registry.md si esta escritura cambia el estado real de una tarea o el roadmap."
}))
