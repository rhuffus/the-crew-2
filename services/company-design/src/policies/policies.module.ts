import { Module } from '@nestjs/common'
import { isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { PoliciesController } from './policies.controller'
import { PolicyService } from './application/policy.service'
import { InMemoryPolicyRepository } from './infra/in-memory-policy.repository'
import { DrizzlePolicyRepository } from './infra/drizzle-policy.repository'
import { POLICY_REPOSITORY } from './domain/policy-repository'

@Module({
  controllers: [PoliciesController],
  providers: [
    PolicyService,
    {
      provide: POLICY_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzlePolicyRepository
        : InMemoryPolicyRepository,
    },
  ],
  exports: [POLICY_REPOSITORY],
})
export class PoliciesModule {}
