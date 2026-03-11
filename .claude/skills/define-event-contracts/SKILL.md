---
name: define-event-contracts
description: Diseñar contratos de eventos entre microservicios NestJS usando Redis.
allowed-tools: Read,Write,Edit,MultiEdit,Grep,Glob,LS
---

Reglas:
- no usar integración síncrona entre micros
- documentar nombre del evento, payload, emisor, consumidores e idempotencia
- versionar contratos si cambia el payload
- no mezclar eventos de dominio con eventos técnicos
