import { Global, Module } from '@nestjs/common'
import { isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { AuditController } from './audit.controller'
import { AuditService } from './application/audit.service'
import { InMemoryAuditRepository } from './infra/in-memory-audit.repository'
import { DrizzleAuditRepository } from './infra/drizzle-audit.repository'
import { AUDIT_REPOSITORY } from './domain/audit-repository'

@Global()
@Module({
  controllers: [AuditController],
  providers: [
    AuditService,
    {
      provide: AUDIT_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleAuditRepository
        : InMemoryAuditRepository,
    },
  ],
  exports: [AuditService],
})
export class AuditModule {}
