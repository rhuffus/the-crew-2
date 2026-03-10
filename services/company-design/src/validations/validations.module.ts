import { Module } from '@nestjs/common'
import { ValidationsController } from './validations.controller'
import { ValidationService } from './application/validation.service'
import { ValidationEngine } from './application/validation-engine'
import { CompanyModelModule } from '../company-model/company-model.module'
import { DepartmentsModule } from '../departments/departments.module'
import { CapabilitiesModule } from '../capabilities/capabilities.module'
import { ContractsModule } from '../contracts/contracts.module'
import { WorkflowsModule } from '../workflows/workflows.module'
import { RolesModule } from '../roles/roles.module'
import { AgentArchetypesModule } from '../agent-archetypes/agent-archetypes.module'
import { AgentAssignmentsModule } from '../agent-assignments/agent-assignments.module'
import { SkillsModule } from '../skills/skills.module'
import { PoliciesModule } from '../policies/policies.module'

@Module({
  imports: [
    CompanyModelModule,
    DepartmentsModule,
    CapabilitiesModule,
    RolesModule,
    AgentArchetypesModule,
    AgentAssignmentsModule,
    SkillsModule,
    ContractsModule,
    WorkflowsModule,
    PoliciesModule,
  ],
  controllers: [ValidationsController],
  providers: [ValidationService, ValidationEngine],
  exports: [ValidationEngine],
})
export class ValidationsModule {}
