import { Module } from '@nestjs/common'
import { isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { RolesController } from './roles.controller'
import { RoleService } from './application/role.service'
import { InMemoryRoleRepository } from './infra/in-memory-role.repository'
import { DrizzleRoleRepository } from './infra/drizzle-role.repository'
import { ROLE_REPOSITORY } from './domain/role-repository'

@Module({
  controllers: [RolesController],
  providers: [
    RoleService,
    {
      provide: ROLE_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleRoleRepository
        : InMemoryRoleRepository,
    },
  ],
  exports: [ROLE_REPOSITORY],
})
export class RolesModule {}
