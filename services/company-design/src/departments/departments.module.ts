import { Module } from '@nestjs/common'
import { isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { DepartmentsController } from './departments.controller'
import { DepartmentService } from './application/department.service'
import { InMemoryDepartmentRepository } from './infra/in-memory-department.repository'
import { DrizzleDepartmentRepository } from './infra/drizzle-department.repository'
import { DEPARTMENT_REPOSITORY } from './domain/department-repository'

@Module({
  controllers: [DepartmentsController],
  providers: [
    DepartmentService,
    {
      provide: DEPARTMENT_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleDepartmentRepository
        : InMemoryDepartmentRepository,
    },
  ],
  exports: [DEPARTMENT_REPOSITORY],
})
export class DepartmentsModule {}
