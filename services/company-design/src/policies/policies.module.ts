import { Module } from '@nestjs/common'
import { PoliciesController } from './policies.controller'
import { PolicyService } from './application/policy.service'
import { PrismaPolicyRepository } from './infra/prisma-policy.repository'
import { POLICY_REPOSITORY } from './domain/policy-repository'

@Module({
  controllers: [PoliciesController],
  providers: [
    PolicyService,
    {
      provide: POLICY_REPOSITORY,
      useClass: PrismaPolicyRepository,
    },
  ],
  exports: [POLICY_REPOSITORY],
})
export class PoliciesModule {}
