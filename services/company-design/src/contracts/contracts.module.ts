import { Module } from '@nestjs/common'
import { ContractsController } from './contracts.controller'
import { ContractService } from './application/contract.service'
import { PrismaContractRepository } from './infra/prisma-contract.repository'
import { CONTRACT_REPOSITORY } from './domain/contract-repository'

@Module({
  controllers: [ContractsController],
  providers: [
    ContractService,
    {
      provide: CONTRACT_REPOSITORY,
      useClass: PrismaContractRepository,
    },
  ],
  exports: [CONTRACT_REPOSITORY],
})
export class ContractsModule {}
