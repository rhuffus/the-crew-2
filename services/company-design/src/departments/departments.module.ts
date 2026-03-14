import { Module } from '@nestjs/common'
import { DepartmentsController } from './departments.controller'
import { DepartmentService } from './application/department.service'
import { PrismaDepartmentRepository } from './infra/prisma-department.repository'
import { DEPARTMENT_REPOSITORY } from './domain/department-repository'

@Module({
  controllers: [DepartmentsController],
  providers: [
    DepartmentService,
    {
      provide: DEPARTMENT_REPOSITORY,
      useClass: PrismaDepartmentRepository,
    },
  ],
  exports: [DEPARTMENT_REPOSITORY],
})
export class DepartmentsModule {}
