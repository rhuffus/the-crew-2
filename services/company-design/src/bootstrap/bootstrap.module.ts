import { Module } from '@nestjs/common'
import { CompanyModelModule } from '../company-model/company-model.module'
import { DepartmentsModule } from '../departments/departments.module'
import { CapabilitiesModule } from '../capabilities/capabilities.module'
import { RolesModule } from '../roles/roles.module'
import { SkillsModule } from '../skills/skills.module'
import { AgentArchetypesModule } from '../agent-archetypes/agent-archetypes.module'
import { AgentAssignmentsModule } from '../agent-assignments/agent-assignments.module'
import { ContractsModule } from '../contracts/contracts.module'
import { WorkflowsModule } from '../workflows/workflows.module'
import { PoliciesModule } from '../policies/policies.module'
import { ArtifactsModule } from '../artifacts/artifacts.module'
import { BootstrapService } from './bootstrap.service'

@Module({
  imports: [
    CompanyModelModule,
    DepartmentsModule,
    CapabilitiesModule,
    RolesModule,
    SkillsModule,
    AgentArchetypesModule,
    AgentAssignmentsModule,
    ContractsModule,
    WorkflowsModule,
    PoliciesModule,
    ArtifactsModule,
  ],
  providers: [BootstrapService],
})
export class BootstrapModule {}
