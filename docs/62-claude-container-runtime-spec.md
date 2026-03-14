# Claude Code Container Runtime Spec

## Objetivo
Poder ejecutar Claude Code dentro de contenedores Docker para tareas controladas de agentes.

## Contexto
El objetivo no es aún una granja de agentes enterprise.
El objetivo es un primer runtime reproducible y honesto para local/dev.

## Principio rector
TheCrew no ejecuta Claude Code directamente desde el frontend ni como shell arbitrario.
Lo hace a través de un **Runtime Manager** controlado.

## Componentes propuestos

### 1. Runtime Orchestrator Adapter
Servicio de aplicación que recibe una intención de ejecución:
- qué agente
- qué tarea
- qué contexto
- qué documentos
- qué workspace
- qué budget
- qué timeout

y la traduce a una ejecución concreta.

### 2. Claude Runner Container
Contenedor efímero que:
- monta un workspace limitado
- recibe el prompt/contexto estructurado
- ejecuta `claude`
- devuelve outputs estructurados
- persiste artefactos/resultados al sistema

### 3. Execution Envelope
Contrato de entrada para el contenedor:
- executionId
- projectId
- agentId
- taskType
- instruction
- context bundle
- input docs
- allowed outputs
- budget caps
- timeout
- run mode

### 4. Result Envelope
Contrato de salida:
- stdout summary
- generated docs
- generated proposals
- generated decisions
- status
- cost approximation
- timestamps
- error info

## Restricciones de esta fase
- local/dev only
- trusted repositories only
- no asumir multiusuario seguro
- no asumir aislamiento perfecto
- no usarlo como entorno hostil

## Estándar de ejecución recomendado
1. preparar workspace por ejecución
2. montar documentos relevantes
3. inyectar definición del agente
4. inyectar tarea concreta
5. ejecutar `claude`
6. capturar resultado estructurado
7. persistir outputs
8. emitir eventos runtime

## Modelo de workspace
Cada ejecución debería usar un workspace aislado por:
- project
- agent
- execution id

Puede ser:
- directorio efímero
- volumen temporal
- copia mínima de docs/contexto
- repositorio de trabajo si la tarea lo requiere

## Runtime bridge mínimo
Primera iteración:
- una sola imagen base `claude-runner`
- un launcher service en backend
- ejecución one-shot
- logs resumidos
- timeout duro
- policy simple de reintentos

## Autenticación / credenciales
Esta fase debe documentar explícitamente cómo se autentica Claude Code en el contenedor y qué limitaciones tiene según el plan usado.

## Seguridad mínima
- no montar el repo completo sin necesidad
- no montar credenciales innecesarias
- lista de comandos/paths permitidos
- límites de tiempo y memoria
- kill/cleanup garantizado

## Budgets, Timeouts, Retries & Cleanup (AIR-019)

### Budget Caps
Each task type defines default budget caps via `TASK_TYPE_DEFAULTS` in shared-types:
- `maxTokens`: declared token budget (post-hoc check — Claude CLI does not enforce this natively)
- `maxCostUsd`: declared cost budget (post-hoc tracking only in this phase)
- `maxTurns`: enforced via `--max-turns` CLI flag

Budget enforcement is **best-effort** for local/dev:
- Token usage is checked after execution and flagged via `budgetExceeded` in ResultEnvelope
- Cost tracking relies on `costApproximation` in the result (output tokens x estimated rate)
- Hard enforcement requires API-level quota management (not available in CLI mode)

### Timeout Stack
| Layer | Value | Purpose |
|---|---|---|
| Claude CLI | `EXECUTION_TIMEOUT` env var | Soft timeout for the Claude process |
| Docker container | `timeout + 30s` grace | Hard kill if process doesn't exit |
| Node.js execFile | Same as Docker | OS-level process kill |
| Temporal activity | 660s (max + grace) | Workflow-level safety net |
| Safety limits | 10s min, 600s max | Clamped in Execution domain |

### Retry Strategy
| Layer | Policy | Purpose |
|---|---|---|
| ClaudeRunnerService | Up to `maxRetries` (per task type) | Retry on task failure or timeout |
| Temporal activity | 2 attempts, 10s initial, 2x backoff | Retry on infra failure (Docker/network) |
| Bootstrap workflow | 2 attempts via Temporal | Retry on transient errors |

### Container Cleanup
- `--rm` flag on `docker run` ensures containers are removed on normal exit
- `--name` with execution ID allows targeted cleanup
- `--label the-crew.runner=true` enables bulk cleanup of stale containers
- `forceRemoveContainer()` runs after hard timeout kills
- `cleanupStaleContainers()` available for periodic maintenance
- Temp workspace directories cleaned in `finally` block

### Resource Limits
| Resource | Limit | Source |
|---|---|---|
| Memory | 512 MB | `RUNTIME_SAFETY_LIMITS.defaultMemoryMb` |
| CPUs | 1 | `RUNTIME_SAFETY_LIMITS.defaultCpus` |
| PIDs | 100 | `RUNTIME_SAFETY_LIMITS.containerPidsLimit` |
| Network | none | `--network none` |
| Buffer | 10 MB | `RUNTIME_SAFETY_LIMITS.containerMaxBufferBytes` |

## Limitaciones de seguridad — local/dev only

### Lo que SI esta implementado
- Contenedores efimeros con `--rm` y cleanup garantizado
- Aislamiento de red (`--network none`)
- Limites de memoria, CPU y procesos
- Workspace aislado por ejecucion (directorio temporal)
- Timeouts duros con kill + force-remove
- Container labels para tracking y cleanup
- Budget caps declarados con tracking post-hoc

### Lo que NO esta implementado (requiere produccion)
- **Autenticacion multi-tenant**: la API key se inyecta como env var. En produccion se necesitaria vault/secrets manager por tenant.
- **Aislamiento de secretos**: la misma `ANTHROPIC_API_KEY` se comparte entre todos los contenedores. Sin separacion por proyecto o usuario.
- **Sandboxing profundo**: no hay `seccomp` profiles, `AppArmor`/`SELinux` policies, ni `gVisor`. El contenedor corre con privilegios normales de Docker.
- **Cuota de API**: no hay rate limiting ni control de gasto real contra la API de Anthropic. `maxCostUsd` es informativo.
- **Persistencia de artefactos**: los outputs viven solo en el workspace temporal. Si el resultado no se persiste correctamente, se pierden.
- **Auditoria**: no hay audit log inmutable de ejecuciones. Los registros dependen de la persistencia en company-design.
- **Container image verification**: la imagen `claude-runner:latest` no se verifica con digest/signature.
- **Concurrent execution limits**: no hay limite al numero de contenedores simultaneos. En local/dev esto no es critico, pero en produccion se necesita un pool.

### Lo que cambiaria para produccion
1. Secrets management (HashiCorp Vault, AWS Secrets Manager)
2. Per-tenant API keys con cuotas
3. gVisor o Firecracker para aislamiento real
4. Rate limiting y circuit breaker en el Runtime Manager
5. Persistent artifact storage (S3/GCS)
6. Immutable audit log
7. Image signing y verification
8. Execution pool con limites de concurrencia
9. Monitoring y alertas (token usage, cost, failures)
10. Network policies granulares (permitir solo API de Anthropic)
