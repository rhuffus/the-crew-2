#!/usr/bin/env python3
import json
import sys

payload = json.load(sys.stdin)
tool_input = payload.get("tool_input", {})
cmd = tool_input.get("command", "")
blocked = [
    "rm -rf /",
    "sudo rm -rf",
    "mkfs",
    "dd if=",
    "shutdown",
    "reboot",
    ":(){ :|:& };:",
]
for token in blocked:
    if token in cmd:
        print(json.dumps({
            "decision": "block",
            "reason": f"Blocked dangerous shell pattern: {token}"
        }))
        sys.exit(0)

print(json.dumps({"decision": "approve"}))
