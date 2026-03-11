# Estrategia MCP para TheCrew

## Recomendación
Empieza con pocos MCPs, todos confiables y justificados.

## MCPs potenciales
- filesystem local
- GitHub
- Jira o Linear
- documentación interna
- navegador/controlado si de verdad hace falta

## No activar aún
- MCPs de scraping genérico
- MCPs de fuentes no confiables
- MCPs que puedan traer contenido arbitrario sin necesidad

## Motivo
MCP amplía muchísimo el poder de Claude Code, pero también el riesgo de introducir datos no confiables o flujos inseguros.

## Estrategia de adopción
1. arrancar sin MCP o con filesystem mínimo
2. añadir GitHub cuando el repo exista
3. añadir tracker de tareas cuando haya backlog operativo real
4. documentar cada MCP: propósito, riesgos y dueño
