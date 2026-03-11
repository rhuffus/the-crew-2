---
name: session-hygiene
description: Evaluar si la sesión actual sigue siendo apta o conviene reiniciar antes de seguir.
allowed-tools: Read,Grep,Glob,LS
---

Evalúa:
- si se mezclan varias tareas
- si el contexto es demasiado amplio
- si cambió la naturaleza del trabajo (plan → edit o edit → plan)
- si conviene cerrar y abrir sesión nueva

Responde con:
- keep-session: yes|no
- recommended-next-mode: plan|edit
- reason
