import { Module } from '@nestjs/common'
import { PoliciesController } from './policies.controller'
import { PolicyService } from './application/policy.service'
import { InMemoryPolicyRepository } from './infra/in-memory-policy.repository'
import { POLICY_REPOSITORY } from './domain/policy-repository'

@Module({
  controllers: [PoliciesController],
  providers: [
    PolicyService,
    { provide: POLICY_REPOSITORY, useClass: InMemoryPolicyRepository },
  ],
  exports: [POLICY_REPOSITORY],
})
export class PoliciesModule {}
