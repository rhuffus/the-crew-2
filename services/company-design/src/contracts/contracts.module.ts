import { Module } from '@nestjs/common'
import { isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { ContractsController } from './contracts.controller'
import { ContractService } from './application/contract.service'
import { InMemoryContractRepository } from './infra/in-memory-contract.repository'
import { DrizzleContractRepository } from './infra/drizzle-contract.repository'
import { CONTRACT_REPOSITORY } from './domain/contract-repository'

@Module({
  controllers: [ContractsController],
  providers: [
    ContractService,
    {
      provide: CONTRACT_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleContractRepository
        : InMemoryContractRepository,
    },
  ],
  exports: [CONTRACT_REPOSITORY],
})
export class ContractsModule {}
