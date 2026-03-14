import { Module } from '@nestjs/common'
import { RolesController } from './roles.controller'
import { RoleService } from './application/role.service'
import { PrismaRoleRepository } from './infra/prisma-role.repository'
import { ROLE_REPOSITORY } from './domain/role-repository'

@Module({
  controllers: [RolesController],
  providers: [
    RoleService,
    {
      provide: ROLE_REPOSITORY,
      useClass: PrismaRoleRepository,
    },
  ],
  exports: [ROLE_REPOSITORY],
})
export class RolesModule {}
