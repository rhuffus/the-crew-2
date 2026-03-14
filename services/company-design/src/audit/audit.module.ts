import { Global, Module } from '@nestjs/common'
import { AuditController } from './audit.controller'
import { AuditService } from './application/audit.service'
import { PrismaAuditRepository } from './infra/prisma-audit.repository'
import { AUDIT_REPOSITORY } from './domain/audit-repository'

@Global()
@Module({
  controllers: [AuditController],
  providers: [
    AuditService,
    {
      provide: AUDIT_REPOSITORY,
      useClass: PrismaAuditRepository,
    },
  ],
  exports: [AuditService],
})
export class AuditModule {}
