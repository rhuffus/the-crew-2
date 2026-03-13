import { Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { RuntimeController } from './application/runtime.controller'
import { RuntimeService } from './application/runtime.service'
import { RuntimeStatusProjector } from './application/runtime-status.projector'
import { InMemoryRuntimeExecutionRepository } from './infra/in-memory-runtime-execution.repository'
import { InMemoryRuntimeEventRepository } from './infra/in-memory-runtime-event.repository'
import { DrizzleRuntimeExecutionRepository } from './infra/drizzle-runtime-execution.repository'
import { DrizzleRuntimeEventRepository } from './infra/drizzle-runtime-event.repository'
import {
  RUNTIME_EXECUTION_REPOSITORY,
  RUNTIME_EVENT_REPOSITORY,
} from './domain/runtime-repository'

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [RuntimeController],
  providers: [
    RuntimeService,
    RuntimeStatusProjector,
    {
      provide: RUNTIME_EXECUTION_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleRuntimeExecutionRepository
        : InMemoryRuntimeExecutionRepository,
    },
    {
      provide: RUNTIME_EVENT_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleRuntimeEventRepository
        : InMemoryRuntimeEventRepository,
    },
  ],
  exports: [RuntimeService],
})
export class RuntimeModule {}
