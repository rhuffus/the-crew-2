import { Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { RuntimeController } from './application/runtime.controller'
import { RuntimeService } from './application/runtime.service'
import { RuntimeStatusProjector } from './application/runtime-status.projector'
import { PrismaRuntimeExecutionRepository } from './infra/prisma-runtime-execution.repository'
import { PrismaRuntimeEventRepository } from './infra/prisma-runtime-event.repository'
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
      useClass: PrismaRuntimeExecutionRepository,
    },
    {
      provide: RUNTIME_EVENT_REPOSITORY,
      useClass: PrismaRuntimeEventRepository,
    },
  ],
  exports: [RuntimeService],
})
export class RuntimeModule {}
