# Persistence & Bootstrap Strategy — Audit + Plan

> **SUPERSEDED** — PostgreSQL persistence via Drizzle ORM has been implemented.
> All 30 repositories now have `Drizzle*Repository` implementations alongside in-memory ones.
> The `PERSISTENCE_MODE` env var (`drizzle` | `in-memory`) controls which backend is active.
> In-memory repos remain for unit tests. k3d runs with real PostgreSQL.
> This document is preserved as historical reference of the original audit.

## 1. Purpose

This document captures the honest audit of TheCrew's persistence state and defines the bootstrap strategy for Verticaler. It is the deliverable of task VRT-002.

## 2. Audit Summary

### 2.1 Current persistence reality

**Everything is in-memory. There is no database.**

| Component | Storage | Persistence | Notes |
|---|---|---|---|
| `services/platform` | `Map<string, Project>` | None (volatile) | 1 repository |
| `services/company-design` | `Map<string, Entity>` per repo | None (volatile) | 20+ repositories |
| `apps/api-gateway` | No storage | N/A | Pure HTTP proxy |
| `packages/domain-core` | No storage | N/A | Interfaces only |
| Graph projection | Computed on demand | None | Derived from entity snapshot |
| Domain events | Collected in aggregate | None | Never persisted |
| Redis | Deployed in k8s | Unused | ioredis in package.json but no code references |

### 2.2 What does NOT exist

- No ORM (TypeORM, Prisma, MikroORM, Drizzle)
- No database driver (pg, mysql2, better-sqlite3)
- No migration system (Flyway, db-migrate, custom)
- No seed scripts or fixtures
- No bootstrap/init logic on startup
- No schema files
- No event store

### 2.3 What DOES exist (and is well designed)

- Clean `Repository<T, TId>` interface in `domain-core` — backend-agnostic
- All 20+ repositories follow a uniform `InMemory*Repository` pattern
- NestJS DI with symbol-based injection — swappable implementations
- All repository methods are `async` — ready for I/O-bound backends
- DDD layered architecture (domain / application / infra) is consistent
- 100% test coverage enforced per service

### 2.4 Repository inventory

**platform (1 repo):**
- `InMemoryProjectRepository`

**company-design (20+ repos):**
- CompanyModel, Department, Capability, Contract, Workflow, Role, AgentArchetype, AgentAssignment, Skill, Policy, Artifact, Release, Chat, Comment, Review, Lock, Audit, WorkflowRun, StageExecution, Incident, ContractCompliance, SavedView

### 2.5 Infrastructure state

- k3d + Tilt for local dev
- Redis deployed but unused
- Services communicate via HTTP (api-gateway → platform/company-design)
- No database container exists in infra

## 3. Honest Assessment

Verticaler's spec (doc-25 §12) envisions "versioned data migrations" for bootstrap. The repo has **zero infrastructure** to support real migrations today.

Introducing a full database + ORM + migrations for 20+ repositories is an **epic-level effort** that would:
- touch every service and every test
- require new infra (database container, connection pooling)
- add significant operational complexity
- delay the actual goal (making TheCrew start with a usable company)

This is **not the right time** for that investment. The product is in visual-first polish phase, not scaling phase.

## 4. Bootstrap Strategy

### 4.1 Approach: In-Memory Bootstrap Modules

Create a `BootstrapService` in each service that runs on application startup (`OnModuleInit`) and seeds Verticaler data programmatically if the system is empty.

**Why this is honest:**
- It doesn't pretend to have database migrations when there is no database
- It works within the existing architecture (same `Map` stores)
- It delivers the Verticaler experience (data appears on startup)
- It's clearly scoped and documented as ephemeral
- It's the same durability as everything else in the system

**Why this is correct:**
- The `Repository` interfaces don't change
- The domain layer doesn't change
- The seed logic is explicit, ordered, and testable
- When a real DB is introduced later, the same seed logic can become a migration script

### 4.2 Bootstrap sequence

```
Application starts
  └─ OnModuleInit (BootstrapService)
       ├─ Check: are there any projects?
       │   ├─ YES → skip (idempotent)
       │   └─ NO → seed Verticaler
       │        ├─ 1. Create project (platform service)
       │        ├─ 2. Create company model
       │        ├─ 3. Create departments (9)
       │        ├─ 4. Create capabilities (16)
       │        ├─ 5. Create roles (14)
       │        ├─ 6. Create agent archetypes (14)
       │        ├─ 7. Create agent assignments
       │        ├─ 8. Create skills (14)
       │        ├─ 9. Create contracts (7)
       │        ├─ 10. Create workflows (4) with stages
       │        ├─ 11. Create policies (5)
       │        ├─ 12. Create artifacts (12)
       │        └─ 13. Create initial release (optional)
       └─ Ready to serve requests
```

### 4.3 Implementation plan

#### A. `services/platform` — Project bootstrap

Create `src/bootstrap/bootstrap.service.ts`:
- Inject `ProjectRepository`
- `OnModuleInit`: check `findAll()` → if empty, create "Verticaler" project
- Export the created project ID for cross-service coordination

**Cross-service coordination problem:** The platform service creates the project and generates its UUID. The company-design service needs that UUID to scope all entities. Options:

1. **Deterministic UUID** — Use a fixed, well-known UUID for Verticaler (e.g., `verticaler-0000-0000-0000-000000000000`). Simple, testable, no coordination needed.
2. **HTTP call** — company-design calls platform on startup. Fragile (startup order dependency).
3. **Shared config** — Both services read the same env var. Reasonable but adds config surface.

**Recommendation: Option 1 (deterministic UUID).** The Verticaler project uses a well-known constant ID defined in `shared-types`. Both services reference it. This is the simplest approach and makes testing trivial.

#### B. `services/company-design` — Entity bootstrap

Create `src/bootstrap/bootstrap.service.ts`:
- Inject all needed repositories
- `OnModuleInit`: check if company model exists for Verticaler project ID → if not, seed everything
- Seed functions organized by entity type, called in dependency order
- Each seed function creates entities via domain factories (`Entity.create(...)`) and saves via repositories

#### C. `packages/shared-types` — Constants

Add Verticaler constants:
```typescript
export const VERTICALER_PROJECT_ID = 'verticaler-0000-0000-0000-000000000000'
export const VERTICALER_PROJECT_NAME = 'Verticaler'
```

### 4.4 Idempotency rules

1. Bootstrap checks existence before seeding (not "always insert")
2. Uses deterministic IDs for all Verticaler entities (predictable, testable)
3. Running bootstrap twice produces the same state
4. If a user deletes Verticaler entities via the UI, they stay deleted until restart

### 4.5 Testability

- Unit tests for each seed function (produces correct entities)
- Integration test: bootstrap on empty system → verify all entities exist
- Integration test: bootstrap on non-empty system → verify no changes
- Existing tests unaffected (they create fresh repositories per test)

### 4.6 What this does NOT solve (and shouldn't yet)

| Concern | Status | When to solve |
|---|---|---|
| Data survives restart | No | When a database is introduced |
| Real versioned migrations | No | When a database is introduced |
| Incremental Verticaler updates | No | When migration infra exists |
| Multi-instance consistency | No | When a database is introduced |
| Event persistence | No | When an event store is introduced |
| Redis as data store | Not recommended | Redis is for pub/sub, not primary storage |

## 5. Future Path to Real Persistence

When the time comes to add a database, the path is clear:

1. Choose an ORM or query builder (recommendation: Drizzle or MikroORM for DDD alignment)
2. Add a PostgreSQL container to infra
3. For each `InMemory*Repository`, create a `Postgres*Repository` implementing the same interface
4. Swap the DI binding in each module (change `useClass`)
5. Convert bootstrap seed logic into proper migration scripts
6. All existing tests continue to work (they inject `InMemory*` directly)

The repository pattern was designed for exactly this swap. No domain or application layer changes needed.

## 6. Risks

| Risk | Mitigation |
|---|---|
| Bootstrap logic grows complex | Keep seed data in declarative structures, not imperative code |
| Startup order between services | Deterministic UUID eliminates cross-service startup dependency |
| Seed data diverges from doc-25 spec | Seed constants reference Verticaler spec sections explicitly |
| Bootstrap slows down startup | 20+ Map inserts are sub-millisecond; negligible |

## 7. Decision Record

| Decision | Rationale |
|---|---|
| In-memory bootstrap, not database | No DB exists; adding one is out of scope for this phase |
| Deterministic UUIDs for Verticaler | Eliminates cross-service coordination; testable; predictable |
| `OnModuleInit` lifecycle hook | NestJS standard; runs after DI is ready, before HTTP |
| Seed via domain factories | Respects domain invariants; produces valid aggregates |
| Skip if not empty | Idempotent; respects user-created data |
| Constants in shared-types | Single source of truth for cross-service references |

## 8. Acceptance Criteria for VRT-002

- [x] Audit completed: every module's persistence state documented
- [x] Strategy defined: in-memory bootstrap with deterministic IDs
- [x] Cross-service coordination solved: shared constant in `shared-types`
- [x] Implementation plan written: per-service bootstrap modules
- [x] Idempotency rules defined
- [x] Future persistence path documented
- [x] Risks identified and mitigated
- [x] Honest about limitations (no durability, no real migrations)
