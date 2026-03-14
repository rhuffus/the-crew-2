# ADR-73: Redis Streams + CQRS Architecture

## Status
**Accepted** — 2026-03-14

## Context

TheCrew is a microservices platform composed of:
- Multiple backend microservices (NestJS)
- A web admin panel (React)
- A BFF layer

Until now, microservices communicated via direct HTTP calls between services (e.g., api-gateway proxying to company-design, temporal-worker fetching credentials from platform). This creates tight coupling, synchronous blocking, and fragile inter-service dependencies.

## Decision

### 1. Redis Streams as the ONLY inter-service communication

All microservice-to-microservice communication MUST happen through **typed messages on Redis Streams**. No direct HTTP calls between microservices.

- Each domain event is a typed message published to a Redis Stream
- Consumer groups ensure reliable, at-least-once delivery
- Message schemas are defined in `packages/shared-types` as TypeScript interfaces
- Every message has: `eventId`, `eventType`, `aggregateId`, `timestamp`, `payload`

### 2. Database per microservice (Redis)

Each microservice owns its **own Redis database** (using Redis DB index or separate key namespace) as its **source of truth**.

- No microservice reads from another service's database
- Data is shared exclusively through domain events on Redis Streams
- Each service is the sole authority for its domain data

### 3. web-bff service (Backend for Frontend)

A new service called `web-bff` replaces the current api-gateway as the backend for the web admin panel:

- **MongoDB** for materialized views — optimized read models for every screen the web-admin needs
- Subscribes to Redis Streams to build and maintain materialized views via event projections
- Exposes **REST API** for commands (write operations) from the web-admin
- Maintains a **WebSocket** connection with the web-admin for real-time event delivery

### 4. web-admin communication pattern (CQRS + Optimistic Updates)

The web-admin (React frontend) follows a strict CQRS pattern:

**Commands (writes):**
- web-admin sends REST POST/PUT/DELETE to web-bff
- web-admin applies **optimistic update** immediately (UI reflects the change instantly)
- web-admin does NOT wait for the REST response to update the UI
- The REST call triggers a command that propagates through Redis Streams

**Queries (reads):**
- Initial data loads via REST GET from web-bff (reading materialized views from MongoDB)
- Real-time updates arrive via **WebSocket** from web-bff

**Event flow:**
1. User action in web-admin → optimistic update in UI
2. REST call to web-bff → web-bff publishes command to Redis Stream
3. Target microservice processes command → publishes domain event to Redis Stream
4. web-bff receives domain event → updates MongoDB materialized view → filters and forwards to web-admin via WebSocket
5. web-admin receives WebSocket event → reconciles with optimistic state (confirms or rolls back)

### 5. DDD + CQRS everywhere

- **DDD**: Each microservice owns a bounded context with its own aggregates, entities, value objects, domain events, and repositories
- **CQRS**: Command side (Redis as source of truth per service) is strictly separated from Query side (MongoDB materialized views in web-bff)
- Domain events are the contract between bounded contexts
- No shared database, no shared state

## Architecture Diagram

```
web-admin (React)
    |           ^
    | REST      | WebSocket
    | (commands)| (domain events)
    v           |
  web-bff (NestJS)
    |   ^           |
    |   |           | MongoDB (materialized views)
    v   |
  Redis Streams ──────────────────────────
    |       |       |       |       |
    v       v       v       v       v
  svc-A   svc-B   svc-C   svc-D   svc-E
  (Redis)  (Redis) (Redis) (Redis) (Redis)
```

## Consequences

### Positive
- Full decoupling between microservices
- Real-time UI updates via WebSocket (no polling)
- Instant UI feedback via optimistic updates
- Independent scalability per service
- Event sourcing capability (Redis Streams retain history)
- Clear read/write separation (CQRS)

### Negative
- Eventual consistency (materialized views may lag behind source of truth)
- More infrastructure complexity (Redis Streams, MongoDB, WebSocket)
- Need robust event schema versioning
- Need idempotent event handlers
- Rollback logic for failed optimistic updates

### Migration Impact
- PostgreSQL is replaced by Redis per microservice + MongoDB for web-bff
- Direct HTTP inter-service calls are eliminated
- api-gateway is replaced by web-bff
- All existing repositories need migration to Redis
- New event contracts must be defined for all domain events

## Rules

1. **NO direct HTTP calls between microservices** — only Redis Streams
2. **NO shared databases** — each service owns its Redis DB
3. **web-bff is the ONLY backend the web-admin talks to**
4. **WebSocket is the ONLY channel for server-to-client events**
5. **Optimistic updates are MANDATORY** — the UI never waits for backend confirmation
6. **All inter-service messages MUST be typed** — defined in shared-types
7. **MongoDB in web-bff is for reads ONLY** — it's a projection, not a source of truth
