import { Module } from '@nestjs/common'
import { isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { CapabilitiesController } from './capabilities.controller'
import { CapabilityService } from './application/capability.service'
import { InMemoryCapabilityRepository } from './infra/in-memory-capability.repository'
import { DrizzleCapabilityRepository } from './infra/drizzle-capability.repository'
import { CAPABILITY_REPOSITORY } from './domain/capability-repository'

@Module({
  controllers: [CapabilitiesController],
  providers: [
    CapabilityService,
    {
      provide: CAPABILITY_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleCapabilityRepository
        : InMemoryCapabilityRepository,
    },
  ],
  exports: [CAPABILITY_REPOSITORY],
})
export class CapabilitiesModule {}
