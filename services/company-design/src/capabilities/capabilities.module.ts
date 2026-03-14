import { Module } from '@nestjs/common'
import { CapabilitiesController } from './capabilities.controller'
import { CapabilityService } from './application/capability.service'
import { PrismaCapabilityRepository } from './infra/prisma-capability.repository'
import { CAPABILITY_REPOSITORY } from './domain/capability-repository'

@Module({
  controllers: [CapabilitiesController],
  providers: [
    CapabilityService,
    {
      provide: CAPABILITY_REPOSITORY,
      useClass: PrismaCapabilityRepository,
    },
  ],
  exports: [CAPABILITY_REPOSITORY],
})
export class CapabilitiesModule {}
