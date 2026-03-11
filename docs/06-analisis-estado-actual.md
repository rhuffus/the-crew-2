# Análisis del estado actual del repo

## Resumen ejecutivo
El repositorio está bien encaminado para un producto de diseño de dominio administrativo.
No está todavía orientado al nuevo producto visual-first.

## Lo que ya existe y conviene conservar
### Backend / dominio
- `platform-service` con contexto de Projects
- `company-design-service` con módulos de dominio y CRUD para:
  - company model
  - departments
  - capabilities
  - roles
  - agent archetypes
  - agent assignments
  - skills
  - contracts
  - workflows
  - policies
  - releases
  - validations
  - audit
- `api-gateway` como entrada web
- `domain-core` con piezas DDD básicas

### Frontend
- shell general
- rutas por módulo
- hooks/api por entidad
- formularios, listas, cards y paneles de validación
- visualización ligera de workflows

### Calidad
- Vitest y coverage thresholds al 100% ya configurados en los workspaces existentes
- buena cobertura unitaria de módulos actuales

## Lo que falta respecto al pivot visual-first
### Producto / UX
- canvas central como experiencia principal
- semantic zoom
- inspector contextual fuerte
- explorer sincronizado con canvas
- capas/filtros visuales
- chat persistente por scope

### Modelo / BFF
- DTO de grafo visual
- mapeo semántico → visual
- ids de nodos y edges estables
- endpoints/query layer orientados al canvas

### Runtime / infraestructura
- no se aprecia implementación visible de comunicación real por Redis entre micros
- los repositorios actuales son en memoria en varios módulos
- no se aprecia Playwright todavía
- auth y operations siguen pendientes

## Conclusión estratégica
No hay que tirar el trabajo existente.
Hay que usarlo como **base semántica** sobre la que construir un nuevo plano visual.

## Implicación práctica
El pivot no es:
- rehacer el dominio
- borrar listados y formularios

El pivot sí es:
- cambiar la interfaz principal
- introducir graph projection
- hacer del canvas el centro del producto
