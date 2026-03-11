# Verticaler — smoke test manual

Checklist manual rápido para validar que TheCrew arranca bien con la empresa de referencia.

## Arranque
- [ ] Arranco TheCrew en entorno vacío.
- [ ] Aparece automáticamente un proyecto llamado `Verticaler`.
- [ ] No he tenido que crear nada manualmente.

## Entrada
- [ ] Entro en Verticaler desde la home.
- [ ] El canvas carga sin errores.
- [ ] El nivel inicial muestra una visión general de la empresa.

## Navegación
- [ ] Puedo entrar en un departamento.
- [ ] Puedo entrar en un workflow.
- [ ] Puedo llegar a un nivel más profundo.
- [ ] El breadcrumb permite volver atrás.

## Canvas
- [ ] Hay suficientes nodos y relaciones para entender la empresa.
- [ ] Los filtros/vistas principales cambian la lectura del mapa.
- [ ] Los artefactos aparecen donde corresponde.

## Inspector
- [ ] Al pulsar un nodo se abre el panel derecho.
- [ ] Al pulsar una relación se abre el inspector de edge.
- [ ] Puedo revisar overview, properties y relaciones en los elementos principales.

## Cobertura semántica
- [ ] Verticaler tiene company model.
- [ ] Verticaler tiene departamentos.
- [ ] Verticaler tiene capacidades.
- [ ] Verticaler tiene roles.
- [ ] Verticaler tiene agentes.
- [ ] Verticaler tiene skills.
- [ ] Verticaler tiene contratos.
- [ ] Verticaler tiene workflows.
- [ ] Verticaler tiene policies.
- [ ] Verticaler tiene artifacts.

## Persistencia / bootstrap
- [ ] Reinicio el entorno y Verticaler sigue disponible según el contrato definido.
- [ ] No se crean duplicados de Verticaler.
- [ ] El bootstrap es idempotente.
